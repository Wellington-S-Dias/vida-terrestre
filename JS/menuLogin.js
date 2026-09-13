const formLogin=document.getElementById('formLogin')

formLogin.addEventListener('submit',async function(event){
    event.preventDefault();
    const user=document.getElementById('user').value
    const password=document.getElementById('password').value

    await fetch(`http://localhost:3000/login?user=${user}&password=${password}`)
        .then((response)=>response.text())
        .then((dados)=>{
            document.getElementById('user').value=''
            document.getElementById('password').value=''
            if(dados=='ok'){
                window.location.href='index.html' /// TEM QUE VER PARA ONDE VAI
            }else{
                alert(dados)
            }
        })
})