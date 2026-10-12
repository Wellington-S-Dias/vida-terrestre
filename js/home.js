const sections = [
    {
        title: "Animais",
        text: "O mundo é repleto de animais diversos, cada um com seu papel no equilíbrio da vida.",
        images: [
            "/images/index/arara-azul(index).jpg",
            "/images/index/lobo-guara(index).jpg",
            "/images/index/mico-leao-dourado(index).jpg"
        ]
    },
    {
        title: "Paisagens",
        text: "Poucos param para perceber as belezas naturais da Terra e tudo aquilo que elas sustentam.",
        images: [
            "/images/index/mata-atlantica-na-serra-do-mar(index).jpg",
            "/images/index/chapada-dos-veadeiros(index).jpg",
            "/images/index/lencois-maranhenses(index).jpg"
        ]
    },
    {
        title: "Habitats",
        text: "Cada espécie depende de um habitat capaz de oferecer as condições necessárias para sua sobrevivência.",
        images: [
            "/images/index/floresta-tropical(index).jpg",
            "/images/index/pantanal(index).jpg",
            "/images/index/savana(index).jpg"
        ]
    },
];


const images = document.querySelectorAll('.hero-image');
const title = document.querySelector('.hero-title');
const text = document.querySelector('.hero-text');
const slideNumber = document.querySelector('.slide-number');
const progressBar = document.querySelector('.slide-progress-bar');

const sectionDuration = 4500;
let currentSectionIndex = 0;
let currentImageIndex = 0;
const sectionImageIndexes = sections.map(() => 0);
let timer = null;
let transitionId = 0;


/* =========================
   FUNÇÕES AUXILIARES
========================= */

/* =========================
   TROCA DE IMAGEM
========================= */

function switchImage(src) {
    if (images.length < 2) return;

    const activeImage = images[currentImageIndex];
    const nextImageIndex = currentImageIndex === 0 ? 1 : 0;
    const nextImage = images[nextImageIndex];
    const thisTransition = ++transitionId;

    nextImage.classList.remove('active');
    nextImage.onload = () => {
        if (thisTransition !== transitionId) return;
        nextImage.classList.add('active');
        activeImage.classList.remove('active');
        currentImageIndex = nextImageIndex;
    };
    nextImage.onerror = () => console.error('Erro ao carregar imagem:', src);
    nextImage.src = src;

    // Imagens já carregadas entram sem esperar um novo evento load.
    if (nextImage.complete && nextImage.naturalWidth > 0) nextImage.onload();
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


    // Cada categoria percorre suas fotos em ordem, sem alterar a sequência das seções.
    const imageIndex = sectionImageIndexes[currentSectionIndex];
    switchImage(section.images[imageIndex]);
    sectionImageIndexes[currentSectionIndex] =
        (imageIndex + 1) % section.images.length;


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

    if (images.length === 0) return;


    const firstSection = sections[0];

    const initialImageSrc = firstSection.images[sectionImageIndexes[0]];
    sectionImageIndexes[0] = 1 % firstSection.images.length;


    // Primeira imagem
    images[0].src = initialImageSrc;
    images[0].classList.add('active');


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
