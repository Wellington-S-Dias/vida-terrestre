const http = require('http');
const url = require('url');
const mysql = require('mysql2');
const Usuarios=require('./database/Usuarios')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vida_terrestre'
});

db.connect(erro => {
    if (erro) {
        console.error('Erro ao conectar ao MySQL:',erro);
        return;
    }
    console.log('MySQL conectado!');
});

function enviarJson(res, statusCode, dados) {
    res.writeHead(statusCode,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin': '*','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});

    res.end(JSON.stringify(dados));
}

async function callback(req, res) {
    const rota =url.parse(req.url, true);

    if (req.method == 'OPTIONS') {
        res.writeHead(204, {'Access-Control-Allow-Origin': '*','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'
        });

        res.end();

        return;
    }else if(req.method == 'GET'){
        if(rota.pathname == '/animais'){
            db.query('SELECT * FROM animais',(erro, resultados) =>{
                    if (erro) {console.error('Erro ao buscar animais:',erro);
                        enviarJson(res, 500, {erro:'Erro ao buscar animais'});
                    return;
                }
                enviarJson(res,200,resultados);
            }
        );
        return;
        }
    }else if(req.method=='POST'){
        var body=''
        req.on('data',(data)=>{
            body+=data
        })
        if(rota.pathname=='/cadastro'){
            req.on('end',()=>{
                res.writeHead(201,{'Content-Type':'application/json'})
                var usuario=JSON.parse(body)
                Usuarios.addUsuario(usuario,(message)=>{
                    res.end(JSON.stringify(message))
                })
            })
        }else if(rota.pathname=='login'){
            req.on('end',()=>{
                res.writeHead(200,{'Content-Type':'application/json'})
                var usuario=JSON.parse(body)
                Usuarios.login(usuario,(message)=>{
                    res.end(JSON.stringify(message))
                })
            })
        }
    }
}

const server =http.createServer(callback);

server.listen(3000,() => {console.log('Servidor rodando em http://localhost:3000');});