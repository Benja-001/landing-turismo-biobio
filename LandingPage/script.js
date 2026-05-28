document.addEventListener('DOMContentLoaded', () => {
    
    /* -------------------------------------------------------------
       1. Sticky Nav con Glassmorphism (Desenfoque)
    ------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        // Si bajamos más de 50px, activamos el efecto glass
        if (window.scrollY > 50) {
            navbar.classList.add('glass-nav');
            navbar.classList.remove('py-4', 'bg-transparent');
            navbar.classList.add('py-2'); // Se hace un poco más delgado
        } else {
            navbar.classList.remove('glass-nav', 'py-2');
            navbar.classList.add('py-4', 'bg-transparent');
        }
    });

    /* -------------------------------------------------------------
       2. Scroll Animations (Fade-up)
    ------------------------------------------------------------- */
    const fadeElements = document.querySelectorAll('.fade-up');
    
    const observerOptions = {
        root: null, // Usa el viewport del navegador
        rootMargin: '0px',
        threshold: 0.15 // Se activa cuando el 15% del elemento es visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Dejar de observar una vez animado
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    /* -------------------------------------------------------------
       3. Lógica y Validación de Formularios (Hero y Footer)
    ------------------------------------------------------------- */
    
    // ** ¡IMPORTANTE! Reemplaza este string con la URL que te de Google Apps Script **
    const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2cuim1MYiinjPr6BjwztIl8AyAjdwHfFechiXJ8cKerusGjIDdL8akvDYG3V9sn_Ybw/exec'; 

    const forms = [
        { id: 'hero-form', inputId: 'hero-email', errorId: 'hero-error', successId: 'hero-success' },
        { id: 'footer-form', inputId: 'footer-email', errorId: 'footer-error', successId: 'footer-success' }
    ];

    // Regex sencilla para correos
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    forms.forEach(formObj => {
        const formEl = document.getElementById(formObj.id);
        if (!formEl) return;

        const inputEl = document.getElementById(formObj.inputId);
        const nombreEl = document.getElementById(formObj.id.replace('form', 'nombre'));
        const apellidoEl = document.getElementById(formObj.id.replace('form', 'apellido'));
        const errorEl = document.getElementById(formObj.errorId);
        const successEl = document.getElementById(formObj.successId);
        const submitBtn = formEl.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');

        // Limpiar estilos de error cuando el usuario empieza a escribir de nuevo
        inputEl.addEventListener('input', () => {
            inputEl.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
            
            // Retornar estilos normales dependiendo de si es hero o footer
            if (formObj.id === 'hero-form') {
                 inputEl.classList.add('border-gray-200', 'focus:border-bosque', 'focus:ring-bosque/20');
            }
            errorEl.classList.add('hidden');
        });

        // Manejador del evento submit
        formEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = inputEl.value.trim();
            const nombre = nombreEl ? nombreEl.value.trim() : '';
            const apellido = apellidoEl ? apellidoEl.value.trim() : '';

            // Validación de formato
            if (!validateEmail(email)) {
                // Quitar bordes por defecto
                inputEl.classList.remove('border-gray-200', 'focus:border-bosque', 'focus:ring-bosque/20', 'border-transparent');
                // Agregar bordes rojos de error
                inputEl.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
                errorEl.classList.remove('hidden');
                return;
            }

            // Estado de Carga (Loading)
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
            btnText.textContent = 'Enviando...';
            btnSpinner.classList.remove('hidden');

            try {
                // Petición al Backend (Google Apps Script)
                // Usamos mode: 'no-cors' para evitar bloqueos por CORS desde el navegador.
                // Ojo: Esto significa que no podremos leer la respuesta (será 'opaque'), 
                // pero sí sabemos que el POST se ejecutará en Google Sheets.
                await fetch(APP_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ nombre: nombre, apellido: apellido, email: email })
                });

                // Estado de Éxito (Ocultamos el form y mostramos el mensaje)
                formEl.style.opacity = '0'; // Transición suave (CSS tiene transition-opacity)
                
                setTimeout(() => {
                    formEl.classList.add('hidden');
                    successEl.classList.remove('hidden');
                }, 300);

                // Disparar evento de conversión (Métricas - Google Analytics)
                if (typeof gtag === 'function') {
                    gtag('event', 'generate_lead', {
                        'event_category': 'engagement',
                        'event_label': formObj.id
                    });
                }

            } catch (error) {
                console.error('Error al guardar el correo:', error);
                alert('Hubo un error de conexión. Por favor revisa tu internet y vuelve a intentar.');
                
                // Revertir el estado del botón en caso de error
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
                btnText.textContent = formObj.id === 'hero-form' ? 'Unirme a la lista' : 'Quiero mi acceso';
                btnSpinner.classList.add('hidden');
            }
        });
    });
    
    /* -------------------------------------------------------------
       4. Carrusel Vertical Interactivo
    ------------------------------------------------------------- */
    const carouselTrack = document.getElementById('carousel-track');
    if (carouselTrack) {
        const carouselData = [
            {
                img: "https://www.radioudec.cl/wp-content/uploads/2023/01/Lenga.jpg",
                title: "Caleta Lenga",
                subtitle: "Descubre nuevas rutas sin congestión"
            },
            {
                img: "https://assets.diarioconcepcion.cl/2023/02/pag-9-playa-ramuntcho-foto-facebook-pen%C3%ADnsula-de-hualpen-santuario-de-la-naturaleza.jpg",
                title: "Playa Ramuntcho",
                subtitle: "Un paraíso escondido en la península"
            },
            {
                img: "https://images.mnstatic.com/54/ce/54ce4e39434f2f447d182d2f325ac619.jpg",
                title: "Parque Lota",
                subtitle: "Naturaleza, historia y hermosos jardines"
            },
            {
                img: "https://www.monumentos.gob.cl/sites/default/files/styles/16x9_grande/public/image-monumentos/zt_maule_1.jpg?h=00929156&itok=pUGHF9AP",
                title: "Sector Puchoco-Schwager",
                subtitle: "Historia y patrimonio minero frente al mar"
            },
            {
                img: "https://upload.wikimedia.org/wikipedia/commons/8/84/DSCF0045_B.jpg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original",
                title: "Mirador Alemán",
                subtitle: "Vistas panorámicas y naturaleza única"
            }
        ];

        // Generar HTML
        carouselTrack.innerHTML = carouselData.map((item, i) => `
            <div class="carousel-item absolute w-full h-full rounded-[2rem] overflow-hidden transition-all duration-700 ease-out origin-center shadow-2xl border border-white/20" data-index="${i}">
                <img src="${item.img}" alt="${item.title}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-bosque/90 via-bosque/20 to-transparent flex items-end p-8">
                    <div class="text-white text-left">
                        <p class="font-bold font-heading text-2xl drop-shadow-lg">${item.title}</p>
                        <p class="text-sm opacity-90 drop-shadow-md">${item.subtitle}</p>
                    </div>
                </div>
            </div>
        `).join('');

        const items = document.querySelectorAll('.carousel-item');
        let currentIndex = 0;
        let isAnimating = false;

        function updateCarousel() {
            items.forEach((item, index) => {
                let y = 0;
                let scale = 0.5;
                let blur = 20;
                let opacity = 0;
                let zIndex = 0;

                const prevIndex = (currentIndex - 1 + items.length) % items.length;
                const nextIndex = (currentIndex + 1) % items.length;

                if (index === currentIndex) {
                    y = 0; scale = 0.9; blur = 0; opacity = 1; zIndex = 20;
                } else if (index === prevIndex) {
                    y = -28; scale = 0.75; blur = 4; opacity = 0.8; zIndex = 10;
                } else if (index === nextIndex) {
                    y = 28; scale = 0.75; blur = 4; opacity = 0.8; zIndex = 10;
                }

                item.style.transform = `translateY(${y}%) scale(${scale})`;
                item.style.filter = `blur(${blur}px)`;
                item.style.opacity = opacity;
                item.style.zIndex = zIndex;
            });
        }

        function move(dir) {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex = (currentIndex + dir + items.length) % items.length;
            updateCarousel();
            setTimeout(() => isAnimating = false, 700);
        }

        // Eventos Botones
        document.getElementById('car-up').addEventListener('click', () => move(-1));
        document.getElementById('car-down').addEventListener('click', () => move(1));

        // Swipe Táctil
        let touchStartY = 0;
        const carouselEl = document.getElementById('vertical-carousel');
        carouselEl.addEventListener('touchstart', e => touchStartY = e.changedTouches[0].screenY);
        carouselEl.addEventListener('touchend', e => {
            const touchEndY = e.changedTouches[0].screenY;
            if (touchStartY - touchEndY > 50) move(1); // Swipe Up -> Siguiente
            if (touchEndY - touchStartY > 50) move(-1); // Swipe Down -> Anterior
        });

        // Evento Rueda (Wheel)
        let wheelTimer;
        carouselEl.addEventListener('wheel', e => {
            e.preventDefault(); // Prevenir scroll de la página al estar sobre el carrusel
            if (isAnimating) return;
            
            // Usar un pequeño timer para evitar que haga saltos múltiples por un solo giro de rueda
            clearTimeout(wheelTimer);
            wheelTimer = setTimeout(() => {
                if (e.deltaY > 0) move(1);
                else if (e.deltaY < 0) move(-1);
            }, 50);
        }, { passive: false });

        // Inicializar
        updateCarousel();
        
        // Autoplay cada 3 segundos
        let autoplayInterval = setInterval(() => move(1), 3000);
        
        // Pausar autoplay si el usuario interactúa
        carouselEl.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
        carouselEl.addEventListener('mouseleave', () => {
            clearInterval(autoplayInterval);
            autoplayInterval = setInterval(() => move(1), 3000);
        });
    }
});
