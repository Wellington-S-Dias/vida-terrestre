const formCadastro=document.getElementById('cadastroForm')

formCadastro.addEventListener('submit',async function(event){
    event.preventDefault();
    const nome=document.getElementById('nome').value
    const user=document.getElementById('user').value
    const password=document.getElementById('password').value
    // const email=document.getElementById('email').valeu                    VER SE PRECISA

    await fetch(`http://localhost:3000/cadastro?nome=${nome}&user=${user}&password=${password}`)
        .then((response)=>response.text())
        .then((dados)=>{
            document.getElementById('nome').value=''
            document.getElementById('user').value=''
            document.getElementById('password').value=''
            // document.getElementById('email').value=''       SE TIVER EMAIL

            alert(dados)
        })
})