/* ========================================
   ProTekar Portugal - App Logic
   ======================================== */

// Kits disponíveis (preços em euros, IVA incluído). Têm de coincidir com checkout-config.json.
const KITS = [
    {
        id: 'basico', name: 'Kit Básico', price: 34.90, compareAt: 59.90,
        features: ['3 tapetes interiores à medida', 'Traseiro inteiriço c/ proteção central']
    },
    {
        id: 'completo', name: 'Kit Completo', badge: 'MAIS VENDIDO', price: 49.90, compareAt: 89.90,
        features: ['3 tapetes interiores à medida', 'Traseiro inteiriço c/ proteção central', 'Tapete de bagageira premium', 'OFERTA: Ambientador grátis']
    }
];
const DEFAULT_KIT = 'completo';
const FROM_PRICE = Math.min(...KITS.map(k => k.price));
let selectedKit = DEFAULT_KIT;
// URL do checkout. São acrescentados ?marca=&modelo=&ano=&kit= ao selecionar o carro.
const CHECKOUT_URL = '/checkout.html';

const formatEUR = (n) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('[data-price]').forEach(el => { el.textContent = formatEUR(FROM_PRICE); });

    // ---- Menu lateral ----
    const navToggle = document.getElementById('navToggle');
    const menu = document.getElementById('menu');
    const menuOverlay = document.getElementById('menuOverlay');

    function setMenu(open) {
        menu.classList.toggle('open', open);
        menu.setAttribute('aria-hidden', !open);
        menuOverlay.hidden = !open;
        navToggle.setAttribute('aria-expanded', open);
    }

    navToggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    menuOverlay.addEventListener('click', () => setMenu(false));
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

    // ---- Avaliações de clientes (de reviews.js) ----
    renderReviews(typeof REVIEWS !== 'undefined' ? REVIEWS : []);

    // ---- Lightbox (fotos ampliadas) ----
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    const lbCaption = document.getElementById('lbCaption');
    let lbGroup = [];
    let lbIndex = 0;
    let lbReturnFocus = null;

    function lbShow(i) {
        lbIndex = (i + lbGroup.length) % lbGroup.length;
        const img = lbGroup[lbIndex];
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbCaption.textContent = img.alt + (lbGroup.length > 1 ? ` · ${lbIndex + 1} / ${lbGroup.length}` : '');
        document.getElementById('lbPrev').hidden = document.getElementById('lbNext').hidden = lbGroup.length < 2;
    }
    function lbOpen(group, i) {
        lbGroup = group;
        lbReturnFocus = document.activeElement;
        lbShow(i);
        lb.hidden = false;
        document.body.style.overflow = 'hidden';
        document.getElementById('lbClose').focus();
    }
    function lbClose() {
        lb.hidden = true;
        document.body.style.overflow = '';
        lbReturnFocus?.focus?.();
    }

    function makeZoomable(selector, { withIcon = false } = {}) {
        // As cópias do carrossel (aria-hidden) abrem a mesma foto que o original.
        const all = [...document.querySelectorAll(selector)];
        const group = all.filter(img => img.getAttribute('aria-hidden') !== 'true');
        all.forEach(img => {
            const target = group.find(g => g.getAttribute('src') === img.getAttribute('src')) || img;
            img.classList.add('zoomable');
            if (img.getAttribute('aria-hidden') !== 'true') {
                img.tabIndex = 0;
                img.setAttribute('role', 'button');
            }
            const open = () => lbOpen(group, group.indexOf(target));
            img.addEventListener('click', open);
            img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
            if (withIcon && img.parentElement && !img.parentElement.querySelector('.zoom-icon')) {
                img.parentElement.insertAdjacentHTML('beforeend', '<span class="zoom-icon" aria-hidden="true">⤢</span>');
            }
        });
    }

    makeZoomable('.offer-img');
    makeZoomable('.marquee-track img');
    makeZoomable('.detalle-image img', { withIcon: true });
    makeZoomable('.resena-image img', { withIcon: true });

    document.getElementById('lbClose').addEventListener('click', lbClose);
    document.getElementById('lbPrev').addEventListener('click', () => lbShow(lbIndex - 1));
    document.getElementById('lbNext').addEventListener('click', () => lbShow(lbIndex + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) lbClose(); });
    document.addEventListener('keydown', (e) => {
        if (lb.hidden) return;
        if (e.key === 'Escape') lbClose();
        if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
        if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    });
    let touchX = null;
    lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1));
        touchX = null;
    });

    // ---- Animações ao fazer scroll ----
    const revealElements = document.querySelectorAll(
        '.beneficio, .detalle, .resena, .offer, .config-card, .ba, .vs, .faq-accordion'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), index * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ---- Contadores animados ----
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                animateCounter(el, parseInt(el.dataset.count), el.dataset.suffix || '', 1600);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));

    function animateCounter(el, target, suffix, duration) {
        const start = performance.now();
        function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // ---- Comparador antes / depois ----
    const ba = document.getElementById('beforeAfter');
    const baRange = document.getElementById('baRange');
    baRange.addEventListener('input', () => ba.style.setProperty('--pos', baRange.value + '%'));

    // ---- Configurador de veículos ----
    const vehicleData = {
        renault: {
            name: 'Renault',
            models: {
                clio: { name: 'Clio', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                megane: { name: 'Mégane', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                captur: { name: 'Captur', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                kadjar: { name: 'Kadjar', years: ['2023', '2022', '2021', '2020', '2019'] },
                austral: { name: 'Austral', years: ['2026', '2025', '2024', '2023', '2022'] },
                scenic: { name: 'Scénic', years: ['2026', '2025', '2024', '2023'] }
            }
        },
        peugeot: {
            name: 'Peugeot',
            models: {
                '208': { name: '208', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                '308': { name: '308', years: ['2026', '2025', '2024', '2023', '2022', '2021'] },
                '2008': { name: '2008', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                '3008': { name: '3008', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                '5008': { name: '5008', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        },
        citroen: {
            name: 'Citroën',
            models: {
                c3: { name: 'C3', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                c4: { name: 'C4', years: ['2026', '2025', '2024', '2023', '2022', '2021'] },
                c5aircross: { name: 'C5 Aircross', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                berlingo: { name: 'Berlingo', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] }
            }
        },
        volkswagen: {
            name: 'Volkswagen',
            models: {
                golf: { name: 'Golf', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'] },
                polo: { name: 'Polo', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                tiguan: { name: 'Tiguan', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                troc: { name: 'T-Roc', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                passat: { name: 'Passat', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                touareg: { name: 'Touareg', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        },
        bmw: {
            name: 'BMW',
            models: {
                serie1: { name: 'Série 1', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                serie3: { name: 'Série 3', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                x1: { name: 'X1', years: ['2026', '2025', '2024', '2023', '2022'] },
                x3: { name: 'X3', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                x5: { name: 'X5', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] }
            }
        },
        mercedes: {
            name: 'Mercedes-Benz',
            models: {
                classeA: { name: 'Classe A', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                classeC: { name: 'Classe C', years: ['2026', '2025', '2024', '2023', '2022', '2021'] },
                gla: { name: 'GLA', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                glb: { name: 'GLB', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                glc: { name: 'GLC', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        },
        audi: {
            name: 'Audi',
            models: {
                a1: { name: 'A1', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                a3: { name: 'A3', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                a4: { name: 'A4', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                q3: { name: 'Q3', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                q5: { name: 'Q5', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        },
        seat: {
            name: 'SEAT',
            models: {
                ibiza: { name: 'Ibiza', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'] },
                leon: { name: 'León', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'] },
                arona: { name: 'Arona', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'] },
                ateca: { name: 'Ateca', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                tarraco: { name: 'Tarraco', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] }
            }
        },
        toyota: {
            name: 'Toyota',
            models: {
                corolla: { name: 'Corolla', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                yaris: { name: 'Yaris', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                rav4: { name: 'RAV4', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                chr: { name: 'C-HR', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                aygo: { name: 'Aygo X', years: ['2026', '2025', '2024', '2023', '2022'] }
            }
        },
        nissan: {
            name: 'Nissan',
            models: {
                qashqai: { name: 'Qashqai', years: ['2026', '2025', '2024', '2023', '2022', '2021'] },
                juke: { name: 'Juke', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                xtrail: { name: 'X-Trail', years: ['2026', '2025', '2024', '2023', '2022'] },
                leaf: { name: 'Leaf', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        },
        ford: {
            name: 'Ford',
            models: {
                fiesta: { name: 'Fiesta', years: ['2023', '2022', '2021', '2020', '2019'] },
                focus: { name: 'Focus', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                puma: { name: 'Puma', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                kuga: { name: 'Kuga', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        },
        opel: {
            name: 'Opel',
            models: {
                corsa: { name: 'Corsa', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                astra: { name: 'Astra', years: ['2026', '2025', '2024', '2023', '2022'] },
                mokka: { name: 'Mokka', years: ['2026', '2025', '2024', '2023', '2022', '2021'] },
                grandland: { name: 'Grandland', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        },
        fiat: {
            name: 'Fiat',
            models: {
                tipo: { name: 'Tipo', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                panda: { name: 'Panda', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                '500': { name: '500', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                '500x': { name: '500X', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        },
        hyundai: {
            name: 'Hyundai',
            models: {
                tucson: { name: 'Tucson', years: ['2026', '2025', '2024', '2023', '2022', '2021'] },
                i20: { name: 'i20', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                i30: { name: 'i30', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                kona: { name: 'Kona', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                bayon: { name: 'Bayon', years: ['2026', '2025', '2024', '2023', '2022', '2021'] }
            }
        },
        kia: {
            name: 'Kia',
            models: {
                sportage: { name: 'Sportage', years: ['2026', '2025', '2024', '2023', '2022'] },
                ceed: { name: 'Ceed', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                niro: { name: 'Niro', years: ['2026', '2025', '2024', '2023', '2022'] },
                stonic: { name: 'Stonic', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                picanto: { name: 'Picanto', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        },
        dacia: {
            name: 'Dacia',
            models: {
                sandero: { name: 'Sandero', years: ['2026', '2025', '2024', '2023', '2022', '2021'] },
                duster: { name: 'Duster', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                jogger: { name: 'Jogger', years: ['2026', '2025', '2024', '2023', '2022'] },
                spring: { name: 'Spring', years: ['2026', '2025', '2024', '2023', '2022'] }
            }
        },
        skoda: {
            name: 'Škoda',
            models: {
                octavia: { name: 'Octavia', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                fabia: { name: 'Fabia', years: ['2026', '2025', '2024', '2023', '2022'] },
                karoq: { name: 'Karoq', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                kodiaq: { name: 'Kodiaq', years: ['2026', '2025', '2024', '2023', '2022', '2021'] },
                kamiq: { name: 'Kamiq', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        },
        volvo: {
            name: 'Volvo',
            models: {
                xc40: { name: 'XC40', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                xc60: { name: 'XC60', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                xc90: { name: 'XC90', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                v60: { name: 'V60', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] }
            }
        },
        mazda: {
            name: 'Mazda',
            models: {
                mazda2: { name: 'Mazda2', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                mazda3: { name: 'Mazda3', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                cx30: { name: 'CX-30', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                cx5: { name: 'CX-5', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'] },
                mx5: { name: 'MX-5', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        },
        cupra: {
            name: 'CUPRA',
            models: {
                formentor: { name: 'Formentor', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                born: { name: 'Born', years: ['2026', '2025', '2024', '2023', '2022'] },
                leon: { name: 'León', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] },
                ateca: { name: 'Ateca', years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'] }
            }
        }
    };

    // Marcas adicionadas (anos gerados a partir de intervalos [de, até])
    const yrs = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => String(to - i));
    const brand = (name, models) => ({
        name,
        models: Object.fromEntries(Object.entries(models).map(([key, [label, from, to]]) => [key, { name: label, years: yrs(from, to) }]))
    });
    Object.assign(vehicleData, {
        alfaromeo: brand('Alfa Romeo', { giulietta: ['Giulietta', 2012, 2020], giulia: ['Giulia', 2016, 2026], stelvio: ['Stelvio', 2017, 2026], tonale: ['Tonale', 2022, 2026], junior: ['Junior', 2024, 2026] }),
        byd: brand('BYD', { atto3: ['Atto 3', 2022, 2026], dolphin: ['Dolphin', 2023, 2026], dolphinsurf: ['Dolphin Surf', 2025, 2026], atto2: ['Atto 2', 2025, 2026], seal: ['Seal', 2023, 2026], sealu: ['Seal U', 2024, 2026], sealion7: ['Sealion 7', 2025, 2026] }),
        chery: brand('Chery', { tiggo4: ['Tiggo 4', 2025, 2026], tiggo7: ['Tiggo 7', 2025, 2026], tiggo8: ['Tiggo 8', 2025, 2026] }),
        chevrolet: brand('Chevrolet', { spark: ['Spark', 2010, 2015], aveo: ['Aveo', 2011, 2015], cruze: ['Cruze', 2009, 2015], trax: ['Trax', 2013, 2015], captiva: ['Captiva', 2011, 2015] }),
        ds: brand('DS', { ds3: ['DS 3', 2019, 2026], ds4: ['DS 4', 2021, 2026], ds7: ['DS 7', 2018, 2026] }),
        honda: brand('Honda', { jazz: ['Jazz', 2015, 2026], civic: ['Civic', 2017, 2026], hrv: ['HR-V', 2015, 2026], zrv: ['ZR-V', 2023, 2026], crv: ['CR-V', 2018, 2026] }),
        jaguar: brand('Jaguar', { xe: ['XE', 2015, 2024], epace: ['E-Pace', 2018, 2024], fpace: ['F-Pace', 2016, 2026], ipace: ['I-Pace', 2018, 2024] }),
        jeep: brand('Jeep', { avenger: ['Avenger', 2023, 2026], renegade: ['Renegade', 2015, 2026], compass: ['Compass', 2017, 2026], wrangler: ['Wrangler', 2018, 2026], grandcherokee: ['Grand Cherokee', 2022, 2026] }),
        kgm: brand('KGM (SsangYong)', { tivoli: ['Tivoli', 2015, 2026], korando: ['Korando', 2019, 2026], torres: ['Torres', 2023, 2026], rexton: ['Rexton', 2017, 2026] }),
        landrover: brand('Land Rover', { evoque: ['Range Rover Evoque', 2019, 2026], discoverysport: ['Discovery Sport', 2015, 2026], velar: ['Range Rover Velar', 2017, 2026], defender: ['Defender', 2020, 2026], rrsport: ['Range Rover Sport', 2022, 2026] }),
        leapmotor: brand('Leapmotor', { t03: ['T03', 2024, 2026], b10: ['B10', 2025, 2026], c10: ['C10', 2024, 2026] }),
        lexus: brand('Lexus', { lbx: ['LBX', 2024, 2026], ux: ['UX', 2019, 2026], nx: ['NX', 2015, 2026], rx: ['RX', 2016, 2026] }),
        lynkco: brand('Lynk & Co', { '01': ['01', 2021, 2026] }),
        maxus: brand('Maxus', { edeliver3: ['eDeliver 3', 2021, 2026], deliver9: ['Deliver 9', 2020, 2026] }),
        mg: brand('MG', { mg3: ['MG3', 2024, 2026], zs: ['ZS', 2017, 2026], mg4: ['MG4', 2022, 2026], hs: ['HS', 2019, 2026], marvelr: ['Marvel R', 2021, 2023] }),
        mini: brand('MINI', { cooper: ['Cooper (3 portas)', 2014, 2026], aceman: ['Aceman', 2024, 2026], clubman: ['Clubman', 2015, 2024], countryman: ['Countryman', 2017, 2026] }),
        mitsubishi: brand('Mitsubishi', { spacestar: ['Space Star', 2013, 2024], colt: ['Colt', 2023, 2026], asx: ['ASX', 2010, 2026], eclipsecross: ['Eclipse Cross', 2018, 2026], outlander: ['Outlander', 2013, 2026] }),
        omoda: brand('Omoda', { omoda5: ['Omoda 5', 2024, 2026], omoda9: ['Omoda 9', 2025, 2026] }),
        jaecoo: brand('Jaecoo', { jaecoo7: ['Jaecoo 7', 2024, 2026] }),
        polestar: brand('Polestar', { p2: ['Polestar 2', 2020, 2026], p3: ['Polestar 3', 2024, 2026], p4: ['Polestar 4', 2024, 2026] }),
        porsche: brand('Porsche', { macan: ['Macan', 2014, 2026], cayenne: ['Cayenne', 2018, 2026], taycan: ['Taycan', 2020, 2026], panamera: ['Panamera', 2017, 2026], p911: ['911', 2019, 2026] }),
        smart: brand('smart', { fortwo: ['fortwo', 2015, 2024], s1: ['#1', 2023, 2026], s3: ['#3', 2024, 2026] }),
        subaru: brand('Subaru', { crosstrek: ['XV / Crosstrek', 2018, 2026], forester: ['Forester', 2019, 2026], outback: ['Outback', 2021, 2026] }),
        suzuki: brand('Suzuki', { ignis: ['Ignis', 2017, 2024], swift: ['Swift', 2017, 2026], vitara: ['Vitara', 2015, 2026], scross: ['S-Cross', 2014, 2026], jimny: ['Jimny', 2018, 2026] }),
        tesla: brand('Tesla', { model3: ['Model 3', 2019, 2026], modely: ['Model Y', 2021, 2026], models: ['Model S', 2014, 2026], modelx: ['Model X', 2016, 2026] })
    });

    const marcaSelect = document.getElementById('marca');
    const modeloSelect = document.getElementById('modelo');
    const anioSelect = document.getElementById('anio');
    const resultado = document.getElementById('configuradorResultado');

    // Opções de marca geradas a partir dos dados (ordem alfabética)
    Object.entries(vehicleData)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name, 'pt'))
        .forEach(([key, b]) => marcaSelect.appendChild(new Option(b.name.toUpperCase(), key)));

    marcaSelect.addEventListener('change', () => {
        const marca = marcaSelect.value;
        modeloSelect.innerHTML = '<option value="">Selecione o modelo</option>';
        anioSelect.innerHTML = '<option value="">Primero selecciona modelo</option>';
        anioSelect.disabled = true;

        if (marca && vehicleData[marca]) {
            const models = vehicleData[marca].models;
            Object.keys(models).forEach(key => {
                modeloSelect.appendChild(new Option(models[key].name, key));
            });
            modeloSelect.disabled = false;
        } else {
            modeloSelect.disabled = true;
        }
        updateResult();
    });

    modeloSelect.addEventListener('change', () => {
        const marca = marcaSelect.value;
        const modelo = modeloSelect.value;
        anioSelect.innerHTML = '<option value="">Selecione o ano</option>';

        if (marca && modelo && vehicleData[marca]?.models[modelo]) {
            vehicleData[marca].models[modelo].years.forEach(year => {
                anioSelect.appendChild(new Option(year, year));
            });
            anioSelect.disabled = false;
        } else {
            anioSelect.disabled = true;
        }
        updateResult();
    });

    anioSelect.addEventListener('change', updateResult);

    const kitPct = (k) => Math.round((1 - k.price / k.compareAt) * 100);

    function checkoutHref() {
        if (CHECKOUT_URL === '#') return '#';
        const marca = marcaSelect.value, modelo = modeloSelect.value, anio = anioSelect.value;
        const base = { kit: selectedKit };
        if (marca && modelo && anio) {
            Object.assign(base, { marca: vehicleData[marca].name, modelo: vehicleData[marca].models[modelo].name, ano: anio });
        }
        return `${CHECKOUT_URL}?${new URLSearchParams(base)}`;
    }

    function renderKitPicker() {
        const active = KITS.find(k => k.id === selectedKit) || KITS[0];
        const cards = KITS.map(k => `
            <label class="kit ${k.id === selectedKit ? 'on' : ''}">
                <input type="radio" name="kit" value="${k.id}" ${k.id === selectedKit ? 'checked' : ''}>
                <span class="kit-ck"></span>
                <span class="kit-body">
                    <span class="kit-head"><b>${escapeHTML(k.name)}</b>${k.badge ? `<span class="kit-badge">${escapeHTML(k.badge)}</span>` : ''}</span>
                    <ul class="kit-feats">${k.features.map(f => `<li>${escapeHTML(f)}</li>`).join('')}</ul>
                </span>
                <span class="kit-price">
                    <span class="kit-now">${formatEUR(k.price)}</span>
                    <s class="kit-old">${formatEUR(k.compareAt)}</s>
                    <span class="kit-off">−${kitPct(k)}%</span>
                </span>
            </label>`).join('');
        return `
            <div class="kit-eyebrow">ESCOLHA O SEU KIT</div>
            <h3 class="kit-pick-title">Selecione a proteção ideal</h3>
            <div class="kit-list">${cards}</div>
            <div class="kit-total">
                <span class="kit-total-l">TOTAL DO KIT <span class="kit-off">−${kitPct(active)}%</span></span>
                <span class="kit-total-r"><span class="kit-now">${formatEUR(active.price)}</span> <s class="kit-old">${formatEUR(active.compareAt)}</s></span>
            </div>
            <p class="kit-ship">🚚 PORTES GRÁTIS · Pagamento 100% seguro com cartão</p>
            <a href="${checkoutHref()}" class="result-cta kit-cta">COMPRAR AGORA →</a>
            <p class="kit-trust">🔒 Compra segura · Garantia de 3 anos · À medida</p>
        `;
    }

    function updateResult() {
        const marca = marcaSelect.value, modelo = modeloSelect.value, anio = anioSelect.value;

        if (marca && modelo && anio) {
            const brandName = vehicleData[marca].name;
            const modelName = vehicleData[marca].models[modelo].name;
            resultado.classList.add('has-vehicle');
            resultado.innerHTML = `
                <div class="result-avail">
                    <span class="result-avail-ic">✓</span>
                    <span class="result-avail-txt"><b>Disponível para ${escapeHTML(modelName)}</b><span class="result-avail-sub">Fabrico à medida · ${escapeHTML(brandName)} ${escapeHTML(anio)}</span></span>
                </div>
                ${renderKitPicker()}
            `;
            resultado.querySelectorAll('input[name="kit"]').forEach(radio => {
                radio.addEventListener('change', () => { selectedKit = radio.value; updateResult(); });
            });
        } else {
            resultado.classList.remove('has-vehicle');
            resultado.innerHTML = `
                <span class="result-label">Desde</span>
                <span class="result-price">${formatEUR(FROM_PRICE)}</span>
                <p class="result-text">Selecione o seu veículo acima para ver o seu kit à medida</p>
            `;
        }
    }

    updateResult();
});

function escapeHTML(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderReviews(reviews) {
    const section = document.getElementById('resenas');
    if (!section || !reviews.length) return;

    const avg = reviews.reduce((sum, r) => sum + Number(r.nota || 0), 0) / reviews.length;
    document.getElementById('ratingAvg').textContent = avg.toFixed(1).replace('.', ',');
    document.getElementById('ratingCount').textContent =
        reviews.length === 1 ? '1 avaliação' : `${reviews.length} avaliações`;

    document.getElementById('resenasList').innerHTML = reviews.map(r => {
        const nota = Math.max(1, Math.min(5, Math.round(Number(r.nota) || 5)));
        const initials = escapeHTML(String(r.nombre || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase());
        return `
            <article class="resena">
                ${r.foto ? `
                <div class="resena-image">
                    <img src="${escapeHTML(r.foto)}" alt="Foto enviada por ${escapeHTML(r.nombre)}" loading="lazy">
                    <div class="resena-badges">
                        <span class="badge badge-foto"><span class="badge-dot"></span> Foto do cliente</span>
                        ${r.producto ? `<span class="badge badge-producto">${escapeHTML(r.producto)}</span>` : ''}
                    </div>
                </div>` : ''}
                <div class="resena-content">
                    <div class="resena-stars">
                        <span class="stars">${'★'.repeat(nota)}${'☆'.repeat(5 - nota)}</span>
                        <span class="star-score">${nota.toFixed(1)}</span>
                    </div>
                    <p class="resena-text">"${escapeHTML(r.texto)}"</p>
                    <hr>
                    <div class="resena-author">
                        <div class="author-avatar">${r.avatar ? `<img src="${escapeHTML(r.avatar)}" alt="">` : initials}</div>
                        <div>
                            <div class="author-name-line">
                                <span class="author-name">${escapeHTML(r.nombre)}</span>
                                ${r.verificada ? '<span class="verified">Compra verificada</span>' : ''}
                            </div>
                            ${r.detalle ? `<span class="author-details">${escapeHTML(r.detalle)}</span>` : ''}
                        </div>
                    </div>
                </div>
            </article>`;
    }).join('');

    section.hidden = false;
}
