document.addEventListener('DOMContentLoaded', () => {
    const botoesBioma =
        document.querySelectorAll('.biome-btn');

    const imagemLogo =
        document.querySelector('.header-logo img');

    let videoAtivo =
        document.getElementById('video-bg-1');

    let proximoVideo =
        document.getElementById('video-bg-2');

    if (!botoesBioma.length) return;

    let estaTransicionando = false;

    botoesBioma.forEach(botao => {
        botao.addEventListener('click', () => {
            if (
                botao.classList.contains('active') ||
                estaTransicionando
            ) {
                return;
            }

            const bioma =
                botao.getAttribute('data-biome');

            const novaFonteVideo =
                botao.getAttribute('data-video');

            const novaFonteLogo =
                botao.getAttribute('data-logo');

            estaTransicionando = true;

            botoesBioma.forEach(item => {
                item.classList.remove('active');
            });

            botao.classList.add('active');

            if (bioma) {
                document.body.setAttribute(
                    'data-biome',
                    bioma
                );
            }

            if (
                novaFonteLogo &&
                imagemLogo &&
                imagemLogo.getAttribute('src') !== novaFonteLogo
            ) {
                imagemLogo.style.transition =
                    'opacity 0.15s ease';

                imagemLogo.style.opacity = '0';

                setTimeout(() => {
                    imagemLogo.src = novaFonteLogo;
                    imagemLogo.style.opacity = '1';
                }, 150);
            }

            if (
                novaFonteVideo &&
                videoAtivo &&
                proximoVideo
            ) {
                const fonteAtual =
                    videoAtivo.currentSrc ||
                    videoAtivo.src ||
                    videoAtivo.querySelector('source')?.src ||
                    '';

                if (fonteAtual !== novaFonteVideo) {
                    proximoVideo.src = novaFonteVideo;
                    proximoVideo.load();

                    const lidarComReproducao = () => {
                        proximoVideo.removeEventListener(
                            'canplay',
                            lidarComReproducao
                        );

                        proximoVideo
                            .play()
                            .then(() => {
                                proximoVideo.classList.add('active');
                                videoAtivo.classList.remove('active');

                                const temporario =
                                    videoAtivo;

                                videoAtivo =
                                    proximoVideo;

                                proximoVideo =
                                    temporario;

                                estaTransicionando = false;
                            })
                            .catch(erro => {
                                console.error(
                                    'Erro ao reproduzir vídeo do bioma:',
                                    erro
                                );

                                estaTransicionando = false;
                            });
                    };

                    proximoVideo.addEventListener(
                        'canplay',
                        lidarComReproducao
                    );
                } else {
                    estaTransicionando = false;
                }
            } else {
                estaTransicionando = false;
            }
        });
    });
});