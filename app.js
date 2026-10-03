/* ========================================
   ProTekar Portugal - App Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Navbar scroll effect ----
    const navbar = document.getElementById('navbar');
    const floatingCta = document.getElementById('floatingCta');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        if (scrollY > 600) {
            floatingCta.classList.add('visible');
        } else {
            floatingCta.classList.remove('visible');
        }
    });

    // ---- Mobile nav toggle ----
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // ---- Scroll reveal animations ----
    const revealElements = document.querySelectorAll(
        '.benefit-card, .testimonial-card, .detail-card, .comparison-row, .info-item'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ---- Counter animation ----
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateCounter(el, target, 2000);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));

    function animateCounter(el, target, duration) {
        const start = performance.now();
        const formatter = new Intl.NumberFormat('pt-PT');

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = formatter.format(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = formatter.format(target);
            }
        }

        requestAnimationFrame(update);
    }

    // ---- Vehicle configurator ----
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
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = models[key].name;
                modeloSelect.appendChild(opt);
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
            const years = vehicleData[marca].models[modelo].years;
            years.forEach(year => {
                const opt = document.createElement('option');
                opt.value = year;
                opt.textContent = year;
                anioSelect.appendChild(opt);
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
            const basePrice = 79.90 + Math.floor(Math.random() * 30);
            const price = basePrice.toFixed(2).replace('.', ',');

            resultado.innerHTML = `
                <div class="result-active">
                    <div class="result-vehicle">
                        <span class="result-label">O seu veículo</span>
                        <span class="result-name">${brandName} ${modelName} ${anio}</span>
                    </div>
                    <div class="result-pricing">
                        <span class="result-price-label">Kit Completo (Dianteiros + Traseiros)</span>
                        <span class="result-price">${price} €</span>
                        <span class="result-note">IVA incluído · Envio gratuito para Portugal continental</span>
                    </div>
                    <a href="#" class="result-cta">ENCOMENDAR AGORA</a>
                </div>
            `;

            // Inject styles for result
            if (!document.getElementById('resultStyles')) {
                const style = document.createElement('style');
                style.id = 'resultStyles';
                style.textContent = `
                    .result-active { text-align: center; }
                    .result-vehicle { margin-bottom: 20px; }
                    .result-label { display: block; font-size: 0.75rem; color: rgba(240,240,245,0.4); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
                    .result-name { display: block; font-size: 1.4rem; font-weight: 800; letter-spacing: -0.02em; }
                    .result-pricing { margin-bottom: 24px; }
                    .result-price-label { display: block; font-size: 0.85rem; color: rgba(240,240,245,0.5); margin-bottom: 8px; }
                    .result-price { display: block; font-size: 2.5rem; font-weight: 900; background: linear-gradient(135deg, #2a7a53, #4ec48a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.02em; }
                    .result-note { display: block; font-size: 0.78rem; color: rgba(240,240,245,0.35); margin-top: 6px; }
                    .result-cta { display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #2a7a53, #4ec48a); color: #ffffff; font-weight: 700; font-size: 0.85rem; letter-spacing: 1.5px; border-radius: 28px; transition: 0.3s; box-shadow: 0 0 40px rgba(59,158,111,0.15); }
                    .result-cta:hover { transform: translateY(-2px); box-shadow: 0 0 60px rgba(59,158,111,0.25); }
                `;
                document.head.appendChild(style);
            }
        } else {
            resultado.innerHTML = `
                <div class="result-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M5 11V7a7 7 0 0114 0v4"/><circle cx="12" cy="16" r="1"/></svg>
                    <p>Selecione o seu carro acima para ver o preço personalizado</p>
                </div>
            `;
        }
    }

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
