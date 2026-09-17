const header = document.querySelector('.header');

if (header) {
    const handleScroll = () => {
        if (window.scrollY > 100) {
            header.classList.add('active');
        } else {
            header.classList.remove('active');
        }
    };

    // Executa a checagem no carregamento inicial (caso a página recarregue rolada)
    handleScroll();

    // Evento de scroll com listener
    window.addEventListener('scroll', handleScroll, { passive: true });
}