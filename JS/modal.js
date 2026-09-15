// Isso é exatamente o que virá do seu Banco de Dados no futuro!
const animaisDoBanco = [
  {
    id: 1,
    nome: "Onça-Pintada",
    nomeCientifico: "Phantera Onca",
    status: "Vulnerável",
    statusClass: "vulneravel", // Classe CSS usada para a cor
    imagem: "https://imgs.search.brave.com/fG96lF3FkaFDPYTezpjAW-GGXjif6DKM-AzC2PRLxAI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wZXRj/b25lY3RhZG8uY29t/LmJyL3dwLWNvbnRl/bnQvdXBsb2Fkcy8y/MDE5LzEwL29uY2Et/cGludGFkYS1hbWF6/b25pYS5qcGc",
    habitat: "Florestas tropicais, Cerrado e Pantanal",
    comportamento: "Solitária e territorial",
    distribuicao: "Amazônia, Pantanal, Cerrado e Mata Atlântica",
    curiosidade: "É o maior felino das Américas",
    alimentacao: "Carnívora",
    ameacas: "Desmatamento e caça ilegal"
  },
  {
    id: 2,
    nome: "Capivara",
    nomeCientifico: "Hydrochoerus hydrochaeris",
    status: "Pouco Preocupante",
    statusClass: "pouco-preocupante",
    imagem: "https://imgs.search.brave.com/gSvSuRRpFu1fau-kq9JRfXqPsaIA4ccJLLnbXBcAnDs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvY2Fw/eWJhcmEtcGljdHVy/ZXMtNDRkOTJ4cjlt/NGp0cnNwaC5qcGc",
    habitat: "Áreas próximas a rios e lagos.",
    comportamento: "Sociável, vive em bandos.",
    distribuicao: "Por toda a América do Sul.",
    curiosidade: "É o maior roedor do mundo.",
    alimentacao: "Herbívora (capim e vegetação aquática).",
    ameacas: "Perda de habitat e caça."
  },
  {
  id: 3,
  nome: "Mico-Leão-Dourado",
  nomeCientifico: "Leontopithecus rosalia",
  status: "Em Perigo",
  statusClass: "em-perigo",
  imagem: "https://imgs.search.brave.com/fLUkI6yVEcI99vTq5LN7HC8b8I2G4I5em6ZUU9XNAiw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/aW5mb2VzY29sYS5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MTgvMDMvbWljby1s/ZSVDMyVBM28tZG91/cmFkb18xNTk4Mzg0/OTAtMTAwMHg3NTAu/anBn",
  habitat: "Mata Atlântica (florestas tropicais de baixada).",
  comportamento: "Diurno, sociável, vive em pequenos grupos familiares.",
  distribuicao: "Exclusivo da Bacia do Rio São João, no Rio de Janeiro.",
  curiosidade: "Os machos ajudam ativamente a criar os filhotes e os carregam nas costas.",
  alimentacao: "Onívora (frutas, néctar, gomas de árvores, insetos e pequenos répteis).",
  ameacas: "Desmatamento, fragmentação da Mata Atlântica e tráfico de animais."
  }
];

// 1. SELECIONAR OS ELEMENTOS NA TELA
const containerCards = document.getElementById('cards-container');
const modal = document.getElementById('animalModal');
const closeBtn = document.getElementById('close-btn');


// 2. AQUI ESTÁ O SEGREDO: Reseta a classe base e aplica a classe de cor dinâmica
  

  
// Elementos do modal para preencher
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalScientific = document.getElementById('modal-scientific');
const modalStatus = document.getElementById('modal-status');
const modalHabitat = document.getElementById('modal-habitat');
const modalBehavior = document.getElementById('modal-behavior');
const modalDistribution = document.getElementById('modal-distribution');
const modalCuriosity = document.getElementById('modal-curiosity');
const modalDiet = document.getElementById('modal-diet');
const modalThreats = document.getElementById('modal-threats');


// 2. FUNÇÃO QUE PREENCHE E ABRE O MODAL
// Agora ela recebe o OBJETO do animal diretamente!
function openModal(animal) {
  modalImg.src = animal.imagem;
  modalTitle.textContent = animal.nome; modalStatus.className = `status-badge ${animal.statusClass}`;
  modalScientific.textContent = animal.nomeCientifico;
  modalStatus.textContent = animal.status;
  modalStatus.className = `status-badge ${animal.statusClass}`;
  modalHabitat.textContent = animal.habitat;
  modalBehavior.textContent = animal.comportamento;
  modalDistribution.textContent = animal.distribuicao;
  modalCuriosity.textContent = animal.curiosidade;
  modalDiet.textContent = animal.alimentacao;
  modalThreats.textContent = animal.ameacas;

  modal.classList.remove('hidden'); // Exibe o modal
}


function carregarCards(listaDeAnimais) {
  // 1. Limpa o container
  containerCards.innerHTML = "";

  listaDeAnimais.forEach(animal => {
    // 2. Cria a div com a SUA classe principal '.card'
    const card = document.createElement('div');
    card.classList.add('card');

    // 3. Injeta a SUA estrutura idêntica de HTML com os dados dinâmicos
    card.innerHTML = `
      <div class="card-image-section">
        <img src="${animal.imagem}" alt="${animal.nome}" class="card-image">
      </div>

      <div class="card-info">
        <h3>${animal.nome}</h3>
        <p class="scientific-name">${animal.nomeCientifico}</p>
        <span class="status-badge ${animal.statusClass}">${animal.status}</span>
      </div>
    `;

    // 4. Conecta o clique para abrir o modal com as informações deste animal
    card.addEventListener('click', () => {
      openModal(animal);
    });

    // 5. Adiciona o card estilizado na tela
    containerCards.appendChild(card);
  });
}


// 4. EXECUTAR A CRIAÇÃO DOS CARDS
// Chamamos a função passando a nossa lista
carregarCards(animaisDoBanco);


// 5. EVENTO DE FECHAR O MODAL
closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});