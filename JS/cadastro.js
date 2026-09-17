const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Validação simples antes de enviar
        if (!name || !username || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            // Método POST envia dados no corpo da requisição (mais seguro para senhas)
            const response = await fetch('http://localhost:3000/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: name,
                    user: username,
                    password: password
                })
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const data = await response.text();

            // Limpa o formulário
            registerForm.reset();

            alert(data || 'Usuário cadastrado com sucesso!');
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Falha ao cadastrar usuário. Verifique a conexão com o servidor.');
        }
    });
}