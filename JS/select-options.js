document.addEventListener('DOMContentLoaded', () => {
    const customSelects = document.querySelectorAll('.custom-select-container');

    if (!customSelects.length) return;

    // Helper para fechar todos os menus abertos
    const closeAllSelects = () => {
        customSelects.forEach(container => {
            const button = container.querySelector('.select-button');
            const options = container.querySelector('.select-options');

            if (button) button.classList.remove('active');
            if (options) options.classList.remove('show');
        });
    };

    customSelects.forEach(container => {
        const selectButton = container.querySelector('.select-button');
        const selectOptions = container.querySelector('.select-options');
        const selectedValue = container.querySelector('.selected-value');
        const options = container.querySelectorAll('li');

        if (!selectButton || !selectOptions) return;

        // Abrir / Fechar menu do select
        selectButton.addEventListener('click', (event) => {
            event.stopPropagation();

            const isCurrentlyShow = selectOptions.classList.contains('show');

            // Fecha outros selects abertos antes de alternar o atual
            closeAllSelects();

            if (!isCurrentlyShow) {
                selectButton.classList.add('active');
                selectOptions.classList.add('show');
            }
        });

        // Seleção de opções
        options.forEach(option => {
            option.addEventListener('click', (event) => {
                event.stopPropagation();

                const optionText = option.textContent.trim();
                const value = option.getAttribute('data-value') || optionText;

                if (selectedValue) {
                    selectedValue.textContent = optionText;
                }

                closeAllSelects();

                // Emite evento customizado para escuta externa
                container.dispatchEvent(new CustomEvent('selectChange', {
                    bubbles: true,
                    detail: { value, text: optionText }
                }));
            });
        });
    });

    // Fechar ao clicar fora da área dos selects
    document.addEventListener('click', closeAllSelects);

    // Fechar ao pressionar a tecla ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllSelects();
        }
    });
});