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
                    body: JSON.stringify({ email: email })
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
});
