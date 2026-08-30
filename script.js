let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slider-container .slide');
const totalSlides = slides.length;

function showSlide(index) {
    if (slides.length === 0) return;
    slides.forEach(slide => slide.classList.remove('active'));
    currentSlideIndex = (index + totalSlides) % totalSlides;
    slides[currentSlideIndex].classList.add('active');
}

function moveSlide(direction) {
    showSlide(currentSlideIndex + direction);
}

// Lightbox Modal Functions
let modalSlideIndex = 0;

function openLightbox(index) {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;
    modalSlideIndex = index;
    updateModalImage();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function moveModalSlide(direction) {
    modalSlideIndex = (modalSlideIndex + direction + totalSlides) % totalSlides;
    updateModalImage();
}

function updateModalImage() {
    const lightboxImg = document.getElementById('lightboxImg');
    if (lightboxImg && slides[modalSlideIndex]) {
        lightboxImg.src = slides[modalSlideIndex].src;
    }
}

// Close lightbox when clicking outside the box
window.onclick = function(event) {
    const modal = document.getElementById('lightboxModal');
    if (event.target === modal) {
        closeLightbox();
    }
};

// Keyboard Arrow and Esc Navigation
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('lightboxModal');
    if (modal && modal.style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') moveModalSlide(1);
        if (e.key === 'ArrowLeft') moveModalSlide(-1);
    }
});
