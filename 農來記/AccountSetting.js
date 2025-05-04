document.addEventListener("DOMContentLoaded", function() {
    const sectionToggle = document.querySelector('.section-toggle');
    const additionalSection = document.querySelector('.additional-section');

    sectionToggle.addEventListener('click', function() {
        additionalSection.style.display = 
            additionalSection.style.display === 'none' ? 'block' : 'none';
    });
});