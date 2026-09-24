let animais = [];

let filtroRegiao = '';
let filtroBioma = '';
let filtroTipo = '';
let filtroStatus = '';
let textoPesquisa = '';


function normalizar(valor) {
    return (valor || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}


async function carregarAnimais() {
    try {
        const response = await fetch('http://localhost:3000/animais');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        animais = await response.json();

        aplicarFiltros();

    } catch (erro) {
        console.error('Erro ao carregar animais:', erro);
    }
}


function aplicarFiltros() {
    const animaisFiltrados = animais.filter(animal => {

        const nome = normalizar(animal.nome);
        const nomeCientifico = normalizar(animal.nome_cientifico);
        const status = normalizar(animal.status_class);
        const regiao = normalizar(animal.regiao);
        const bioma = normalizar(animal.bioma);
        const tipo = normalizar(animal.tipo);


        const correspondePesquisa =
            !textoPesquisa ||
            nome.includes(normalizar(textoPesquisa)) ||
            nomeCientifico.includes(normalizar(textoPesquisa));


        const correspondeStatus =
            !filtroStatus ||
            status === normalizar(filtroStatus);


        const correspondeRegiao =
            !filtroRegiao ||
            regiao.includes(normalizar(filtroRegiao));


        const correspondeBioma =
            !filtroBioma ||
            bioma.includes(normalizar(filtroBioma));


        const correspondeTipo =
            !filtroTipo ||
            tipo === normalizar(filtroTipo);


        return (
            correspondePesquisa &&
            correspondeStatus &&
            correspondeRegiao &&
            correspondeBioma &&
            correspondeTipo
        );
    });


    renderCards(animaisFiltrados);
}


function configurarPesquisa() {
    const input = document.getElementById('search-input');

    if (!input) {
        return;
    }


    input.addEventListener('input', event => {

        textoPesquisa = event.target.value.trim();

        aplicarFiltros();

    });
}


function configurarSelects() {
    const selects = document.querySelectorAll(
        '.custom-select-container'
    );


    selects.forEach((select, index) => {

        select.addEventListener(
            'selectChange',
            event => {

                const valor = event.detail.value || '';


                if (index === 0) {
                    filtroRegiao = valor;
                }


                if (index === 1) {
                    filtroTipo = valor;
                }


                if (index === 2) {
                    filtroStatus = valor;
                }


                aplicarFiltros();

            }
        );

    });
}


function configurarBiomas() {
    const botoes = document.querySelectorAll('.biome-btn');


    botoes.forEach(botao => {

        botao.addEventListener('click', () => {

            filtroBioma =
                botao.getAttribute('data-biome') || '';


            aplicarFiltros();

        });

    });
}


document.addEventListener('DOMContentLoaded', () => {

    configurarPesquisa();

    configurarSelects();

    configurarBiomas();

    carregarAnimais();

});