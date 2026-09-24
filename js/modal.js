const cardsContainer = document.getElementById('cards-container');
const animalModal = document.getElementById('animal-modal');
const closeBtn = document.getElementById('close-modal-btn');
const modalImg = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalScientific = document.getElementById('modal-scientific');
const modalStatus = document.getElementById('modal-status');
const modalHabitat = document.getElementById('modal-habitat');
const modalBehavior = document.getElementById('modal-behavior');
const modalDistribution = document.getElementById('modal-distribution');
const modalDiet = document.getElementById('modal-diet');
const modalThreats = document.getElementById('modal-threats');

function openModal(animal) {
    if (!animalModal) {
        return;
    }

    const nomeCientifico =
        animal.nome_cientifico ||
        animal.nomeCientifico ||
        '';

    const statusClass =
        animal.status_class ||
        animal.statusClass ||
        animal.status_categoria ||
        '';

    if (modalImg) {
        modalImg.src = animal.imagem || '';
    }

    if (modalTitle) {
        modalTitle.textContent =
            animal.nome || 'Animal';
    }

    if (modalScientific) {
        modalScientific.textContent =
            nomeCientifico;
    }

    if (modalStatus) {
        modalStatus.textContent =
            animal.status || 'Não informado';
        modalStatus.className =
            `status-badge ${statusClass}`.trim();
    }

    if (modalHabitat) {
        modalHabitat.textContent =
            animal.habitat || 'Não informado';
    }

    if (modalBehavior) {
        modalBehavior.textContent =
            animal.comportamento || 'Não informado';
    }

    if (modalDistribution) {
        modalDistribution.textContent =
            animal.regiao || 'Não informado';
    }

    if (modalDiet) {
        modalDiet.textContent =
            animal.alimentacao || 'Não informado';
    }

    if (modalThreats) {
        modalThreats.textContent =
            animal.ameacas || 'Não informado';
    }

    animalModal.classList.remove('hidden');
    animalModal.setAttribute(
        'aria-hidden',
        'false'
    );
}

function renderCards(animals) {
    if (!cardsContainer) {
        return;
    }

    cardsContainer.innerHTML = '';

    if (!animals.length) {
        cardsContainer.innerHTML = `
            <p class="no-results">
                Nenhuma espécie encontrada.
            </p>
        `;
        return;
    }

    animals.forEach(animal => {
        const card =
            document.createElement('div');

        card.classList.add('card');

        const nomeCientifico =
            animal.nome_cientifico ||
            animal.nomeCientifico ||
            '';

        const statusClass =
            animal.status_class ||
            animal.statusClass ||
            animal.status_categoria ||
            '';

        card.innerHTML = `
            <div class="card-image-section">
                <img
                    src="${animal.imagem || 'placeholder.jpg'}"
                    alt="${animal.nome || 'Animal'}"
                    class="card-image"
                >
            </div>

            <div class="card-info">
                <h3>
                    ${animal.nome || 'Nome desconhecido'}
                </h3>

                <p class="scientific-name">
                    ${nomeCientifico}
                </p>

                <span class="status-badge ${statusClass}">
                    ${animal.status || 'Não informado'}
                </span>
            </div>
        `;

        card.addEventListener('click', () => {
            openModal(animal);
        });

        cardsContainer.appendChild(card);
    });
}

if (animalModal) {
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            animalModal.classList.add('hidden');
            animalModal.setAttribute(
                'aria-hidden',
                'true'
            );
        });
    }

    window.addEventListener('click', event => {
        if (event.target === animalModal) {
            animalModal.classList.add('hidden');
            animalModal.setAttribute(
                'aria-hidden',
                'true'
            );
        }
    });
}

const tabButtons =
    document.querySelectorAll('.tab-btn');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabPanes =
            document.querySelectorAll('.tab-pane');

        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        tabPanes.forEach(pane => {
            pane.classList.remove('active');
        });

        button.classList.add('active');

        const tabId =
            `tab-${button.dataset.tab}`;

        const targetTab =
            document.getElementById(tabId);

        if (targetTab) {
            targetTab.classList.add('active');
        }
    });
});