require('dotenv').config();

const path = require('path');

const mysql = require('mysql2');
const Usuarios = require('./database/Usuarios');

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const axios = require('axios');

const app = express();


// ============================================================
// CONFIGURAÇÕES
// ============================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

// ============================================================
// MYSQL
// ============================================================

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


// ============================================================
// GET ANIMAIS
// ============================================================

app.get('/animais_completos', (req, res) => {

    db.query(
        'SELECT * FROM animais',

        (erro, resultados) => {

            if (erro) {

                console.error(
                    'Erro ao buscar animais:',
                    erro
                );

                return res.status(500).json({
                    erro: 'Erro ao buscar animais'
                });

            }

            res.json(resultados);

        }
    );

});


// ============================================================
// CADASTRO
// ============================================================

app.post('/cadastro', (req, res) => {

    const usuario = req.body;

    Usuarios.addUsuario(usuario, (message) => {

        res.status(201).json(message);

    });

});


// ============================================================
// LOGIN NORMAL
// ============================================================

app.post('/login', (req, res) => {

    const usuario = req.body;

    Usuarios.login(usuario, (message) => {

        res.json(message);

    });

});


// ============================================================
// USUÁRIO LOGADO
// ============================================================

app.get('/usuario', (req, res) => {

    if (!req.isAuthenticated()) {

        return res.status(401).json({
            logado: false
        });

    }

    res.json({
        logado: true,
        usuario: req.user
    });

});


// ============================================================
// LOGOUT
// ============================================================

app.get('/logout', (req, res) => {

    req.logout(err => {

        if (err) {

            return res.status(500).json({
                erro: 'Erro ao sair'
            });

        }

        res.redirect('/login.html');

    });

});


// ============================================================
// SESSÃO
// ============================================================

app.use(session({
    secret: 'vida-terrestre-secret',
    resave: false,
    saveUninitialized: false
}));


// ============================================================
// PASSPORT
// ============================================================

app.use(passport.initialize());
app.use(passport.session());


// ============================================================
// GOOGLE LOGIN
// ============================================================

passport.use(new GoogleStrategy({

    clientID: process.env.GOOGLE_CLIENT_ID,

    clientSecret: process.env.GOOGLE_CLIENT_SECRET,

    callbackURL: 'http://localhost:3000/auth/google/callback'

}, async (accessToken, refreshToken, profile, done) => {

    const googleId = profile.id;
    const name = profile.displayName;
    const email = profile.emails?.[0]?.value;

    console.log('Usuário recebido do Google:');
    console.log({
        googleId,
        name,
        email
    });


    // ========================================================
    // 1. PROCURAR PELO GOOGLE ID
    // ========================================================

    db.query(
        'SELECT * FROM usuario WHERE google_id = ?',
        [googleId],

        (erro, resultados) => {

            if (erro) {

                console.error(
                    'Erro ao procurar Google ID:',
                    erro
                );

                return done(erro);
            }


            // ====================================================
            // USUÁRIO JÁ EXISTE
            // ====================================================

            if (resultados.length > 0) {

                console.log(
                    'Usuário Google já existe.'
                );

                return done(null, resultados[0]);
            }


            // ====================================================
            // 2. PROCURAR PELO EMAIL
            // ====================================================

            db.query(
                'SELECT * FROM usuario WHERE email = ?',
                [email],

                (erro, resultados) => {

                    if (erro) {

                        console.error(
                            'Erro ao procurar e-mail:',
                            erro
                        );

                        return done(erro);
                    }


                    // ==============================================
                    // EMAIL JÁ EXISTE
                    // ==============================================

                    if (resultados.length > 0) {

                        const usuario = resultados[0];

                        console.log(
                            'E-mail já cadastrado. Vinculando Google...'
                        );


                        db.query(
                            'UPDATE usuario SET google_id = ? WHERE id = ?',

                            [googleId, usuario.id],

                            (erro) => {

                                if (erro) {

                                    console.error(
                                        'Erro ao vincular Google:',
                                        erro
                                    );

                                    return done(erro);
                                }


                                usuario.google_id = googleId;

                                console.log(
                                    'Google vinculado à conta existente!'
                                );

                                return done(null, usuario);

                            }
                        );

                        return;
                    }


                    // ====================================================
                    // 3. USUÁRIO NOVO
                    // ====================================================

                    const novoUsuario = {

                        name: name,

                        email: email,

                        password: null,

                        google_id: googleId

                    };


                    db.query(
                        'INSERT INTO usuario SET ?',

                        novoUsuario,

                        (erro, resultado) => {

                            if (erro) {

                                console.error(
                                    'Erro ao criar usuário Google:',
                                    erro
                                );

                                return done(erro);
                            }


                            novoUsuario.id = resultado.insertId;


                            console.log(
                                'Novo usuário Google criado!'
                            );

                            console.log(
                                novoUsuario
                            );


                            return done(
                                null,
                                novoUsuario
                            );

                        }
                    );

                }
            );

        }
    );

}));

passport.use(new GitHubStrategy({

    clientID: process.env.GITHUB_CLIENT_ID,

    clientSecret: process.env.GITHUB_CLIENT_SECRET,

    callbackURL: 'http://localhost:3000/auth/github/callback'

}, async (accessToken, refreshToken, profile, done) => {

    try {

        const githubId = profile.id;

        const name =
            profile.displayName ||
            profile.username;


        // ========================================================
        // BUSCAR E-MAILS DO GITHUB
        // ========================================================

        const response = await axios.get(
            'https://api.github.com/user/emails',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github+json'
                }
            }
        );


        const emails = response.data;


        // Procurar o e-mail principal
        const emailPrincipal = emails.find(
            email => email.primary && email.verified
        );


        if (!emailPrincipal) {

            return done(
                new Error(
                    'Não foi encontrado um e-mail verificado na conta do GitHub.'
                )
            );

        }


        const email = emailPrincipal.email;


        console.log('Usuário recebido do GitHub:');

        console.log({
            githubId,
            name,
            email
        });


        // ========================================================
        // PROCURAR PELO GITHUB ID
        // ========================================================

        db.query(
            'SELECT * FROM usuario WHERE github_id = ?',
            [githubId],

            (erro, resultados) => {

                if (erro) {

                    console.error(
                        'Erro ao procurar GitHub ID:',
                        erro
                    );

                    return done(erro);

                }


                // ==================================================
                // USUÁRIO JÁ EXISTE
                // ==================================================

                if (resultados.length > 0) {

                    console.log(
                        'Usuário GitHub já existe.'
                    );

                    return done(
                        null,
                        resultados[0]
                    );

                }


                // ==================================================
                // PROCURAR PELO EMAIL
                // ==================================================

                db.query(
                    'SELECT * FROM usuario WHERE email = ?',
                    [email],

                    (erro, resultados) => {

                        if (erro) {

                            console.error(
                                'Erro ao procurar e-mail:',
                                erro
                            );

                            return done(erro);

                        }


                        // ==========================================
                        // EMAIL JÁ EXISTE
                        // ==========================================

                        if (resultados.length > 0) {

                            const usuario = resultados[0];


                            db.query(
                                'UPDATE usuario SET github_id = ? WHERE id = ?',

                                [
                                    githubId,
                                    usuario.id
                                ],

                                (erro) => {

                                    if (erro) {

                                        console.error(
                                            'Erro ao vincular GitHub:',
                                            erro
                                        );

                                        return done(erro);

                                    }


                                    usuario.github_id =
                                        githubId;


                                    console.log(
                                        'GitHub vinculado à conta existente!'
                                    );


                                    return done(
                                        null,
                                        usuario
                                    );

                                }
                            );

                            return;

                        }


                        // ==========================================
                        // CRIAR NOVO USUÁRIO
                        // ==========================================

                        const novoUsuario = {

                            name: name,

                            email: email,

                            password: null,

                            google_id: null,

                            github_id: githubId

                        };


                        db.query(
                            'INSERT INTO usuario SET ?',

                            novoUsuario,

                            (erro, resultado) => {

                                if (erro) {

                                    console.error(
                                        'Erro ao criar usuário GitHub:',
                                        erro
                                    );

                                    return done(erro);

                                }


                                novoUsuario.id =
                                    resultado.insertId;


                                console.log(
                                    'Novo usuário GitHub criado:',
                                    novoUsuario
                                );


                                return done(
                                    null,
                                    novoUsuario
                                );

                            }
                        );

                    }
                );

            }
        );

    } catch (erro) {

        console.error(
            'Erro ao consultar API do GitHub:',
            erro.response?.data || erro.message
        );

        return done(erro);

    }

}));


// ============================================================
// SERIALIZAÇÃO DA SESSÃO
// ============================================================

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});


// ============================================================
// ROTAS DO GOOGLE
// ============================================================

app.get(
    '/auth/google',

    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);


app.get(
    '/auth/google/callback',

    passport.authenticate('google', {
        failureRedirect: '/login.html'
    }),

    (req, res) => {

        console.log('Login Google realizado!');

        res.redirect('/');
    }
);

app.get(
    '/auth/github',

    passport.authenticate('github', {
        scope: ['user:email']
    })
);

app.get(
    '/auth/github/callback',

    passport.authenticate('github', {
        failureRedirect: '/login.html'
    }),

    (req, res) => {

        console.log(
            'Login GitHub realizado!'
        );

        res.redirect('/');
    }
);
// ============================================================
// ARQUIVOS DO SITE
// ============================================================

// Se seus HTML/CSS/JS estão em uma pasta pública,
// coloque o nome dela aqui.
//
// Exemplo:
// app.use(express.static('public'));


// ============================================================
// SERVIDOR
// ============================================================

app.listen(3000, () => {

    console.log(
        'Servidor rodando em http://localhost:3000'
    );

});