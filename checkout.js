/* ========================================
   ProTekar – Checkout
   Preços e textos em checkout-config.json; o servidor (api/checkout.js)
   recalcula o valor e cria a sessão de pagamento no Stripe.
   ======================================== */

(async () => {
    const form = document.getElementById('checkoutForm');
    const cfg = await fetch('checkout-config.json', { cache: 'no-cache' }).then(r => r.json());
    const T = cfg.text;
    const money = (cents) => new Intl.NumberFormat(cfg.numberLocale, { style: 'currency', currency: cfg.currency.toUpperCase() }).format(cents / 100);
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const $ = (id) => document.getElementById(id);

    // ---- Vehicle from the landing configurator (?marca=&modelo=&anio=) ----
    const params = new URLSearchParams(location.search);
    const vehicle = {
        marca: (params.get('marca') || '').slice(0, 60),
        modelo: (params.get('modelo') || '').slice(0, 60),
        anio: (params.get('anio') || params.get('ano') || '').slice(0, 4)
    };
    const hasVehicle = vehicle.marca && vehicle.modelo && /^\d{4}$/.test(vehicle.anio);
    $('vehicleCard').hidden = hasVehicle;
    if (!hasVehicle) $('vehicleCard').querySelectorAll('input').forEach(i => { i.value = vehicle[i.name] || ''; });

    // ---- Regions ----
    const regionSelect = form.elements.region;
    cfg.regions.forEach(r => regionSelect.appendChild(new Option(r, r)));

    // ---- Shipping options (shown once the address is filled, like the original) ----
    $('shipOptions').innerHTML = cfg.shipping.map((s, i) => `
        <label class="ship">
            <input type="radio" name="envio" value="${esc(s.id)}" ${i === 0 ? 'checked' : ''}>
            <span class="ship-ck"></span>
            <span class="ship-ic">${i === 0 ? '🚚' : '⚡'}</span>
            <span class="ship-b">
                <b>${esc(s.name)} <span class="ship-tag ${i === 0 ? '' : 'fast'}">${esc(s.tag)}</span></b>
                <span class="ship-eta">${esc(s.eta)}</span>
                <span class="ship-small">${esc(s.note)}</span>
            </span>
            <span class="ship-p ${s.price ? '' : 'free'}">${s.price ? '+ ' + money(s.price) : T.free}</span>
        </label>`).join('');

    const addressFields = ['region', 'ciudad', 'direccion', 'cp'];
    function updateShippingVisibility() {
        const filled = addressFields.every(n => form.elements[n].value.trim());
        $('shipOptions').hidden = !filled;
        $('shipHint').hidden = filled;
    }
    addressFields.forEach(n => form.elements[n].addEventListener('input', updateShippingVisibility));
    addressFields.forEach(n => form.elements[n].addEventListener('change', updateShippingVisibility));

    // ---- Bumps ----
    $('bumps').innerHTML = cfg.bumps.map(b => `
        <label class="bump">
            <input type="checkbox" name="bumps" value="${esc(b.id)}">
            <span class="bx"></span>
            <img class="bump-img" src="${esc(b.image)}" alt="">
            <span class="bump-info"><b>${esc(b.name)}</b><p>${esc(b.description)}</p></span>
            <span class="bump-price">${money(b.price)}</span>
        </label>`).join('');

    // ---- Summary ----
    $('prodImg').src = cfg.product.image;
    $('prodName').textContent = cfg.product.name;
    const compareAt = Number(cfg.product.compareAt) > cfg.product.price ? Number(cfg.product.compareAt) : 0;
    if (compareAt) {
        $('prodAnchor').hidden = false;
        $('prodOld').textContent = money(compareAt);
        $('prodOff').textContent = `−${Math.round((1 - cfg.product.price / compareAt) * 100)}%`;
    }

    function currentVehicle() {
        if (hasVehicle) return vehicle;
        return { marca: form.elements.marca.value.trim(), modelo: form.elements.modelo.value.trim(), anio: form.elements.anio.value.trim() };
    }

    function render() {
        const v = currentVehicle();
        $('prodVehicle').textContent = v.marca ? `${cfg.product.description} · ${v.marca} ${v.modelo} ${v.anio}`.trim() : cfg.product.description;

        const ship = cfg.shipping.find(s => s.id === form.elements.envio.value) || cfg.shipping[0];
        const bumps = cfg.bumps.filter(b => [...form.querySelectorAll('input[name=bumps]:checked')].some(i => i.value === b.id));
        const total = cfg.product.price + ship.price + bumps.reduce((s, b) => s + b.price, 0);

        const lines = [];
        lines.push([T.subtotal, money(compareAt || cfg.product.price)]);
        if (compareAt) {
            lines.push([`${T.discount} −${Math.round((1 - cfg.product.price / compareAt) * 100)}%`, `<span class="neg">− ${money(compareAt - cfg.product.price)}</span>`]);
        }
        bumps.forEach(b => lines.push([`+ ${esc(b.name)}`, money(b.price)]));
        lines.push([T.shipping, ship.price ? money(ship.price) : `<span class="free">${T.free}</span>`]);
        $('sumLines').innerHTML = lines.map(([l, r]) => `<div class="line"><span>${l}</span><span>${r}</span></div>`).join('');

        document.querySelectorAll('[data-total]').forEach(el => { el.textContent = money(total); });
        $('sumSaved').hidden = !compareAt;
        if (compareAt) $('sumSaved').textContent = '✓ ' + T.saved.replace('{amount}', money(compareAt - cfg.product.price));
    }
    form.addEventListener('change', render);
    form.addEventListener('input', (e) => { if (['marca', 'modelo', 'anio'].includes(e.target.name)) render(); });
    render();

    // ---- Real promotion countdown: only with a fixed end date in the config ----
    const promoEnd = cfg.promoEndsAt ? new Date(cfg.promoEndsAt).getTime() : NaN;
    if (promoEnd > Date.now()) {
        $('promoCount').hidden = false;
        const tick = () => {
            const left = Math.max(0, promoEnd - Date.now());
            const d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60;
            $('promoTimer').textContent = (d ? `${d}d ` : '') + [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
            if (!left) { $('promoCount').hidden = true; clearInterval(timer); }
        };
        const timer = setInterval(tick, 1000);
        tick();
    }

    // ---- Rating + reviews from reviews.js (real reviews only) ----
    const reviews = typeof REVIEWS !== 'undefined' ? REVIEWS : [];
    if (reviews.length) {
        const avg = reviews.reduce((s, r) => s + Number(r.nota || 0), 0) / reviews.length;
        $('rateCard').hidden = false;
        $('rateAvg').textContent = `${avg.toFixed(1)}/5`;
        $('rateCount').textContent = reviews.length === 1 ? T.reviews1 : T.reviewsN.replace('{n}', reviews.length);
        $('quotes').innerHTML = reviews.slice(0, 3).map(r => `
            <div class="quote">
                <p>"${esc(r.texto)}"</p>
                <span class="stars">${'★'.repeat(Math.round(r.nota || 5))}</span>
                <div class="who">${esc(r.nombre)}${r.detalle ? ' · ' + esc(r.detalle) : ''}${r.verificada ? `<span class="vf">✓ ${esc(T.verified)}</span>` : ''}</div>
            </div>`).join('');
    }

    // ---- Photo gallery ----
    const track = $('spTrack');
    const slides = track.children.length;
    $('phDots').innerHTML = Array.from({ length: slides }, (_, i) => `<button type="button" aria-label="Foto ${i + 1}"></button>`).join('');
    const dots = [...$('phDots').children];
    const current = () => Math.round(track.scrollLeft / track.clientWidth);
    const go = (i) => track.scrollTo({ left: ((i + slides) % slides) * track.clientWidth, behavior: 'smooth' });
    const syncDots = () => { const c = current(); dots.forEach((d, i) => d.classList.toggle('on', i === c)); $('phCount').textContent = `${c + 1} / ${slides}`; };
    $('phPrev').addEventListener('click', () => go(current() - 1));
    $('phNext').addEventListener('click', () => go(current() + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    track.addEventListener('scroll', () => requestAnimationFrame(syncDots), { passive: true });
    syncDots();

    // ---- Submit ----
    const errorBox = $('formError');
    const buttons = form.querySelectorAll('button[type=submit]');
    const postal = new RegExp(cfg.postalPattern);

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.hidden = false;
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.hidden = true;
        form.querySelectorAll('.field.err').forEach(f => f.classList.remove('err'));

        const required = ['nombre', 'email', 'telefono', 'region', 'ciudad', 'direccion', 'cp'];
        if (!hasVehicle) required.unshift('marca', 'modelo', 'anio');
        const bad = required.filter(n => !form.elements[n].value.trim());
        const email = form.elements.email.value.trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push('email');
        const cp = form.elements.cp.value.trim();
        if (cp && !postal.test(cp)) bad.push('cp');
        if (!hasVehicle && form.elements.anio.value && !/^\d{4}$/.test(form.elements.anio.value.trim())) bad.push('anio');

        if (bad.length) {
            bad.forEach(n => form.elements[n].closest('.field').classList.add('err'));
            const msg = bad.includes('email') && email ? T.invalidEmail : bad.includes('cp') && cp ? T.invalidPostal : T.required;
            showError(msg);
            form.elements[bad[0]].focus({ preventScroll: true });
            return;
        }

        const v = currentVehicle();
        const payload = {
            ...v,
            nombre: form.elements.nombre.value,
            email,
            telefono: form.elements.telefono.value,
            nif: form.elements.nif.value,
            region: form.elements.region.value,
            ciudad: form.elements.ciudad.value,
            direccion: form.elements.direccion.value,
            cp,
            envio: form.elements.envio.value,
            bumps: [...form.querySelectorAll('input[name=bumps]:checked')].map(i => i.value)
        };

        buttons.forEach(b => { b.disabled = true; });
        const labels = [...buttons].map(b => b.querySelector('span').innerHTML);
        buttons.forEach(b => { b.querySelector('span').textContent = T.redirecting; });

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.url) {
                location.href = data.url;
                return;
            }
            (data.fields || []).forEach(n => form.elements[n]?.closest('.field')?.classList.add('err'));
            showError(data.error || T.network);
        } catch {
            showError(T.network);
        }
        buttons.forEach((b, i) => { b.disabled = false; b.querySelector('span').innerHTML = labels[i]; });
        render();
    });
})();
