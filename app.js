/* ========================================
   ProTekar Portugal - App Logic
   ======================================== */

// Preço do kit completo (dianteiros + traseiros), IVA incluído.
const KIT_PRICE = 79.90;
// URL do checkout. São acrescentados ?marca=&modelo=&ano= ao selecionar o carro.
const CHECKOUT_URL = '#';

const formatEUR = (n) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('[data-price]').forEach(el => { el.textContent = formatEUR(KIT_PRICE); });

    // ---- Menu móvel ----
    const navToggle = document.getElementById('navToggle');
    const navDrawer = document.getElementById('navDrawer');

    navToggle.addEventListener('click', () => {
        const open = navDrawer.classList.toggle('open');
        navToggle.classList.toggle('active', open);
        navToggle.setAttribute('aria-expanded', open);
    });

    navDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navDrawer.classList.remove('open');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // ---- Barra de compra fixa ----
    const buybar = document.getElementById('buybar');
    window.addEventListener('scroll', () => {
        buybar.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    // ---- Animações ao fazer scroll ----
    const revealElements = document.querySelectorAll(
        '.benefit, .detail, .gallery-grid img, .offer-card, .config-card, .ba, .vs, .faq details'
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
                clio: { name: 'Clio', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                megane: { name: 'Mégane', years: ['2024', '2023', '2022', '2021', '2020'] },
                captur: { name: 'Captur', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                kadjar: { name: 'Kadjar', years: ['2023', '2022', '2021', '2020', '2019'] },
                austral: { name: 'Austral', years: ['2024', '2023', '2022'] },
                scenic: { name: 'Scénic', years: ['2024', '2023'] }
            }
        },
        peugeot: {
            name: 'Peugeot',
            models: {
                '208': { name: '208', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                '308': { name: '308', years: ['2024', '2023', '2022', '2021'] },
                '2008': { name: '2008', years: ['2024', '2023', '2022', '2021', '2020'] },
                '3008': { name: '3008', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                '5008': { name: '5008', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        },
        citroen: {
            name: 'Citroën',
            models: {
                c3: { name: 'C3', years: ['2024', '2023', '2022', '2021', '2020'] },
                c4: { name: 'C4', years: ['2024', '2023', '2022', '2021'] },
                c5aircross: { name: 'C5 Aircross', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                berlingo: { name: 'Berlingo', years: ['2024', '2023', '2022', '2021', '2020', '2019'] }
            }
        },
        volkswagen: {
            name: 'Volkswagen',
            models: {
                golf: { name: 'Golf', years: ['2024', '2023', '2022', '2021', '2020', '2019', '2018'] },
                polo: { name: 'Polo', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                tiguan: { name: 'Tiguan', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                troc: { name: 'T-Roc', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                passat: { name: 'Passat', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                touareg: { name: 'Touareg', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        },
        bmw: {
            name: 'BMW',
            models: {
                serie1: { name: 'Série 1', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                serie3: { name: 'Série 3', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                x1: { name: 'X1', years: ['2024', '2023', '2022'] },
                x3: { name: 'X3', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                x5: { name: 'X5', years: ['2024', '2023', '2022', '2021', '2020', '2019'] }
            }
        },
        mercedes: {
            name: 'Mercedes-Benz',
            models: {
                classeA: { name: 'Classe A', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                classeC: { name: 'Classe C', years: ['2024', '2023', '2022', '2021'] },
                gla: { name: 'GLA', years: ['2024', '2023', '2022', '2021', '2020'] },
                glb: { name: 'GLB', years: ['2024', '2023', '2022', '2021', '2020'] },
                glc: { name: 'GLC', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        },
        audi: {
            name: 'Audi',
            models: {
                a1: { name: 'A1', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                a3: { name: 'A3', years: ['2024', '2023', '2022', '2021', '2020'] },
                a4: { name: 'A4', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                q3: { name: 'Q3', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                q5: { name: 'Q5', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        },
        seat: {
            name: 'SEAT',
            models: {
                ibiza: { name: 'Ibiza', years: ['2024', '2023', '2022', '2021', '2020', '2019', '2018'] },
                leon: { name: 'León', years: ['2024', '2023', '2022', '2021', '2020', '2019', '2018'] },
                arona: { name: 'Arona', years: ['2024', '2023', '2022', '2021', '2020', '2019', '2018'] },
                ateca: { name: 'Ateca', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                tarraco: { name: 'Tarraco', years: ['2024', '2023', '2022', '2021', '2020', '2019'] }
            }
        },
        toyota: {
            name: 'Toyota',
            models: {
                corolla: { name: 'Corolla', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                yaris: { name: 'Yaris', years: ['2024', '2023', '2022', '2021', '2020'] },
                rav4: { name: 'RAV4', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                chr: { name: 'C-HR', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                aygo: { name: 'Aygo X', years: ['2024', '2023', '2022'] }
            }
        },
        nissan: {
            name: 'Nissan',
            models: {
                qashqai: { name: 'Qashqai', years: ['2024', '2023', '2022', '2021'] },
                juke: { name: 'Juke', years: ['2024', '2023', '2022', '2021', '2020'] },
                xtrail: { name: 'X-Trail', years: ['2024', '2023', '2022'] },
                leaf: { name: 'Leaf', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        },
        ford: {
            name: 'Ford',
            models: {
                fiesta: { name: 'Fiesta', years: ['2023', '2022', '2021', '2020', '2019'] },
                focus: { name: 'Focus', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                puma: { name: 'Puma', years: ['2024', '2023', '2022', '2021', '2020'] },
                kuga: { name: 'Kuga', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        },
        opel: {
            name: 'Opel',
            models: {
                corsa: { name: 'Corsa', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                astra: { name: 'Astra', years: ['2024', '2023', '2022'] },
                mokka: { name: 'Mokka', years: ['2024', '2023', '2022', '2021'] },
                grandland: { name: 'Grandland', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        },
        fiat: {
            name: 'Fiat',
            models: {
                tipo: { name: 'Tipo', years: ['2024', '2023', '2022', '2021', '2020'] },
                panda: { name: 'Panda', years: ['2024', '2023', '2022', '2021', '2020'] },
                '500': { name: '500', years: ['2024', '2023', '2022', '2021', '2020'] },
                '500x': { name: '500X', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        },
        hyundai: {
            name: 'Hyundai',
            models: {
                tucson: { name: 'Tucson', years: ['2024', '2023', '2022', '2021'] },
                i20: { name: 'i20', years: ['2024', '2023', '2022', '2021', '2020'] },
                i30: { name: 'i30', years: ['2024', '2023', '2022', '2021', '2020'] },
                kona: { name: 'Kona', years: ['2024', '2023', '2022', '2021', '2020'] },
                bayon: { name: 'Bayon', years: ['2024', '2023', '2022', '2021'] }
            }
        },
        kia: {
            name: 'Kia',
            models: {
                sportage: { name: 'Sportage', years: ['2024', '2023', '2022'] },
                ceed: { name: 'Ceed', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                niro: { name: 'Niro', years: ['2024', '2023', '2022'] },
                stonic: { name: 'Stonic', years: ['2024', '2023', '2022', '2021', '2020'] },
                picanto: { name: 'Picanto', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        },
        dacia: {
            name: 'Dacia',
            models: {
                sandero: { name: 'Sandero', years: ['2024', '2023', '2022', '2021'] },
                duster: { name: 'Duster', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                jogger: { name: 'Jogger', years: ['2024', '2023', '2022'] },
                spring: { name: 'Spring', years: ['2024', '2023', '2022'] }
            }
        },
        skoda: {
            name: 'Škoda',
            models: {
                octavia: { name: 'Octavia', years: ['2024', '2023', '2022', '2021', '2020'] },
                fabia: { name: 'Fabia', years: ['2024', '2023', '2022'] },
                karoq: { name: 'Karoq', years: ['2024', '2023', '2022', '2021', '2020'] },
                kodiaq: { name: 'Kodiaq', years: ['2024', '2023', '2022', '2021'] },
                kamiq: { name: 'Kamiq', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        },
        volvo: {
            name: 'Volvo',
            models: {
                xc40: { name: 'XC40', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                xc60: { name: 'XC60', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                xc90: { name: 'XC90', years: ['2024', '2023', '2022', '2021', '2020'] },
                v60: { name: 'V60', years: ['2024', '2023', '2022', '2021', '2020', '2019'] }
            }
        },
        mazda: {
            name: 'Mazda',
            models: {
                mazda2: { name: 'Mazda2', years: ['2024', '2023', '2022', '2021', '2020'] },
                mazda3: { name: 'Mazda3', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                cx30: { name: 'CX-30', years: ['2024', '2023', '2022', '2021', '2020'] },
                cx5: { name: 'CX-5', years: ['2024', '2023', '2022', '2021', '2020', '2019'] },
                mx5: { name: 'MX-5', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        },
        cupra: {
            name: 'CUPRA',
            models: {
                formentor: { name: 'Formentor', years: ['2024', '2023', '2022', '2021', '2020'] },
                born: { name: 'Born', years: ['2024', '2023', '2022'] },
                leon: { name: 'León', years: ['2024', '2023', '2022', '2021', '2020'] },
                ateca: { name: 'Ateca', years: ['2024', '2023', '2022', '2021', '2020'] }
            }
        }
    };

    const marcaSelect = document.getElementById('marca');
    const modeloSelect = document.getElementById('modelo');
    const anioSelect = document.getElementById('anio');
    const resultado = document.getElementById('configuradorResultado');

    marcaSelect.addEventListener('change', () => {
        const marca = marcaSelect.value;
        modeloSelect.innerHTML = '<option value="">Selecione o modelo</option>';
        anioSelect.innerHTML = '<option value="">Primeiro selecione o modelo</option>';
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

    function updateResult() {
        const marca = marcaSelect.value;
        const modelo = modeloSelect.value;
        const anio = anioSelect.value;

        if (marca && modelo && anio) {
            const brandName = vehicleData[marca].name;
            const modelName = vehicleData[marca].models[modelo].name;
            const params = new URLSearchParams({ marca: brandName, modelo: modelName, ano: anio });
            const href = CHECKOUT_URL === '#' ? '#' : `${CHECKOUT_URL}?${params}`;

            resultado.innerHTML = `
                <span class="result-label">O seu veículo</span>
                <div class="result-vehicle">${brandName} ${modelName} ${anio}</div>
                <span class="result-price">${formatEUR(KIT_PRICE)}</span>
                <p class="result-text">Kit completo (dianteiros + traseiros) · IVA incluído · Envio grátis para Portugal continental</p>
                <a href="${href}" class="btn-gold">Comprar agora →</a>
            `;
        } else {
            resultado.innerHTML = `
                <span class="result-label">Desde</span>
                <span class="result-price">${formatEUR(KIT_PRICE)}</span>
                <p class="result-text">Selecione o seu veículo acima para ver o seu kit à medida</p>
            `;
        }
    }

    updateResult();
});
