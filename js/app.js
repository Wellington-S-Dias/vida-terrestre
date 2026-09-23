const http = require('http');
const url = require('url');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vida_terrestre'
});

db.connect(erro => {
    if (erro) {
        console.error(
            'Erro ao conectar ao MySQL:',
            erro
        );

        return;
    }

    console.log('MySQL conectado!');
});

function enviarJson(res, statusCode, dados) {
    res.writeHead(statusCode, {
        'Content-Type':
            'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
            'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers':
            'Content-Type'
    });

    res.end(JSON.stringify(dados));
}

function enviarTexto(res, statusCode, texto) {
    res.writeHead(statusCode, {
        'Content-Type':
            'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
            'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers':
            'Content-Type'
    });

    res.end(texto);
}

function receberCorpo(req) {
    return new Promise((resolve, reject) => {
        let informacao = '';

        req.on('data', dados => {
            informacao += dados;
        });

        req.on('end', () => {
            try {
                const dados =
                    informacao
                        ? JSON.parse(informacao)
                        : {};

                resolve(dados);
            } catch (erro) {
                reject(erro);
            }
        });

        req.on('error', reject);
    });
}

async function callback(req, res) {
    const rota =
        url.parse(req.url, true);

    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods':
                'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers':
                'Content-Type'
        });

        res.end();

        return;
    }

    if (
        req.method === 'GET' &&
        rota.pathname === '/animais'
    ) {
        db.query(
            'SELECT * FROM animais',
            (erro, resultados) => {
                if (erro) {
                    console.error(
                        'Erro ao buscar animais:',
                        erro
                    );

                    enviarJson(res, 500, {
                        erro:
                            'Erro ao buscar animais'
                    });

                    return;
                }

                enviarJson(
                    res,
                    200,
                    resultados
                );
            }
        );

        return;
    }

    if (
        req.method === 'POST' &&
        rota.pathname === '/cadastro'
    ) {
        try {
            const dados =
                await receberCorpo(req);

            const nome =
                String(dados.nome || '').trim();

            const usuario =
                String(dados.usuario || '').trim();

            const senha =
                String(dados.senha || '');

            if (!nome || !usuario || !senha) {
                enviarTexto(
                    res,
                    400,
                    'Preencha todos os campos.'
                );

                return;
            }

            db.query(
                `
                INSERT INTO usuarios
                (nome, usuario, senha)
                VALUES (?, ?, ?)
                `,
                [nome, usuario, senha],
                erro => {
                    if (erro) {
                        console.error(
                            'Erro ao cadastrar usuário:',
                            erro
                        );

                        enviarTexto(
                            res,
                            500,
                            'Não foi possível cadastrar o usuário.'
                        );

                        return;
                    }

                    enviarTexto(
                        res,
                        200,
                        'Usuário cadastrado com sucesso!'
                    );
                }
            );
        } catch (erro) {
            console.error(
                'Erro ao processar cadastro:',
                erro
            );

            enviarTexto(
                res,
                400,
                'Dados de cadastro inválidos.'
            );
        }

        return;
    }

    if (
        req.method === 'POST' &&
        rota.pathname === '/login'
    ) {
        try {
            const dados =
                await receberCorpo(req);

            const usuario =
                String(dados.user || '').trim();

            const senha =
                String(dados.password || '');

            if (!usuario || !senha) {
                enviarTexto(
                    res,
                    400,
                    'Usuário e senha são obrigatórios.'
                );

                return;
            }

            db.query(
                `
                SELECT id
                FROM usuarios
                WHERE usuario = ?
                AND senha = ?
                LIMIT 1
                `,
                [usuario, senha],
                (erro, resultados) => {
                    if (erro) {
                        console.error(
                            'Erro ao realizar login:',
                            erro
                        );

                        enviarTexto(
                            res,
                            500,
                            'Erro ao realizar login.'
                        );

                        return;
                    }

                    if (!resultados.length) {
                        enviarTexto(
                            res,
                            401,
                            'Usuário ou senha incorretos.'
                        );

                        return;
                    }

                    enviarTexto(
                        res,
                        200,
                        'ok'
                    );
                }
            );
        } catch (erro) {
            console.error(
                'Erro ao processar login:',
                erro
            );

            enviarTexto(
                res,
                400,
                'Dados de login inválidos.'
            );
        }

        return;
    }

    enviarTexto(
        res,
        404,
        'Rota não encontrada.'
    );
}

const server =
    http.createServer(callback);

server.listen(
    3000,
    () => {
        console.log(
            'Servidor rodando em http://localhost:3000'
        );
    }
);