const http=require('http')
const url=require('url')
const mysql = require('mysql2');

var nome
var cadUser
var cadPassword  
//var email           

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vida_terrestre'
});

db.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar ao MySQL:', erro);
        return;
    }

    console.log('MySQL conectado!');
});

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

    }else if(rota.pathname == '/animais'){

    db.query('SELECT * FROM animais', (erro, resultados) => {

        if(erro){
            console.error('Erro ao buscar animais:', erro);

            res.writeHead(500, {
                'Content-Type': 'application/json; charset=utf-8'
            });

            res.end(JSON.stringify({
                erro: 'Erro ao buscar animais'
            }));

            return;
        }

        const animaisFormatados = resultados.map(animal => ({
            id: animal.id,
            nome: animal.nome,
            nomeCientifico: animal.nome_cientifico,
            status: animal.status,
            statusClass: animal.status_class,
            imagem: animal.imagem,
            habitat: animal.habitat,
            comportamento: animal.comportamento,
            distribuicao: animal.distribuicao,
            curiosidade: animal.curiosidade,
            alimentacao: animal.alimentacao,
            ameacas: animal.ameacas
        }));

        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });

        res.end(JSON.stringify(animaisFormatados));
    });
}           else{
        res.writeHead(404,{'Content-Type':'Text/plain; charset=utf-8'})
        res.end('Rota invalida')
    }
}
const server=http.createServer(callback)
server.listen(3000,()=>console.log('Servidor rodando...'))