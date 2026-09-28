const formLogin =
    document.getElementById('login-form');

if (formLogin) {
    formLogin.addEventListener(
        'submit',
        async event => {
            event.preventDefault();

            const userInput =
                document.getElementById('username');

            const passwordInput =
                document.getElementById('password');

            const user =
                userInput
                    ? userInput.value.trim()
                    : '';

            const password =
                passwordInput
                    ? passwordInput.value
                    : '';

            if (!user || !password) {
                alert(
                    'Por favor, preencha o usuário e a senha.'
                );

                return;
            }

            try {
                const response =
                    await fetch(
                        'http://localhost:3000/login',
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body: JSON.stringify({
                                user,
                                password
                            })
                        }
                    );

                const dados =
                    await response.text();

                if (!response.ok) {
                    throw new Error(dados);
                }

                formLogin.reset();

                if (dados.trim() === 'ok') {
                    window.location.href =
                        './index.html';
                } else {
                    alert(dados);
                }
            } catch (error) {
                console.error(
                    'Erro ao realizar login:',
                    error
                );

                alert(
                    'Falha ao realizar login. Verifique a conexão com o servidor.'
                );
            }
        }
    );
}