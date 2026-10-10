// Vercel serverless function: valida a encomenda e cria uma sessão do Stripe Checkout.
// Requer a variável de ambiente STRIPE_SECRET_KEY (sk_test_... ou sk_live_...).
// Opcional: SITE_URL (ex.: https://protekar-portugal.vercel.app) para os URLs de retorno.

const config = require('../checkout-config.json');

const MAX = { nombre: 80, email: 120, telefono: 30, nif: 20, region: 60, ciudad: 80, cp: 12, direccion: 160, vehiculo: 60 };

function clean(value, max) {
    return String(value ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}

// O Stripe espera application/x-www-form-urlencoded com chaves aninhadas (a[b][0][c]=...).
function encode(obj, prefix, out = []) {
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null || value === '') continue;
        const k = prefix ? `${prefix}[${key}]` : key;
        if (typeof value === 'object') encode(value, k, out);
        else out.push(`${encodeURIComponent(k)}=${encodeURIComponent(value)}`);
    }
    return out.join('&');
}

function readBody(req) {
    if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
    if (typeof req.body === 'string') return Promise.resolve(JSON.parse(req.body || '{}'));
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk; if (data.length > 20000) req.destroy(); });
        req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
        req.on('error', reject);
    });
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: config.apiText.method });
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
        return res.status(500).json({ error: config.apiText.notConfigured });
    }

    let body;
    try {
        body = await readBody(req);
    } catch {
        return res.status(400).json({ error: config.apiText.badRequest });
    }

    const f = {
        nombre: clean(body.nombre, MAX.nombre),
        email: clean(body.email, MAX.email),
        telefono: clean(body.telefono, MAX.telefono),
        nif: clean(body.nif, MAX.nif),
        region: clean(body.region, MAX.region),
        ciudad: clean(body.ciudad, MAX.ciudad),
        cp: clean(body.cp, MAX.cp),
        direccion: clean(body.direccion, MAX.direccion),
        marca: clean(body.marca, MAX.vehiculo),
        modelo: clean(body.modelo, MAX.vehiculo),
        anio: clean(body.anio, 4)
    };

    const required = ['nombre', 'email', 'telefono', 'region', 'ciudad', 'cp', 'direccion', 'marca', 'modelo', 'anio'];
    const missing = required.filter(k => !f[k]);
    if (missing.length) return res.status(400).json({ error: config.apiText.missing, fields: missing });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return res.status(400).json({ error: config.apiText.badEmail, fields: ['email'] });
    if (!/^\d{4}$/.test(f.anio)) return res.status(400).json({ error: config.apiText.badYear, fields: ['anio'] });

    // Preços SEMPRE a partir da configuração do servidor, nunca do navegador.
    const shipping = config.shipping.find(s => s.id === body.envio) || config.shipping[0];
    const bumpIds = Array.isArray(body.bumps) ? body.bumps : [];
    const bumps = config.bumps.filter(b => bumpIds.includes(b.id));
    const vehiculo = `${f.marca} ${f.modelo} ${f.anio}`;

    // Kit escolhido (preço SEMPRE do servidor). Fallback para o kit por omissão / produto.
    const kits = Array.isArray(config.kits) ? config.kits : [];
    const kit = kits.find(k => k.id === body.kit) || kits.find(k => k.id === config.defaultKit) || null;
    const product = kit
        ? { name: kit.name, description: config.product.description, price: kit.price, image: kit.image }
        : config.product;

    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = (process.env.SITE_URL || `${proto}://${req.headers.host}`).replace(/\/$/, '');
    const imageUrl = (path) => `${origin}/${path.replace(/^\//, '')}`;

    const lineItems = [
        {
            quantity: 1,
            price_data: {
                currency: config.currency,
                unit_amount: product.price,
                product_data: {
                    name: `${product.name} – ${vehiculo}`,
                    description: product.description,
                    images: [imageUrl(product.image)]
                }
            }
        },
        ...bumps.map(b => ({
            quantity: 1,
            price_data: {
                currency: config.currency,
                unit_amount: b.price,
                product_data: { name: b.name, description: b.description, images: [imageUrl(b.image)] }
            }
        }))
    ];

    const metadata = {
        vehiculo,
        kit: kit ? kit.id : '',
        nombre: f.nombre,
        telefono: f.telefono,
        nif: f.nif,
        envio: shipping.id,
        extras: bumps.map(b => b.id).join(',')
    };

    const session = {
        mode: 'payment',
        locale: config.locale,
        customer_email: f.email,
        line_items: lineItems,
        shipping_options: [{
            shipping_rate_data: {
                type: 'fixed_amount',
                display_name: shipping.name,
                fixed_amount: { amount: shipping.price, currency: config.currency },
                delivery_estimate: {
                    minimum: { unit: 'business_day', value: shipping.minDays },
                    maximum: { unit: 'business_day', value: shipping.maxDays }
                }
            }
        }],
        payment_intent_data: {
            description: `${product.name} – ${vehiculo}`,
            metadata,
            shipping: {
                name: f.nombre,
                phone: f.telefono,
                address: {
                    line1: f.direccion,
                    city: f.ciudad,
                    postal_code: f.cp,
                    state: f.region,
                    country: config.country
                }
            }
        },
        metadata,
        success_url: `${origin}/${config.successPage}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout.html?${new URLSearchParams({ marca: f.marca, modelo: f.modelo, anio: f.anio, kit: kit ? kit.id : '' })}`
    };

    try {
        const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secret}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: encode(session)
        });
        const data = await stripeRes.json();
        if (!stripeRes.ok) {
            console.error('Stripe error', data.error);
            return res.status(502).json({ error: config.apiText.stripeFailed });
        }
        return res.status(200).json({ url: data.url });
    } catch (err) {
        console.error('Stripe request failed', err);
        return res.status(502).json({ error: config.apiText.stripeUnreachable });
    }
};

module.exports.encode = encode;
