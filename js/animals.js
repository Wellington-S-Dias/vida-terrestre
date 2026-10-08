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
    const response = await fetch('http://localhost:3000/animais_completos');

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
    const biomas = animal.bioma || "";
    const tipo = normalizar(animal.tipo);

    const correspondePesquisa =
        !textoPesquisa ||
        nome.includes(normalizar(textoPesquisa)) ||
        nomeCientifico.includes(normalizar(textoPesquisa));

    const correspondeStatus =
        !filtroStatus ||
        filtroStatus === "todos" ||
        status === normalizar(filtroStatus);

    const correspondeRegiao =
        !filtroRegiao ||
        filtroRegiao === "todas" ||
        regiao.includes(normalizar(filtroRegiao));

    const correspondeBioma =
    !filtroBioma ||
    filtroBioma === "todos" ||
    biomas
        .split(",")
        .map(b => normalizar(b.trim()))
        .includes(normalizar(filtroBioma.trim()));

    const correspondeTipo =
        !filtroTipo ||
        filtroTipo === "todos" ||
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
    if (!input) return;

    input.addEventListener('input', event => {
    textoPesquisa = event.target.value.trim();
    aplicarFiltros();
    });
}

function configurarBiomas() {
    const botoes = document.querySelectorAll('.biome-btn');

    botoes.forEach(botao => {
    botao.addEventListener('click', () => {
        filtroBioma = botao.getAttribute('data-biome') || '';
        aplicarFiltros();
    });
    });
}

// GERENCIAMENTO EXCLUSIVO DO PAINEL LATERAL (DRAWER)
function configurarDrawerFiltros() {
    const btnFiltros = document.getElementById('btn-filtros');
    const btnFechar = document.getElementById('btn-fechar');
    const btnAplicar = document.getElementById('btn-aplicar');
    const btnLimpar = document.getElementById('btn-limpar');
    const drawer = document.getElementById('filter-drawer');
    const overlay = document.getElementById('filter-overlay');
    const contadorBadges = document.getElementById('contador-filtros');

    if (!btnFiltros || !drawer) return;

  // Controle de abertura/fechamento
    const abrir = () => { drawer.classList.add('open'); overlay.classList.add('active'); };
    const fechar = () => { drawer.classList.remove('open'); overlay.classList.remove('active'); };

    btnFiltros.addEventListener('click', abrir);
    if (btnFechar) btnFechar.addEventListener('click', fechar);
    if (overlay) overlay.addEventListener('click', fechar);

  // Aplicar filtros selecionados no Painel
    if (btnAplicar) {
    btnAplicar.addEventListener('click', () => {
        const selectRegiao = document.getElementById('filtro-regiao');
        const selectTipo = document.getElementById('filtro-classe');
        const radioStatus = document.querySelector('input[name="status"]:checked');

      filtroRegiao = selectRegiao ? selectRegiao.value : '';
        filtroTipo = selectTipo ? selectTipo.value : '';
        filtroStatus = radioStatus ? radioStatus.value : '';

      // Atualiza o contador visual do botão
        let ativos = 0;
        if (filtroRegiao && filtroRegiao !== 'todas') ativos++;
        if (filtroTipo && filtroTipo !== 'todos') ativos++;
        if (filtroStatus && filtroStatus !== 'todos') ativos++;
      
        if (contadorBadges) {
        contadorBadges.textContent = ativos > 0 ? ativos : '';
        }

        aplicarFiltros();
        fechar();
    });
    }

  // Limpar filtros do Painel
    if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
        const selectRegiao = document.getElementById('filtro-regiao');
        const selectTipo = document.getElementById('filtro-classe');
        const radioTodosStatus = document.querySelector('input[name="status"][value="todos"]');

        if (selectRegiao) selectRegiao.value = 'todas';
        if (selectTipo) selectTipo.value = 'todos';
        if (radioTodosStatus) radioTodosStatus.checked = true;

        filtroRegiao = '';
        filtroTipo = '';
        filtroStatus = '';

        if (contadorBadges) contadorBadges.textContent = '';

        aplicarFiltros();
    });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    configurarPesquisa();
    configurarBiomas();
    configurarDrawerFiltros();
    carregarAnimais();
});
