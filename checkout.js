/* ========================================
   ProTekar – Checkout (tema escuro, 3 passos)
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

    // ---- Selected kit (?kit=) sets the product price/name/image (server revalidates) ----
    const kits = Array.isArray(cfg.kits) ? cfg.kits : [];
    const kit = kits.find(k => k.id === params.get('kit')) || kits.find(k => k.id === cfg.defaultKit) || null;
    if (kit) cfg.product = { ...cfg.product, name: kit.name, price: kit.price, image: kit.image, compareAt: kit.compareAt };

    // Online discount (applied on the kit price only, like the reference)
    const onlinePct = Number(cfg.onlineDiscount) || 0;
    const basePrice = cfg.product.price;                                   // kit price (cents)
    const finalPrice = Math.floor(basePrice * (1 - onlinePct / 100));      // charged for the kit
    const onlineSaved = basePrice - finalPrice;
    const compareAt = Number(cfg.product.compareAt) > basePrice ? Number(cfg.product.compareAt) : 0;

    // ---- Regions ----
    const regionSelect = form.elements.region;
    cfg.regions.forEach(r => regionSelect.appendChild(new Option(r, r)));

    // ---- Shipping options ----
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

    // ---- Bumps ----
    $('bumps').innerHTML = cfg.bumps.map(b => `
        <label class="bump">
            <input type="checkbox" name="bumps" value="${esc(b.id)}">
            <span class="bx"></span>
            <img class="bump-img" src="${esc(b.image)}" alt="">
            <span class="bump-info">
                <b>${esc(b.name)}</b><p>${esc(b.description)}</p>
                <span class="bump-price">${money(b.price)}${Number(b.compareAt) > b.price ? `<s>${money(b.compareAt)}</s>` : ''}</span>
            </span>
        </label>`).join('');

    // ---- Summary (product header) ----
    $('prodImg').src = cfg.product.image;
    $('prodName').textContent = cfg.product.name;
    $('prodNow').textContent = money(finalPrice);
    if (compareAt) { $('prodOld').hidden = false; $('prodOld').textContent = money(compareAt); }

    function currentVehicle() {
        if (hasVehicle) return vehicle;
        return { marca: form.elements.marca.value.trim(), modelo: form.elements.modelo.value.trim(), anio: form.elements.anio.value.trim() };
    }

    function render() {
        const v = currentVehicle();
        $('prodVehicle').textContent = v.marca ? `${cfg.product.description} · ${v.marca} ${v.modelo} ${v.anio}`.trim() : cfg.product.description;

        const ship = cfg.shipping.find(s => s.id === form.elements.envio.value) || cfg.shipping[0];
        const bumps = cfg.bumps.filter(b => [...form.querySelectorAll('input[name=bumps]:checked')].some(i => i.value === b.id));
        const total = finalPrice + ship.price + bumps.reduce((s, b) => s + b.price, 0);

        const lines = [];
        lines.push([T.subtotal, money(basePrice)]);
        if (onlineSaved) lines.push([`${T.discount} online (−${onlinePct}%)`, `<span class="neg">− ${money(onlineSaved)}</span>`]);
        bumps.forEach(b => lines.push([`+ ${esc(b.name)}`, money(b.price)]));
        lines.push([T.shipping, ship.price ? money(ship.price) : `<span class="free">${T.free}</span>`]);
        $('sumLines').innerHTML = lines.map(([l, r]) => `<div class="line"><span>${l}</span><span>${r}</span></div>`).join('');

        document.querySelectorAll('[data-total]').forEach(el => { el.textContent = money(total); });
    }
    form.addEventListener('change', render);
    form.addEventListener('input', (e) => { if (['marca', 'modelo', 'anio'].includes(e.target.name)) render(); });
    render();

    // ---- Steps navigation ----
    const step1 = $('step1'), step2 = $('step2');
    const errorBox = $('formError');
    const postal = new RegExp(cfg.postalPattern);

    function showError(msg) { errorBox.textContent = msg; errorBox.hidden = false; errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    function clearErrs() { form.querySelectorAll('.field.err').forEach(f => f.classList.remove('err')); errorBox.hidden = true; }

    function validateStep1() {
        clearErrs();
        const required = ['nombre', 'email', 'telefono', 'nif', 'direccion', 'ciudad', 'cp', 'region'];
        if (!hasVehicle) required.unshift('marca', 'modelo', 'anio');
        const bad = required.filter(n => !form.elements[n].value.trim());
        const email = form.elements.email.value.trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push('email');
        const cp = form.elements.cp.value.trim();
        if (cp && !postal.test(cp)) bad.push('cp');
        if (!hasVehicle && form.elements.anio.value && !/^\d{4}$/.test(form.elements.anio.value.trim())) bad.push('anio');
        if (bad.length) {
            bad.forEach(n => form.elements[n].closest('.field').classList.add('err'));
            showError(bad.includes('email') && email ? T.invalidEmail : bad.includes('cp') && cp ? T.invalidPostal : T.required);
            form.elements[bad[0]].focus({ preventScroll: true });
            return false;
        }
        return true;
    }

    function goStep(n) {
        step1.hidden = n !== 1;
        step2.hidden = n !== 2;
        $('stDados').className = 'st ' + (n > 1 ? 'done' : 'on');
        $('stPagamento').className = 'st ' + (n === 2 ? 'on' : '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    $('toStep2').addEventListener('click', () => { if (validateStep1()) { render(); goStep(2); } });
    $('backEdit').addEventListener('click', () => goStep(1));

    // ---- Promotion countdown ----
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

    // ---- Submit ----
    const buttons = [$('payBtn')];

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateStep1()) { goStep(1); return; }

        const v = currentVehicle();
        const payload = {
            ...v,
            kit: kit ? kit.id : '',
            metodo: (form.elements.pm && form.elements.pm.value) || 'mbway',
            nombre: form.elements.nombre.value,
            email: form.elements.email.value.trim(),
            telefono: form.elements.telefono.value,
            nif: form.elements.nif.value,
            region: form.elements.region.value,
            ciudad: form.elements.ciudad.value,
            direccion: form.elements.direccion.value,
            cp: form.elements.cp.value.trim(),
            envio: form.elements.envio.value,
            bumps: [...form.querySelectorAll('input[name=bumps]:checked')].map(i => i.value)
        };

        buttons.forEach(b => { b.disabled = true; });
        const labels = buttons.map(b => b.querySelector('span').innerHTML);
        buttons.forEach(b => { b.querySelector('span').textContent = T.redirecting; });

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.url) { location.href = data.url; return; }
            (data.fields || []).forEach(n => form.elements[n]?.closest('.field')?.classList.add('err'));
            showError(data.error || T.network);
            if ((data.fields || []).length) goStep(1);
        } catch {
            showError(T.network);
        }
        buttons.forEach((b, i) => { b.disabled = false; b.querySelector('span').innerHTML = labels[i]; });
        render();
    });
})();
