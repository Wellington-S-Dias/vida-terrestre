document.addEventListener('DOMContentLoaded', () => {

    const videos = document.querySelectorAll('.hero-video');

    const titulo = document.querySelector('.hero-title');
    const texto = document.querySelector('.hero-text');

    const numeroSlide = document.querySelector('.slide-number');
    const totalSlides = document.querySelector('.slide-total');
    const barraProgresso = document.querySelector('.slide-progress-bar');


    if (!videos.length) {
        return;
    }


    const slides = [
        {
            video: '',
            titulo: 'A vida que existe aqui',
            texto: 'Conheça a biodiversidade brasileira e descubra a importância de proteger nossos ecossistemas.'
        },
        {
            video: '',
            titulo: 'Conheça nossa fauna',
            texto: 'Explore espécies, características e habitats dos animais encontrados no Brasil.'
        },
        {
            video: '',
            titulo: 'Descubra os biomas',
            texto: 'Conheça a diversidade de ambientes que formam a vida terrestre brasileira.'
        },
        {
            video: '',
            titulo: 'Proteja a vida terrestre',
            texto: 'Informação e conhecimento são passos importantes para a conservação da natureza.'
        }
    ];


    let slideAtual = 0;

    const duracaoSlide = 7000;


    totalSlides.textContent =
        String(slides.length).padStart(2, '0');


    function atualizarSlide() {

        const slide = slides[slideAtual];

        titulo.textContent = slide.titulo;

        texto.textContent = slide.texto;

        numeroSlide.textContent =
            String(slideAtual + 1).padStart(2, '0');


        if (slide.video) {

            const videoAtual = videos[slideAtual % videos.length];

            videoAtual.src = slide.video;

            videoAtual.load();

            videoAtual.play().catch(() => {});

        }

    }


    function iniciarProgresso() {

        const inicio = Date.now();


        function atualizar() {

            const decorrido = Date.now() - inicio;

            const progresso =
                Math.min(
                    (decorrido / duracaoSlide) * 100,
                    100
                );


            barraProgresso.style.width =
                `${progresso}%`;


            if (progresso < 100) {
                requestAnimationFrame(atualizar);
            }

        }


        requestAnimationFrame(atualizar);

    }


    function proximoSlide() {

        slideAtual =
            (slideAtual + 1) % slides.length;


        atualizarSlide();

        iniciarProgresso();

    }


    atualizarSlide();

    iniciarProgresso();


    setInterval(
        proximoSlide,
        duracaoSlide
    );

});