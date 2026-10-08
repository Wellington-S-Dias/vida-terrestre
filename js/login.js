                    //  CADASTRO  //


document.getElementById("form_Cadastro").addEventListener("submit", function(event) {

    event.preventDefault();

    var nome = document.getElementById("name_C").value;
    var inmail = document.getElementById("email_C").value;
    var senha = document.getElementById("password_C").value;
    var senha2 = document.getElementById("password2_C").value;

    if (senha != senha2) {
        alert("As senhas não conferem");
        document.getElementById('password').value = '';
        document.getElementById('password2').value = '';
        return;
    }

    fetch("http://localhost:3000/cadastro", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: nome,
            email: inmail,
            password: senha
        })
    })
    .then(response => response.json())
    .then(dados => {
        if (dados.hasOwnProperty('error')) {
            alert(dados.error)
            return;
        }
        document.getElementById('name_C').value = '';
        document.getElementById('email_C').value = '';
        document.getElementById('password_C').value = '';
        document.getElementById('password2_C').value = '';
        document.getElementById('termos').checked = false;
        alert(dados.message);
        switchTab("entrar", document.getElementById("buttonEntr"));
    });
});

                    //  LOGIN  //

document.getElementById("form_Login").addEventListener("submit", function(event) {

    event.preventDefault();

    var inmail = document.getElementById('email_L').value;
    var senha = document.getElementById('password_L').value;


    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: inmail,
            password: senha
        })
    })
    .then((response) => response.json())
    .then((dados) => {
        if (dados.hasOwnProperty('error')) {
            alert(dados.error)
            return;
        }

        document.getElementById('email_L').value = '';
        document.getElementById('password_L').value = '';

        alert(dados.message)
    });
});