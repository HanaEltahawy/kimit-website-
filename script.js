/* =========================================================
   KIMIT REAL ESTATE - SHARED SCRIPT (all 5 pages)
   - Instant card sliders (independent per card)
   - ONE lightbox modal system for every project on every page
   - Dedicated per-project VIP inquiry form inside every modal
   - Bottom lead form (#leadForm)
   - Scroll lock guaranteed never to freeze
   ========================================================= */

const scriptURL = 'https://script.google.com/macros/s/AKfycbx_EDZNscvPPt3ZlzH382WYR83rsrMs9_3Sft7eoAb0RgYKyllyBKXy1-jOwinHNv7B/exec';

/* ---------- Card sliders ---------- */
const sliderState = new WeakMap();

function getSliderState(container) {
    let state = sliderState.get(container);
    if (!state) {
        const slides = container.querySelectorAll('.slide');
        let index = Array.prototype.findIndex.call(slides, (s) => s.classList.contains('active'));
        state = {
            slides: slides,
            index: index < 0 ? 0 : index,
            counter: container.querySelector('.current-slide')
        };
        sliderState.set(container, state);
    }
    return state;
}

function preloadImage(img) {
    if (img && img.src) new Image().src = img.src;
}

function moveCardSlide(button, direction) {
    const container = button.closest('.slider-container');
    if (!container) return;
    const state = getSliderState(container);
    const total = state.slides.length;
    if (!total) return;

    state.slides[state.index].classList.remove('active');
    state.index = (state.index + direction + total) % total;
    state.slides[state.index].classList.add('active');

    if (state.counter) state.counter.textContent = state.index + 1;
    preloadImage(state.slides[(state.index + 1) % total]);
}

/* ---------- Lightbox modal ---------- */
let activeModalId = null;
let activeModalSlideIndex = 0;
let activeModalSlides = [];

function cardIdFor(modalId) {
    const modal = document.getElementById(modalId);
    return (modal && modal.dataset.card) || modalId.replace(/Modal$/, 'Card');
}

function modalIdFor(card) {
    return card.dataset.modal || card.id.replace(/Card$/, 'Modal');
}

function lockScroll() {
    document.body.classList.add('modal-open');
}

function unlockScrollIfIdle() {
    if (!document.querySelector('.lightbox-modal.active')) {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    }
}

function updateModalImage() {
    if (!activeModalId) return;
    const modal = document.getElementById(activeModalId);
    const img = modal && modal.querySelector('.lightboxImg');
    const slide = activeModalSlides[activeModalSlideIndex];
    if (img && slide) {
        img.decoding = 'async';
        img.src = slide.currentSrc || slide.src;
        const total = activeModalSlides.length;
        if (total > 1) {
            preloadImage(activeModalSlides[(activeModalSlideIndex + 1) % total]);
            preloadImage(activeModalSlides[(activeModalSlideIndex - 1 + total) % total]);
        }
    }
}

function openModal(modalId, slideIndex) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        unlockScrollIfIdle();
        return;
    }

    closeAllModals();

    activeModalId = modalId;
    activeModalSlides = Array.prototype.slice.call(
        document.querySelectorAll('#' + cardIdFor(modalId) + ' .slide')
    );
    activeModalSlideIndex = Math.max(0, Math.min(slideIndex || 0, activeModalSlides.length - 1));

    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    const container = modal.querySelector('.lightbox-container');
    if (container) container.scrollTop = 0;

    updateModalImage();
    modal.classList.add('active');
    lockScroll();

    const single = activeModalSlides.length <= 1;
    modal.querySelectorAll('.modal-prev, .modal-next').forEach((b) => {
        b.style.display = single ? 'none' : '';
    });
}

function closeModal(modalId) {
    const id = modalId || activeModalId;
    const modal = id && document.getElementById(id);
    if (modal) modal.classList.remove('active');
    if (id === activeModalId) {
        activeModalId = null;
        activeModalSlides = [];
        activeModalSlideIndex = 0;
    }
    unlockScrollIfIdle();
}

function closeAllModals() {
    document.querySelectorAll('.lightbox-modal.active').forEach((m) => m.classList.remove('active'));
    activeModalId = null;
    activeModalSlides = [];
    activeModalSlideIndex = 0;
    unlockScrollIfIdle();
}

function moveModalSlide(direction) {
    const total = activeModalSlides.length;
    if (!activeModalId || !total) return;
    activeModalSlideIndex = (activeModalSlideIndex + direction + total) % total;
    updateModalImage();
}

/* ---------- Delegated Click Handler ---------- */
document.addEventListener('click', function (e) {
    const t = e.target;

    // 1. Click dark backdrop closes modal
    if (t.classList && t.classList.contains('lightbox-modal')) {
        closeModal(t.id);
        return;
    }

    // 2. Click close button (×)
    const closeBtn = t.closest('.close-lightbox');
    if (closeBtn) {
        const m = closeBtn.closest('.lightbox-modal');
        closeModal(m ? m.id : null);
        return;
    }

    // 3. Click modal arrows
    const modalArrow = t.closest('.modal-prev, .modal-next');
    if (modalArrow) {
        moveModalSlide(modalArrow.classList.contains('modal-prev') ? -1 : 1);
        return;
    }

    // 4. Click card slider arrows
    const cardArrow = t.closest('.slider-container .prev, .slider-container .next');
    if (cardArrow) {
        moveCardSlide(cardArrow, cardArrow.classList.contains('prev') ? -1 : 1);
        return;
    }

    // 5. Click card image -> open modal at that image
    const slide = t.closest('.card .slide');
    if (slide) {
        const card = slide.closest('.card');
        const idx = Array.prototype.indexOf.call(card.querySelectorAll('.slide'), slide);
        openModal(modalIdFor(card), idx);
        return;
    }

    // 6. Click card CTA button ("Inquire & View Details" / "View Details & Floor Plans") -> open modal
    const cardBtn = t.closest('.card button.btn-card');
    if (cardBtn) {
        e.preventDefault();
        const card = cardBtn.closest('.card');
        const container = card.querySelector('.slider-container');
        openModal(modalIdFor(card), container ? getSliderState(container).index : 0);
        return;
    }

    // 7. Smooth anchor navigation (#contact, #featured, etc.)
    const anchor = t.closest('a[href^="#"]');
    if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                closeAllModals();
                requestAnimationFrame(function () {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (history.replaceState) history.replaceState(null, '', href);
                });
            }
        }
    }
});

/* ---------- Keyboard: Escape + arrows ---------- */
document.addEventListener('keydown', function (e) {
    if (!activeModalId) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowRight') moveModalSlide(1);
    else if (e.key === 'ArrowLeft') moveModalSlide(-1);
});

window.addEventListener('pageshow', closeAllModals);

/* ---------- Helper to submit any lead form to Google Sheet ---------- */
function submitLeadPayload(formData, btn, statusEl, formEl) {
    const idleLabel = btn ? (btn.dataset.label || btn.innerText) : 'Register Interest';
    if (btn) {
        btn.dataset.label = idleLabel;
        btn.disabled = true;
        btn.innerText = 'Sending...';
    }
    if (statusEl) statusEl.style.display = 'none';

    const restore = function () {
        if (btn) {
            btn.disabled = false;
            btn.innerText = idleLabel;
        }
    };

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(formData)
    })
        .then(function () {
            if (statusEl) {
                statusEl.innerText = 'Thank you! Our VIP consultant will reach out shortly.';
                statusEl.style.display = 'block';
            }
            formEl.reset();
            restore();
        })
        .catch(function () {
            alert('Error submitting form. Please try again.');
            restore();
        });
}

/* ---------- 1) Bottom Page Form (#leadForm) ---------- */
const leadForm = document.getElementById('leadForm');
if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const field = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };
        submitLeadPayload(
            {
                fullName: field('fullName'),
                phone: field('phone'),
                project: field('project'),
                notes: field('notes')
            },
            document.getElementById('submitBtn') || leadForm.querySelector('button[type="submit"]'),
            document.getElementById('formStatus'),
            leadForm
        );
    });
}

/* ---------- 2) Dedicated Per-Project Modal Forms (.modal-lead-form) ---------- */
document.addEventListener('submit', function (e) {
    const modalForm = e.target.closest('.modal-lead-form');
    if (!modalForm) return;
    e.preventDefault();

    const projectName = modalForm.dataset.project || 'Project Inquiry';
    const nameInput = modalForm.querySelector('input[name="fullName"]');
    const phoneInput = modalForm.querySelector('input[name="phone"]');
    const notesInput = modalForm.querySelector('textarea[name="notes"]');

    submitLeadPayload(
        {
            fullName: nameInput ? nameInput.value : '',
            phone: phoneInput ? phoneInput.value : '',
            project: projectName,
            notes: notesInput && notesInput.value ? notesInput.value : 'VIP Inquiry for ' + projectName
        },
        modalForm.querySelector('button[type="submit"]'),
        modalForm.querySelector('.modal-form-status'),
        modalForm
    );
});