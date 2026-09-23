const containerCartoes =
    document.getElementById('cards-container');

const modalAnimal =
    document.getElementById('animal-modal');

const botaoFechar =
    document.getElementById('close-modal-btn');

const imagemModal =
    document.getElementById('modal-image');

const tituloModal =
    document.getElementById('modal-title');

const cientificoModal =
    document.getElementById('modal-scientific');

const statusModal =
    document.getElementById('modal-status');

const habitatModal =
    document.getElementById('modal-habitat');

const comportamentoModal =
    document.getElementById('modal-behavior');

const biomaModal =
    document.getElementById('modal-biome');

const alimentacaoModal =
    document.getElementById('modal-diet');

const ameacasModal =
    document.getElementById('modal-threats');

let animais = [];
let filtroRegiao = '';
let filtroBioma = '';
let filtroTipo = '';
let filtroStatus = '';
let textoPesquisa = '';

function abrirModal(animal) {
    if (!modalAnimal) return;

    if (imagemModal) {
        imagemModal.src = animal.imagem || '';
    }

    if (tituloModal) {
        tituloModal.textContent =
            animal.nome || 'Animal';
    }

    if (cientificoModal) {
        cientificoModal.textContent =
            animal.nome_cientifico || '';
    }

    if (statusModal) {
        statusModal.textContent =
            animal.status || 'Não informado';

        statusModal.className =
            `status-badge ${(animal.status_class || '').trim()}`;
    }

    if (habitatModal) {
        habitatModal.textContent =
            animal.habitat || 'Não informado';
    }

    if (comportamentoModal) {
        comportamentoModal.textContent =
            animal.comportamento || 'Não informado';
    }

    if (biomaModal) {
        biomaModal.textContent =
            animal.bioma || 'Não informado';
    }

    if (alimentacaoModal) {
        alimentacaoModal.textContent =
            animal.alimentacao || 'Não informado';
    }

    if (ameacasModal) {
        ameacasModal.textContent =
            animal.ameacas || 'Não informado';
    }

    modalAnimal.classList.remove('hidden');
    modalAnimal.setAttribute(
        'aria-hidden',
        'false'
    );
}

function fecharModal() {
    if (!modalAnimal) return;

    modalAnimal.classList.add('hidden');

    modalAnimal.setAttribute(
        'aria-hidden',
        'true'
    );
}

function renderizarCartoes(listaAnimais) {
    if (!containerCartoes) return;

    containerCartoes.innerHTML = '';

    if (!listaAnimais.length) {
        containerCartoes.innerHTML =
            '<p class="mensagem-sem-resultados">Nenhum animal encontrado.</p>';

        return;
    }

    listaAnimais.forEach(animal => {
        const cartao =
            document.createElement('div');

        cartao.classList.add('card');

        cartao.dataset.id =
            animal.id || '';

        cartao.innerHTML = `
            <div class="card-image-section">
                <img
                    src="${animal.imagem || 'images/placeholder.jpg'}"
                    alt="Fotografia de ${animal.nome || 'animal'}"
                    class="card-image"
                >
            </div>

            <div class="card-info">
                <h3>${animal.nome || 'Nome desconhecido'}</h3>

                <p class="scientific-name">
                    ${animal.nome_cientifico || ''}
                </p>

                <span class="status-badge ${animal.status_class || ''}">
                    ${animal.status || 'Não informado'}
                </span>
            </div>
        `;

        cartao.addEventListener(
            'click',
            () => abrirModal(animal)
        );

        containerCartoes.appendChild(cartao);
    });
}

function normalizar(valor) {
    return (valor || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function normalizar(valor) {
    return (valor || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
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

    console.log('Região:', filtroRegiao);
    console.log('Tipo:', filtroTipo);
    console.log('Resultados:', animaisFiltrados);

    renderizarCartoes(animaisFiltrados);
}

async function buscarAnimais() {
    if (!containerCartoes) return;

    try {
        const resposta =
            await fetch('http://localhost:3000/animais');

        if (!resposta.ok) {
            throw new Error(
                `Erro HTTP: ${resposta.status}`
            );
        }

        animais = await resposta.json();

        aplicarFiltros();
    } catch (erro) {
        console.error(
            'Erro ao carregar animais:',
            erro
        );

        containerCartoes.innerHTML =
            '<p class="mensagem-sem-resultados">Não foi possível carregar os dados dos animais.</p>';
    }
}

function configurarPesquisa() {
    const entradaPesquisa =
        document.getElementById('search-input');

    if (!entradaPesquisa) return;

    entradaPesquisa.addEventListener(
        'input',
        () => {
            textoPesquisa =
                entradaPesquisa.value
                    .toLowerCase()
                    .trim();

            aplicarFiltros();
        }
    );
}

function configurarSelects() {
    const selects = document.querySelectorAll('.custom-select-container');

    selects.forEach((select, index) => {

        select.addEventListener('selectChange', (event) => {

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
        });

    });
}

function configurarBotoesBioma() {
    const botoes =
        document.querySelectorAll('.biome-btn');

    botoes.forEach(botao => {
        botao.addEventListener(
            'click',
            () => {
                filtroBioma =
                    botao.dataset.biome || '';

                aplicarFiltros();
            }
        );
    });
}

function configurarAbas() {
    const botoesAbas =
        document.querySelectorAll('.tab-btn');

    const paineisAbas =
        document.querySelectorAll('.tab-pane');

    botoesAbas.forEach(botao => {
        botao.addEventListener(
            'click',
            () => {
                const aba =
                    botao.dataset.tab;

                botoesAbas.forEach(item => {
                    item.classList.remove('active');
                });

                paineisAbas.forEach(painel => {
                    painel.classList.remove('active');
                });

                botao.classList.add('active');

                const painel =
                    document.getElementById(
                        `tab-${aba}`
                    );

                if (painel) {
                    painel.classList.add('active');
                }
            }
        );
    });
}

document.addEventListener(
    'DOMContentLoaded',
    () => {
        configurarPesquisa();
        configurarSelects();
        configurarBotoesBioma();
        configurarAbas();

        if (botaoFechar) {
            botaoFechar.addEventListener(
                'click',
                fecharModal
            );
        }

        if (modalAnimal) {
            modalAnimal.addEventListener(
                'click',
                evento => {
                    if (
                        evento.target === modalAnimal
                    ) {
                        fecharModal();
                    }
                }
            );
        }

        buscarAnimais();
    }
);