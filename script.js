let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
    if (slides.length === 0) return;
    
    // إخفاء جميع الصور
    slides.forEach(slide => slide.classList.remove('active'));
    
    // ضبط المؤشر لو تجاوز عدد الصور أو كان أقل من الصفر
    if (index >= slides.length) {
        currentSlideIndex = 0;
    } else if (index < 0) {
        currentSlideIndex = slides.length - 1;
    } else {
        currentSlideIndex = index;
    }
    
    // إظهار الصورة الحالية
    slides[currentSlideIndex].classList.add('active');
}

function moveSlide(direction) {
    showSlide(currentSlideIndex + direction);
}

// تشغيل أول صورة تلقائياً
document.addEventListener('DOMContentLoaded', () => {
    showSlide(0);
});
