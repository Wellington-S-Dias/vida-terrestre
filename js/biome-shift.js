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

            // A troca de tema não depende do carregamento do vídeo: URLs locais
            // indisponíveis não podem bloquear os próximos cliques.
            estaTransicionando = Boolean(novaFonteVideo && videoAtivo && proximoVideo);

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

            document.body.setAttribute('data-biome', bioma === 'todos' ? 'default' : (bioma || 'default'));

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

            if (!novaFonteVideo || !videoAtivo || !proximoVideo) return;

            proximoVideo.src = novaFonteVideo;

            // Garante que o vídeo começa escondido
            proximoVideo.classList.remove('active');

            proximoVideo.load();

            const trocarVideo = () => {
                window.clearTimeout(tempoLimiteVideo);

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

                        window.clearTimeout(tempoLimiteVideo);
                        estaTransicionando = false;
                    });
            };

            const falhaVideo = () => {
                window.clearTimeout(tempoLimiteVideo);
                proximoVideo.removeEventListener('loadeddata', trocarVideo);
                proximoVideo.removeEventListener('error', falhaVideo);
                estaTransicionando = false;
            };
            proximoVideo.addEventListener('loadeddata', trocarVideo, { once: true });
            proximoVideo.addEventListener('error', falhaVideo, { once: true });
            // Safari e arquivos ausentes podem não emitir loadeddata/error.
            const tempoLimiteVideo = window.setTimeout(() => {
                proximoVideo.removeEventListener('loadeddata', trocarVideo);
                proximoVideo.removeEventListener('error', falhaVideo);
                estaTransicionando = false;
            }, 8000);

        });

    });

});
