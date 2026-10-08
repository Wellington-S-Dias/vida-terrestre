document.addEventListener('DOMContentLoaded', () => {

    const botoesBioma = document.querySelectorAll('.biome-btn');
    const imagemLogo = document.querySelector('.header-logo img');

    let videoAtivo = document.getElementById('video-bg-1');
    let proximoVideo = document.getElementById('video-bg-2');

    if (!botoesBioma.length) return;

    let estaTransicionando = false;

    botoesBioma.forEach(botao => {

        botao.addEventListener('click', () => {

            if (estaTransicionando) return;

            const bioma = botao.getAttribute('data-biome');
            const novaFonteVideo = botao.getAttribute('data-video');
            const novaFonteLogo = botao.getAttribute('data-logo');

            if (!novaFonteVideo) {
                console.error('Esse botão não possui data-video!');
                return;
            }

            estaTransicionando = true;

            // =========================
            // BOTÃO ATIVO
            // =========================

            botoesBioma.forEach(item => {
                item.classList.remove('active');
            });

            botao.classList.add('active');

            // =========================
            // BIOMA NO BODY
            // =========================

            if (bioma) {
                document.body.setAttribute('data-biome', bioma);
            }

            // =========================
            // TROCAR LOGO
            // =========================

            if (novaFonteLogo && imagemLogo) {

                imagemLogo.style.transition = 'opacity 0.15s ease';
                imagemLogo.style.opacity = '0';

                setTimeout(() => {
                    imagemLogo.src = novaFonteLogo;
                    imagemLogo.style.opacity = '1';
                }, 150);
            }

            // =========================
            // TROCAR VÍDEO
            // =========================

            proximoVideo.src = novaFonteVideo;

            // Garante que o vídeo começa escondido
            proximoVideo.classList.remove('active');

            proximoVideo.load();

            const trocarVideo = () => {

                proximoVideo.removeEventListener(
                    'loadeddata',
                    trocarVideo
                );

                proximoVideo
                    .play()
                    .then(() => {

                        // Mostra o novo vídeo
                        proximoVideo.classList.add('active');

                        // Esconde o antigo
                        videoAtivo.classList.remove('active');

                        // Troca as referências
                        const temporario = videoAtivo;

                        videoAtivo = proximoVideo;
                        proximoVideo = temporario;

                        estaTransicionando = false;
                    })
                    .catch(erro => {

                        console.error(
                            'Erro ao reproduzir vídeo:',
                            erro
                        );

                        estaTransicionando = false;
                    });
            };

            proximoVideo.addEventListener(
                'loadeddata',
                trocarVideo
            );

        });

    });

});
