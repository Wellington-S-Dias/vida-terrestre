const sections = [
    {
        title: "Animais",
        text: "O mundo é repleto de animais diversos, cada um com seu papel no equilíbrio da vida.",
        videos: [
            "../vids/animal-1.mp4",
            "../vids/animal-2.mp4",
            "../vids/animal-3.mp4",
            "../vids/animal-4.mp4"
        ]
    },
    {
        title: "Paisagens",
        text: "Poucos param para perceber as belezas naturais da Terra e tudo aquilo que elas sustentam.",
        videos: [
            "../vids/paisagem-1.mp4",
            "../vids/paisagem-2.mp4",
            "../vids/paisagem-3.mp4",
            "../vids/paisagem-4.mp4"
        ]
    },
    {
        title: "Habitats",
        text: "Cada espécie depende de um habitat capaz de oferecer as condições necessárias para sua sobrevivência.",
        videos: [
            "../vids/habitat-1.mp4",
            "../vids/habitat-2.mp4",
            "../vids/habitat-3.mp4",
            "../vids/habitat-4.mp4"
        ]
    },
    {
        title: "Conservação",
        text: "Preservar a vida terrestre é garantir que todas essas formas de vida continuem existindo no futuro.",
        videos: [
            "../vids/conservacao-1.mp4",
            "../vids/conservacao-2.mp4",
            "../vids/conservacao-3.mp4",
            "../vids/conservacao-4.mp4"
        ]
    }
];


const videos = document.querySelectorAll('.hero-video');
const title = document.querySelector('.hero-title');
const text = document.querySelector('.hero-text');
const slideNumber = document.querySelector('.slide-number');
const progressBar = document.querySelector('.slide-progress-bar');

const sectionDuration = 4500;
const transitionDuration = 1000;

let currentSectionIndex = 0;
let currentVideoIndex = 0;
let timer = null;
let transitionId = 0;


/* =========================
   FUNÇÕES AUXILIARES
========================= */

function getRandomVideoIndex(videoList) {
    return Math.floor(Math.random() * videoList.length);
}


/* =========================
   TROCA DE VÍDEO
========================= */

function switchVideo(src) {
    if (videos.length < 2) return;

    const activeVideo = videos[currentVideoIndex];
    const nextVideoIndex = currentVideoIndex === 0 ? 1 : 0;
    const nextVideo = videos[nextVideoIndex];

    const thisTransition = ++transitionId;

    // Remove listeners antigos
    nextVideo.oncanplay = null;
    nextVideo.onerror = null;

    // Configura o próximo vídeo
    nextVideo.classList.remove('active');
    nextVideo.pause();

    // Só troca o src se realmente for outro vídeo
    if (nextVideo.src !== new URL(src, window.location.href).href) {
        nextVideo.src = src;
        nextVideo.load();
    }

    const startTransition = () => {
        if (thisTransition !== transitionId) return;

        nextVideo.oncanplay = null;

        nextVideo.currentTime = 0;

        nextVideo.play().catch(error => {
            console.error("Erro ao reproduzir vídeo:", error);
        });

        nextVideo.classList.add('active');

        if (activeVideo) {
            activeVideo.classList.remove('active');
        }

        setTimeout(() => {
            if (thisTransition !== transitionId) return;

            if (activeVideo) {
                activeVideo.pause();

                // NÃO faça isso:
                // activeVideo.removeAttribute('src');
                // activeVideo.load();
            }

            currentVideoIndex = nextVideoIndex;
        }, transitionDuration);
    };

    // Se já estiver pronto, troca imediatamente
    if (nextVideo.readyState >= 3) {
        startTransition();
    } else {
        nextVideo.oncanplay = startTransition;
    }

    nextVideo.onerror = () => {
        console.error("Erro ao carregar vídeo:", src);
    };
}


/* =========================
   CARREGA UMA SEÇÃO
========================= */

function loadSection() {

    const section = sections[currentSectionIndex];

    if (!section) return;


    // Texto
    if (title) {
        title.textContent = section.title;
    }

    if (text) {
        text.textContent = section.text;
    }


    // Número
    if (slideNumber) {
        slideNumber.textContent =
            String(currentSectionIndex + 1).padStart(2, '0');
    }


    // Barra de progresso
    if (progressBar) {

        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';

        // Força o navegador a aplicar o reset
        progressBar.offsetHeight;

        progressBar.style.transition =
            `width ${sectionDuration}ms linear`;

        progressBar.style.width = '100%';
    }


    // Escolhe vídeo aleatório
    const randomVideoIndex =
        getRandomVideoIndex(section.videos);

    const videoSrc =
        section.videos[randomVideoIndex];


    // Troca vídeo
    switchVideo(videoSrc);


    // Cancela timer anterior
    clearTimeout(timer);


    // Próxima seção
    timer = setTimeout(() => {

        currentSectionIndex =
            (currentSectionIndex + 1) % sections.length;

        loadSection();

    }, sectionDuration);
}


/* =========================
   INICIALIZAÇÃO
========================= */

document.addEventListener('DOMContentLoaded', () => {

    if (videos.length === 0) return;


    const firstSection = sections[0];

    const initialVideoSrc =
        firstSection.videos[
            getRandomVideoIndex(firstSection.videos)
        ];


    // Primeiro vídeo
    videos[0].src = initialVideoSrc;
    videos[0].load();


    videos[0].oncanplay = () => {

        videos[0].oncanplay = null;

        videos[0].play().catch(() => {});

        videos[0].classList.add('active');
    };


    // Atualiza textos e inicia o timer,
    // mas NÃO troca o vídeo novamente.
    if (title) {
        title.textContent = firstSection.title;
    }

    if (text) {
        text.textContent = firstSection.text;
    }

    if (slideNumber) {
        slideNumber.textContent = '01';
    }


    if (progressBar) {

        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';

        progressBar.offsetHeight;

        progressBar.style.transition =
            `width ${sectionDuration}ms linear`;

        progressBar.style.width = '100%';
    }


    timer = setTimeout(() => {

        currentSectionIndex = 1;

        loadSection();

    }, sectionDuration);

});