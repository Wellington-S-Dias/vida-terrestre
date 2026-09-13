const http=require('http')
const url=require('url')

var nome
var cadUser
var cadPassword  
//var email           

var callback=function(req,res){
    res.setHeader('Access-Control-Allow-Origin','*')
    var rota=url.parse(req.url,true)
    var dados=url.parse(req.url,true).query

    if(rota.pathname=='/login'){
        if(cadUser==dados.user && cadPassword==dados.password){  // 'DADOS' depois pode trocar caso precise
            res.writeHead(200,{'Content-Type':'Text/plain; charset=utf-8'})

            res.end('ok')
        }else{
            res.writeHead(200,{'Content-Type':'Text/plain; charset=utf-8'})

            res.end('User ou Password incorretos')
        }
    }else if(rota.pathname=='/cadastro'){
        res.writeHead(200,{'Content-Type':'Text/plain; charset=utf-8'})

        nome=dados.nome 
        cadUser=dados.user
        cadPassword=dados.password
        //email=dados.email    caso precise
        res.end(nome+' cadastrado com sucesso!')

    }else if(rota.pathname=='/newPassword'){
        res.writeHead(200,{'Content-Type':'Text/plain; charset=utf-8'})

        // faço depois 

    }else{
        res.writeHead(404,{'Content-Type':'Text/plain; charset=utf-8'})
        res.end('Rota invalida')
    }
}
const server=http.createServer(callback)
server.listen(3000,()=>console.log('Servidor rodando...'))