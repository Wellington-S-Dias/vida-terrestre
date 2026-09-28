const sections = [
    {
        title: "Animais",
        text: "O mundo é repleto de animais diversos, cada um com seu papel no equilíbrio da vida.",
        videos: [
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787455984/animal-1.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456254/animal-2.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456252/animal-3.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456233/animal-4.mp4"
        ]
    },
    {
        title: "Paisagens",
        text: "Poucos param para perceber as belezas naturais da Terra e tudo aquilo que elas sustentam.",
        videos: [
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456646/landscape-1.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456642/landscape-2.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456645/landscape-3.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456659/landscape-4.mp4"
        ]
    },
    {
        title: "Habitats",
        text: "Cada espécie depende de um habitat capaz de oferecer as condições necessárias para sua sobrevivência.",
        videos: [
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787460405/habitat-1.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456724/habitat-2.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456725/habitat-3.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787461210/habitat-4.mp4"
        ]
    },
    {
        title: "Conservação",
        text: "Preservar a vida terrestre é garantir que todas essas formas de vida continuem existindo no futuro.",
        videos: [
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456622/deforestation-1.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787459834/deforestation-2.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787462626/deforestation-3.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787460454/deforestation-4.mp4"
        ]
    }
];

const videos = document.querySelectorAll('.hero-video');
const title = document.querySelector('.hero-title');
const text = document.querySelector('.hero-text');
const slideNumber = document.querySelector('.slide-number');
const progressBar = document.querySelector('.slide-progress-bar');

const sectionDuration = 4500;
const transitionDuration = 1200;

let currentSectionIndex = 0;
let currentVideoIndex = 0;
let timer;

function getRandomVideoIndex(videoList) {
    return Math.floor(Math.random() * videoList.length);
}

function switchVideo(src) {
    if (videos.length < 2) return;

    const activeVideo = videos[currentVideoIndex];
    const nextVideoIndex = currentVideoIndex === 0 ? 1 : 0;
    const nextVideo = videos[nextVideoIndex];

    nextVideo.src = src;
    nextVideo.load();
    nextVideo.currentTime = 0;

    const startTransition = () => {
        nextVideo.removeEventListener('canplay', startTransition);

        nextVideo.play().catch(() => {});

        nextVideo.classList.add('active');

        if (activeVideo) {
            activeVideo.classList.remove('active');
        }

        setTimeout(() => {
            if (activeVideo) {
                activeVideo.pause();
                activeVideo.removeAttribute('src');
                activeVideo.load();
            }

            currentVideoIndex = nextVideoIndex;
        }, transitionDuration);
    };

    nextVideo.addEventListener('canplay', startTransition);
}

function loadSection() {
    const section = sections[currentSectionIndex];

    if (!section) return;

    const randomVideoIndex = getRandomVideoIndex(section.videos);
    const videoSrc = section.videos[randomVideoIndex];

    if (title) {
        title.textContent = section.title;
    }

    if (text) {
        text.textContent = section.text;
    }

    if (slideNumber) {
        slideNumber.textContent =
            String(currentSectionIndex + 1).padStart(2, '0');
    }

    if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';

        progressBar.offsetHeight;

        progressBar.style.transition =
            `width ${sectionDuration}ms linear`;

        progressBar.style.width = '100%';
    }

    switchVideo(videoSrc);

    clearTimeout(timer);

    timer = setTimeout(() => {
        currentSectionIndex =
            (currentSectionIndex + 1) % sections.length;

        loadSection();
    }, sectionDuration);
}

document.addEventListener('DOMContentLoaded', () => {
    if (videos.length === 0) return;

    const initialVideoSrc =
        sections[0].videos[
            getRandomVideoIndex(sections[0].videos)
        ];

    videos[0].src = initialVideoSrc;
    videos[0].load();

    const startInitialVideo = () => {
        videos[0].removeEventListener(
            'canplay',
            startInitialVideo
        );

        videos[0].play().catch(() => {});
    };

    videos[0].addEventListener(
        'canplay',
        startInitialVideo
    );

    loadSection();
});