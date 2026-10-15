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

app.use(session({
    secret: 'vida-terrestre-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: 'auto',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// ============================================================
// MYSQL
// ============================================================

const db = mysql.createConnection({

    host: 'localhost',

    user: 'root',

    password: '',

    database: 'vida_terrestre'

});

let profileSchemaReady = false;

function ensureProfileColumns(columns) {
    db.query('SHOW COLUMNS FROM usuario', (error, results) => {
        if (error) {
            console.error('Erro ao verificar as colunas do perfil:', error);
            return;
        }

        const existingColumns = new Set(results.map(column => column.Field));
        const addMissingColumn = index => {
            if (index >= columns.length) {
                console.log('Colunas do perfil verificadas.');
                profileSchemaReady = true;
                return;
            }

            const [name, definition] = columns[index];
            if (existingColumns.has(name)) return addMissingColumn(index + 1);

            db.query(`ALTER TABLE usuario ADD COLUMN ${name} ${definition}`, alterError => {
                if (alterError) {
                    console.error(`Erro ao criar a coluna ${name}:`, alterError);
                    return;
                }
                addMissingColumn(index + 1);
            });
        };

        addMissingColumn(0);
    });
}


db.connect(erro => {

    if (erro) {

        console.error(
            'Erro ao conectar ao MySQL:',
            erro
        );

        return;
    }

    console.log('MySQL conectado!');
    ensureProfileColumns([
        ['banner', 'TEXT NULL'],
        ['photo', 'TEXT NULL'],
        ['quote', 'VARCHAR(180) NULL']
    ]);

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
        if (message.error) return res.status(401).json(message);

        req.login(message.usuario, error => {
            if (error) {
                return res.status(500).json({ error: 'Não foi possível iniciar a sessão.' });
            }
            res.json(message);
        });
    });

});


// ============================================================
// USUÁRIO LOGADO
// ============================================================

app.get('/usuario', (req, res) => {

    res.set('Cache-Control', 'no-store');

    if (!req.isAuthenticated()) {

        return res.status(401).json({
            logado: false
        });

    }

    const { id, name, email, banner, photo, quote } = req.user;
    res.json({ logado: true, usuario: { id, name, email, banner, photo, quote } });

});

app.put('/usuario/perfil', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ erro: 'Entre na sua conta para salvar o perfil.' });
    }
    if (!profileSchemaReady) {
        return res.status(503).json({ erro: 'O banco de dados ainda está preparando o perfil. Tente novamente em instantes.' });
    }

    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const banner = typeof req.body.banner === 'string' ? req.body.banner.trim() : '';
    const photo = typeof req.body.photo === 'string' ? req.body.photo.trim() : '';
    const quote = typeof req.body.quote === 'string' ? req.body.quote.trim() : '';

    if (!name || name.length > 50) {
        return res.status(400).json({ erro: 'O nome deve ter entre 1 e 50 caracteres.' });
    }
    if (quote.length > 180 || banner.length > 2048 || photo.length > 2048) {
        return res.status(400).json({ erro: 'A frase ou uma das URLs ultrapassa o limite permitido.' });
    }

    const validImageUrl = value => {
        if (!value) return true;
        try {
            return ['http:', 'https:'].includes(new URL(value).protocol);
        } catch {
            return false;
        }
    };
    if (!validImageUrl(banner) || !validImageUrl(photo)) {
        return res.status(400).json({ erro: 'Use URLs de imagem iniciadas por http:// ou https://.' });
    }

    db.query(
        'UPDATE usuario SET name = ?, banner = ?, photo = ?, quote = ? WHERE id = ?',
        [name, banner || null, photo || null, quote || null, req.user.id],
        error => {
            if (error) {
                console.error('Erro ao salvar o perfil:', error);
                return res.status(500).json({ erro: 'Não foi possível salvar as alterações do perfil.' });
            }

            const updatedUser = { ...req.user, name, banner: banner || null, photo: photo || null, quote: quote || null };
            req.login(updatedUser, loginError => {
                if (loginError) {
                    console.error('Erro ao atualizar a sessão do perfil:', loginError);
                    return res.status(500).json({ erro: 'Perfil salvo, mas não foi possível atualizar a sessão.' });
                }
                res.json({ usuario: { id: updatedUser.id, name, email: updatedUser.email, banner: updatedUser.banner, photo: updatedUser.photo, quote: updatedUser.quote } });
            });
        }
    );
});

// LOGOUT
// ============================================================

app.get('/logout', (req, res) => {

    req.logout(err => {

        if (err) {

            return res.status(500).json({
                erro: 'Erro ao sair'
            });

        }

        res.redirect('/login.html?logout=1');

    });

});


// ============================================================
// GOOGLE LOGIN
// ============================================================

function finishOAuthUser(user, avatarUrl, done) {
    if (!avatarUrl || user.photo) return done(null, user);

    db.query("UPDATE usuario SET photo = ? WHERE id = ? AND (photo IS NULL OR photo = '')", [avatarUrl, user.id], error => {
        if (error) return done(error);
        user.photo = avatarUrl;
        done(null, user);
    });
}

passport.use(new GoogleStrategy({

    clientID: process.env.GOOGLE_CLIENT_ID,

    clientSecret: process.env.GOOGLE_CLIENT_SECRET,

    callbackURL: 'http://localhost:3000/auth/google/callback'

}, async (accessToken, refreshToken, profile, done) => {

    const googleId = profile.id;
    const name = profile.displayName;
    const email = profile.emails?.[0]?.value;
    const avatarUrl = profile.photos?.[0]?.value || null;

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

                return finishOAuthUser(resultados[0], avatarUrl, done);
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

                                return finishOAuthUser(usuario, avatarUrl, done);

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

                        google_id: googleId,

                        photo: avatarUrl

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
        const avatarUrl = profile.photos?.[0]?.value || null;


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

                    return finishOAuthUser(resultados[0], avatarUrl, done);

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


                                    return finishOAuthUser(usuario, avatarUrl, done);

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

                            photo: avatarUrl,

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
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    db.query(
        'SELECT id, name, email, banner, photo, quote FROM usuario WHERE id = ?',
        [userId],
        (error, results) => {
            if (error) return done(error);
            done(null, results[0] || false);
        }
    );
});

function completeOAuthLogin(req, res, provider) {
    if (!req.user) {
        return res.redirect('/login.html?auth_error=missing_user');
    }

    req.login(req.user, loginError => {
        if (loginError) {
            console.error(`Erro ao iniciar a sessão do ${provider}:`, loginError);
            return res.redirect('/login.html?auth_error=session');
        }

        req.session.save(sessionError => {
            if (sessionError) {
                console.error(`Erro ao salvar a sessão do ${provider}:`, sessionError);
                return res.redirect('/login.html?auth_error=session');
            }
            res.redirect(`/conta.html?login=${provider.toLowerCase()}`);
        });
    });
}


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
        completeOAuthLogin(req, res, 'Google');
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
        completeOAuthLogin(req, res, 'GitHub');
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
