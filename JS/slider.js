const estatisticas = [

    {
        numero: 742,
        titulo: "ESPÉCIES",
        descricao: "cadastradas"
    },

    {
        numero: 18,
        titulo: "HABITATS",
        descricao: "registrados"
    },

    {
        numero: 6,
        titulo: "BIOMAS",
        descricao: "representados"
    },

    {
        numero: 35,
        titulo: "ECOSSISTEMAS",
        descricao: "catalogados"
    }

];


const statNumber =
    document.querySelector(".stat-number");

const statTitle =
    document.querySelector(".stat-title");

const statDescription =
    document.querySelector(".stat-description");

const prevButton =
    document.querySelector(".slider-button.prev");

const nextButton =
    document.querySelector(".slider-button.next");

const statCard =
    document.querySelector(".stat-card");

const dots =
    document.querySelectorAll(".dot");


let statAtual = 0;


/* =========================================
   MOSTRAR ESTATÍSTICA
========================================= */

function mostrarEstatistica(direcao = "next") {

    const stat =
        estatisticas[statAtual];


    const deslocamento =
        direcao === "next"
            ? "-40px"
            : "40px";


    /* Saída */

    statCard.style.opacity = "0";

    statCard.style.transform =
        `translateX(${deslocamento})`;


    setTimeout(() => {

        /* Atualiza conteúdo */

        statNumber.textContent =
            stat.numero;

        statTitle.textContent =
            stat.titulo;

        statDescription.textContent =
            stat.descricao;


        /* Posiciona o card do outro lado */

        statCard.style.transition = "none";

        statCard.style.transform =
            `translateX(${
                direcao === "next"
                    ? "40px"
                    : "-40px"
            })`;


        statCard.offsetWidth;


        /* Entrada */

        statCard.style.transition =
            "opacity 0.45s ease, transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)";

        statCard.style.opacity = "1";

        statCard.style.transform =
            "translateX(0)";


        /* Atualiza os indicadores */

        dots.forEach((dot, index) => {

            dot.classList.toggle(
                "active",
                index === statAtual
            );

        });

    }, 250);
}


/* =========================================
   PRÓXIMA ESTATÍSTICA
========================================= */

nextButton.addEventListener("click", () => {

    statAtual++;


    if (statAtual >= estatisticas.length) {
        statAtual = 0;
    }


    mostrarEstatistica("next");

});


/* =========================================
   ESTATÍSTICA ANTERIOR
========================================= */

prevButton.addEventListener("click", () => {

    statAtual--;


    if (statAtual < 0) {
        statAtual =
            estatisticas.length - 1;
    }


    mostrarEstatistica("prev");

});


/* =========================================
   INICIALIZAÇÃO
========================================= */

mostrarEstatistica();