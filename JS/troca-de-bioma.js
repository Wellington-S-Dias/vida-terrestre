document.addEventListener('DOMContentLoaded', () => {
    const biomeButtons = document.querySelectorAll('.biome-btn');
    const logoImg = document.querySelector('.header-logo img');

  // Seleciona os dois vídeos de fundo
    let activeVideo = document.getElementById('video-bg-1');
    let nextVideo = document.getElementById('video-bg-2');

    biomeButtons.forEach(button => {
    button.addEventListener('click', () => {
        biomeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const biome = button.getAttribute('data-biome');
        const newVideoSrc = button.getAttribute('data-video');
        const newLogoSrc = button.getAttribute('data-logo');

        document.body.setAttribute('data-biome', biome);

      // Troca da Logo com fade
        if (newLogoSrc && logoImg && logoImg.getAttribute('src') !== newLogoSrc) {
        logoImg.style.opacity = '0';
        setTimeout(() => {
            logoImg.src = newLogoSrc;
            logoImg.style.opacity = '1';
        }, 150);
        }

      // Troca de vídeo com Crossfade (Sem flash branco)
        if (newVideoSrc && activeVideo.querySelector('source')?.src !== newVideoSrc) {
        // Prepara o próximo vídeo em segundo plano
        nextVideo.src = newVideoSrc;
        nextVideo.load();

        nextVideo.play().then(() => {
          // Faz a troca de visibilidade via CSS
            nextVideo.classList.add('active');
            activeVideo.classList.remove('active');

          // Inverte as referências para a próxima troca
            const temp = activeVideo;
            activeVideo = nextVideo;
            nextVideo = temp;
        }).catch(() => {
          // Previne falhas se o navegador barrar a reprodução automática
        });
        }
    });
    });
});