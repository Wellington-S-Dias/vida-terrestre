const formLogin = document.getElementById('formLogin');

if (formLogin) {
    formLogin.addEventListener('submit', async function(event) {
        event.preventDefault();

        const userInput = document.getElementById('user');
        const passwordInput = document.getElementById('password');

        const user = userInput ? userInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!user || !password) {
            alert('Por favor, preencha o usuário e a senha.');
            return;
        }

        try {
            // Método POST envia as credenciais no corpo da requisição em vez da URL
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: user,
                    password: password
                })
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const dados = await response.text();

            // Limpa o formulário
            formLogin.reset();

            if (dados.trim() === 'ok') {
                window.location.href = 'index.html'; // Redirecionamento após login bem-sucedido
            } else {
                alert(dados);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Falha ao realizar login. Verifique a conexão com o servidor.');
        }
    });
}