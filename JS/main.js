const secoes = [
    {
        titulo: "Animais",
        texto: "O mundo é repleto de animais diversos, cada um com seu papel no equilíbrio da vida.",
        videos: [
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787455984/animal-1.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456254/animal-2.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456252/animal-3.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456233/animal-4.mp4"
        ]
    },

    {
        titulo: "Paisagens",
        texto: "Poucos param para perceber as belezas naturais da Terra e tudo aquilo que elas sustentam.",
        videos: [
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456646/landscape-1.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456642/landscape-2.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456645/landscape-3.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456659/landscape-4.mp4"
        ]
    },

    {
        titulo: "Habitats",
        texto: "Cada espécie depende de um habitat capaz de oferecer as condições necessárias para sua sobrevivência.",
        videos: [
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787460405/habitat-1.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456724/habitat-2.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456725/habitat-3.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787461210/habitat-4.mp4"
        ]
    },

    {
        titulo: "Conservação",
        texto: "Preservar a vida terrestre é garantir que todas essas formas de vida continuem existindo no futuro.",
        videos: [
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787456622/deforestation-1.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787459834/deforestation-2.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787462626/deforestation-3.mp4",
            "https://res.cloudinary.com/bsgaagkl/video/upload/v1787460454/deforestation-4.mp4"
        ]
    }
];


const videos = document.querySelectorAll(".hero-video");
const titulo = document.querySelector(".hero-title");
const texto = document.querySelector(".hero-text");
const numero = document.querySelector(".slide-number");
const progressBar = document.querySelector(".slide-progress-bar");
const header = document.querySelector(".header");


const tempoPorSecao = 7000;
const tempoTransicao = 1200;


let secaoAtual = 0;
let videoAtual = 0;
let temporizador;


/* =========================================
   ESCOLHER VÍDEO
========================================= */

function escolherVideoAleatorio(videosDaSecao) {
    return Math.floor(
        Math.random() * videosDaSecao.length
    );
}


/* =========================================
   TROCAR VÍDEO
========================================= */

function trocarVideo(caminho) {

    const videoAtivo = videos[videoAtual];

    const proximoVideo =
        videos[videoAtual === 0 ? 1 : 0];


    proximoVideo.src = caminho;

    proximoVideo.load();

    proximoVideo.currentTime = 0;


    proximoVideo.addEventListener(
        "canplay",
        function iniciarTransicao() {

            proximoVideo.removeEventListener(
                "canplay",
                iniciarTransicao
            );


            proximoVideo.play().catch(() => {});


            proximoVideo.classList.add("active");

            videoAtivo.classList.remove("active");


            setTimeout(() => {

                videoAtivo.pause();

                videoAtivo.removeAttribute("src");

                videoAtivo.load();


                videoAtual =
                    videoAtual === 0 ? 1 : 0;

            }, tempoTransicao);

        }
    );
}


/* =========================================
   CARREGAR SEÇÃO
========================================= */

function carregarSecao() {

    const secao = secoes[secaoAtual];


    const indiceVideo =
        escolherVideoAleatorio(secao.videos);


    const caminho =
        secao.videos[indiceVideo];


    /* Texto */

    titulo.textContent =
        secao.titulo;

    texto.textContent =
        secao.texto;


    /* Número */

    numero.textContent =
        String(secaoAtual + 1).padStart(2, "0");


    /* Barra de progresso */

    progressBar.style.transition = "none";

    progressBar.style.width = "0%";

    progressBar.offsetWidth;


    progressBar.style.transition =
        `width ${tempoPorSecao}ms linear`;

    progressBar.style.width = "100%";


    /* Vídeo */

    trocarVideo(caminho);


    /* Reinicia temporizador */

    clearTimeout(temporizador);


    temporizador = setTimeout(() => {

        secaoAtual++;

        if (secaoAtual >= secoes.length) {
            secaoAtual = 0;
        }

        carregarSecao();

    }, tempoPorSecao);
}


/* =========================================
   PRIMEIRO VÍDEO
========================================= */

const primeiroVideo =
    secoes[0].videos[
        escolherVideoAleatorio(secoes[0].videos)
    ];


videos[0].src = primeiroVideo;

videos[0].load();


videos[0].addEventListener(
    "canplay",
    function iniciarPrimeiroVideo() {

        videos[0].removeEventListener(
            "canplay",
            iniciarPrimeiroVideo
        );

        videos[0].play().catch(() => {});
    }
);


/* =========================================
   INICIAR HERO
========================================= */

carregarSecao();


/* =========================================
   HEADER AO ROLAR
========================================= */

window.addEventListener("scroll", () => {

    if (window.scrollY > 100) {

        header.classList.add("active");

    } else {

        header.classList.remove("active");

    }

});