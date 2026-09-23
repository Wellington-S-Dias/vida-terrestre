const header = document.querySelector('.header');

if (header) {
    const handleScroll = () => {
        if (window.scrollY > 100) {
            header.classList.add('active');
        } else {
            header.classList.remove('active');
        }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
        passive: true
    });
}