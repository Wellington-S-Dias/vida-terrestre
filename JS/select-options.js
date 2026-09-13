document.addEventListener('DOMContentLoaded', () => {
  // Seleciona TODOS os containers de select da página
  const customSelects = document.querySelectorAll('.custom-select-container');

  customSelects.forEach(container => {
    const selectButton = container.querySelector('.select-button');
    const selectOptions = container.querySelector('.select-options');
    const selectedValue = container.querySelector('.selected-value');
    const options = container.querySelectorAll('li');

    if (!selectButton || !selectOptions) return;

    // Clique no botão do select
    selectButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Impede que o clique no document feche o menu imediatamente

      // Fecha todos os OUTROS selects antes de abrir o atual
      customSelects.forEach(otherContainer => {
        if (otherContainer !== container) {
          const otherButton = otherContainer.querySelector('.select-button');
          const otherOptions = otherContainer.querySelector('.select-options');
          
          if (otherButton) otherButton.classList.remove('active');
          if (otherOptions) otherOptions.classList.remove('show');
        }
      });

      // Alterna o estado do select clicado
      selectButton.classList.toggle('active');
      selectOptions.classList.toggle('show');
    });

    // Clique em uma opção da lista
    options.forEach(option => {
      option.addEventListener('click', () => {
        if (selectedValue) {
          selectedValue.textContent = option.textContent;
        }

        selectButton.classList.remove('active');
        selectOptions.classList.remove('show');

        // Captura o valor selecionado
        const valor = option.getAttribute('data-value') || '';
        
        // Notifica outros scripts sobre a mudança no filtro
        container.dispatchEvent(new CustomEvent('selectChange', {
          detail: { value: valor, text: option.textContent }
        }));
      });
    });
  });

  // Fecha qualquer select aberto ao clicar fora da área
  document.addEventListener('click', () => {
    customSelects.forEach(container => {
      const button = container.querySelector('.select-button');
      const options = container.querySelector('.select-options');

      if (button) button.classList.remove('active');
      if (options) options.classList.remove('show');
    });
  });

  // Suporte à tecla ESC para fechar menus abertos
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      customSelects.forEach(container => {
        const button = container.querySelector('.select-button');
        const options = container.querySelector('.select-options');

        if (button) button.classList.remove('active');
        if (options) options.classList.remove('show');
      });
    }
  });
});