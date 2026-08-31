// Function for Card Sliders (Independent for each card)
function moveCardSlide(button, direction) {
    const container = button.closest('.slider-container');
    const slides = container.querySelectorAll('.slide');
    let activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
    
    slides[activeIndex].classList.remove('active');
    let newIndex = (activeIndex + direction + slides.length) % slides.length;
    slides[newIndex].classList.add('active');
}

// Modal Lightbox Logic (Supports multiple project modals)
let activeModalId = null;
let activeModalSlideIndex = 0;

function openModal(modalId, slideIndex = 0) {
    activeModalId = modalId;
    activeModalSlideIndex = slideIndex;
    const modal = document.getElementById(modalId);
    if (!modal) return;

    updateModalImage();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId || activeModalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    activeModalId = null;
}

function moveModalSlide(direction) {
    if (!activeModalId) return;
    const cardId = activeModalId.replace('Modal', 'Card');
    const cardSlides = document.querySelectorAll(`#${cardId} .slide`);
    if (cardSlides.length === 0) return;

    activeModalSlideIndex = (activeModalSlideIndex + direction + cardSlides.length) % cardSlides.length;
    updateModalImage();
}

function updateModalImage() {
    if (!activeModalId) return;
    const modal = document.getElementById(activeModalId);
    const cardId = activeModalId.replace('Modal', 'Card');
    const cardSlides = document.querySelectorAll(`#${cardId} .slide`);
    const imgTarget = modal.querySelector('.lightboxImg');

    if (imgTarget && cardSlides[activeModalSlideIndex]) {
        imgTarget.src = cardSlides[activeModalSlideIndex].src;
    }
}

// Close modal when clicking on dark backdrop
window.onclick = function(event) {
    if (event.target.classList.contains('lightbox-modal')) {
        closeModal(event.target.id);
    }
};

// Keyboard Arrow and Escape Key Navigation
document.addEventListener('keydown', function(e) {
    if (activeModalId) {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') moveModalSlide(1);
        if (e.key === 'ArrowLeft') moveModalSlide(-1);
    }
});
const scriptURL = 'https://script.google.com/macros/s/AKfycbxQSQ2VR_mc626JkwTSKcSKF6ZosPaSnya39K8u_4Z3c6sjOWiwRC-u4-890DC42kQq/exec';

const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Sending...';
    }
    
    const formData = {
      fullName: document.getElementById('fullName')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      project: document.getElementById('project')?.value || '',
      notes: document.getElementById('notes')?.value || ''
    };
    
    fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(() => {
      if (formStatus) {
        formStatus.innerText = 'Thank you! We will reach out to you shortly.';
        formStatus.style.display = 'block';
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Register Interest';
      }
      leadForm.reset();
    })
    .catch(error => {
      alert('Error submitting form. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Register Interest';
      }
    });
  });
}
