document.addEventListener('DOMContentLoaded', () => {
    const biomeButtons = document.querySelectorAll('.biome-btn');
    const logoImg = document.querySelector('.header-logo img');

    let activeVideo = document.getElementById('video-bg-1');
    let nextVideo = document.getElementById('video-bg-2');

    if (!biomeButtons.length) return;

    let isTransitioning = false;

    biomeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('active') || isTransitioning) return;

            const biome = button.getAttribute('data-biome');
            const newVideoSrc = button.getAttribute('data-video');
            const newLogoSrc = button.getAttribute('data-logo');

            isTransitioning = true;

            // Atualiza classe ativa dos botões
            biomeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Atualiza atributo no body para estilização via CSS
            if (biome) {
                document.body.setAttribute('data-biome', biome);
            }

            // Troca suave do Logo
            if (newLogoSrc && logoImg && logoImg.getAttribute('src') !== newLogoSrc) {
                logoImg.style.transition = 'opacity 0.15s ease';
                logoImg.style.opacity = '0';

                setTimeout(() => {
                    logoImg.src = newLogoSrc;
                    logoImg.style.opacity = '1';
                }, 150);
            }

            // Troca suave dos Vídeos de Fundo (Crossfade)
            if (newVideoSrc && activeVideo && nextVideo) {
                const currentSrc = activeVideo.src || activeVideo.querySelector('source')?.src;

                if (currentSrc !== newVideoSrc) {
                    nextVideo.src = newVideoSrc;
                    nextVideo.load();

                    const handleCanPlay = () => {
                        nextVideo.removeEventListener('canplay', handleCanPlay);

                        nextVideo.play().then(() => {
                            nextVideo.classList.add('active');
                            activeVideo.classList.remove('active');

                            // Inverte a referência dos vídeos
                            const temp = activeVideo;
                            activeVideo = nextVideo;
                            nextVideo = temp;

                            isTransitioning = false;
                        }).catch(error => {
                            console.error('Error playing biome video:', error);
                            isTransitioning = false;
                        });
                    };

                    nextVideo.addEventListener('canplay', handleCanPlay);
                } else {
                    isTransitioning = false;
                }
            } else {
                isTransitioning = false;
            }
        });
    });
});