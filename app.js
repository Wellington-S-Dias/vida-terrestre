const http=require('http')
const url=require('url')
//const Usuario=require('./JS/Usuario')

const callback=(req,res)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    var rota=url.parse(req.url,true)
        //  MÉTODOS

        //  POST
    if(req.method=='POST'){
        var informacao=''
        req.on('data',(dados)=>{
            informacao+=dados
        })
        if(rota.pathname=='/login'){
            req.on('end',()=>{
                res.end(informacao)
            })
            res.end('Bem-Vindo '+Usuario.nome)
        }else if(rota.pathname=='/cadastro'){
            res.end('Usúario '+Usuario.nome+' cadastrado com sucesso')
        }
    }else 

        //  GET
    if(req.method=='GET'){
        
    }
}
var server=http.createServer(callback)
server.listen(3000,()=>{console.log('servidor Rodando ...')})