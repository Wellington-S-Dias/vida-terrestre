let animals = [];

async function loadAnimals() {
    try {
        const response =
            await fetch('http://localhost:3000/animais');

        if (!response.ok) {
            throw new Error(
                `HTTP error! status: ${response.status}`
            );
        }

        animals = await response.json();

        document.dispatchEvent(
            new CustomEvent('animalsLoaded', {
                detail: {
                    animals
                }
            })
        );
    } catch (error) {
        console.error(
            'Erro ao carregar animais:',
            error
        );

        document.dispatchEvent(
            new CustomEvent('animalsLoadError', {
                detail: {
                    error
                }
            })
        );
    }
}

document.addEventListener(
    'DOMContentLoaded',
    loadAnimals
);