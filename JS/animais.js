async function loadAnimals() {
    try {
        const response = await fetch('http://localhost:3000/animais');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const animals = await response.json();
        const container = document.getElementById('cards-container');

        if (!container) return;

        container.innerHTML = '';

        animals.forEach(animal => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.id = animal.id || '';

            card.innerHTML = `
                <div class="card-image-section">
                    <img 
                        src="${animal.imagem || 'placeholder.jpg'}" 
                        alt="${animal.nome || 'Animal'}" 
                        class="card-image"
                    >
                </div>
                <div class="card-info">
                    <h3>${animal.nome || 'Nome desconhecido'}</h3>
                    <p class="scientific-name">${animal.nome_cientifico || ''}</p>
                    <span class="status-badge ${animal.status_class || ''}">
                        ${animal.status || 'Não avaliado'}
                    </span>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading animals:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadAnimals);