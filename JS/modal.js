// Isso é exatamente o que virá do seu Banco de Dados no futuro!
const animaisDoBanco = [
  {
    id: 1,
    nome: "Onça-Pintada",
    nomeCientifico: "Phantera Onca",
    status: "Vulnerável",
    statusClass: "vulneravel", // Classe CSS usada para a cor
    imagem: "https://imgs.search.brave.com/...",
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
    imagem: "caminho/para/capivara.jpg",
    habitat: "Áreas próximas a rios e lagos.",
    comportamento: "Sociável, vive em bandos.",
    distribuicao: "Por toda a América do Sul.",
    curiosidade: "É o maior roedor do mundo.",
    alimentacao: "Herbívora (capim e vegetação aquática).",
    ameacas: "Perda de habitat e caça."
  }
];

// 1. SELECIONAR OS ELEMENTOS NA TELA
const containerCards = document.getElementById('cards-container');
const modal = document.getElementById('animalModal');
const closeBtn = document.getElementById('close-btn');

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
  modalTitle.textContent = animal.nome;
  modalScientific.textContent = animal.nomeCientifico;
  modalStatus.textContent = animal.status;
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