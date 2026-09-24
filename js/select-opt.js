document.addEventListener('DOMContentLoaded', () => {
    const customSelects =
        document.querySelectorAll('.custom-select-container');

    if (!customSelects.length) return;

    const closeAllSelects = () => {
        customSelects.forEach(container => {
            const button =
                container.querySelector('.select-button');

            const options =
                container.querySelector('.select-options');

            if (button) {
                button.classList.remove('active');
            }

            if (options) {
                options.classList.remove('show');
            }
        });
    };

    customSelects.forEach(container => {
        const selectButton =
            container.querySelector('.select-button');

        const selectOptions =
            container.querySelector('.select-options');

        const selectedValue =
            container.querySelector('.selected-value');

        const options =
            container.querySelectorAll('.select-options li');

        if (!selectButton || !selectOptions) return;

        selectButton.addEventListener('click', event => {
            event.stopPropagation();

            const isCurrentlyShow =
                selectOptions.classList.contains('show');

            closeAllSelects();

            if (!isCurrentlyShow) {
                selectButton.classList.add('active');
                selectOptions.classList.add('show');
            }
        });

        options.forEach(option => {
            option.addEventListener('click', event => {
                event.stopPropagation();

                const optionText =
                    option.textContent.trim();

                const value =
                    option.getAttribute('data-value') || '';

                if (selectedValue) {
                    selectedValue.textContent = optionText;
                }

                closeAllSelects();

                container.dispatchEvent(
                    new CustomEvent('selectChange', {
                        bubbles: true,
                        detail: {
                            value,
                            text: optionText
                        }
                    })
                );
            });
        });
    });

    document.addEventListener('click', closeAllSelects);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeAllSelects();
        }
    });
});