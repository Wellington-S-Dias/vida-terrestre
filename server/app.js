require("dotenv").config();

const path = require("path");

const mysql = require("mysql2");
const Usuarios = require("./database/Usuarios");

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;

const axios = require("axios");

const app = express();

// ============================================================
// CONFIGURAÇÕES
// ============================================================

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..")));

app.get("/biomas", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "biomes.html"));
});

// ============================================================
// MYSQL
// ============================================================

const db = mysql.createConnection({
  host: "localhost",

  user: "root",

  password: "",

  database: "vida_terrestre",
});

class MySQLSessionStore extends session.Store {
  constructor(connection) {
    super();
    this.connection = connection;
  }

  get(sessionId, callback) {
    this.connection.query(
      "SELECT data FROM vida_terrestre_sessions WHERE session_id = ? AND expires > ? LIMIT 1",
      [sessionId, Math.floor(Date.now() / 1000)],
      (error, rows) => {
        if (error) return callback(error);
        if (!rows.length) return callback(null, null);
        try {
          callback(null, JSON.parse(rows[0].data));
        } catch (parseError) {
          callback(parseError);
        }
      },
    );
  }

  set(sessionId, sessionData, callback = () => {}) {
    const expiresAt = this.getExpiration(sessionData);
    this.connection.query(
      `INSERT INTO vida_terrestre_sessions (session_id, expires, data)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE expires = VALUES(expires), data = VALUES(data)`,
      [sessionId, expiresAt, JSON.stringify(sessionData)],
      callback,
    );
  }

  touch(sessionId, sessionData, callback = () => {}) {
    this.connection.query(
      "UPDATE vida_terrestre_sessions SET expires = ? WHERE session_id = ?",
      [this.getExpiration(sessionData), sessionId],
      callback,
    );
  }

  destroy(sessionId, callback = () => {}) {
    this.connection.query(
      "DELETE FROM vida_terrestre_sessions WHERE session_id = ?",
      [sessionId],
      callback,
    );
  }

  getExpiration(sessionData) {
    const expires = sessionData.cookie?.expires
      ? new Date(sessionData.cookie.expires).getTime()
      : Date.now() + (sessionData.cookie?.maxAge || 24 * 60 * 60 * 1000);
    return Math.floor(expires / 1000);
  }
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "vida-terrestre-secret",
    store: new MySQLSessionStore(db),
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

db.connect((erro) => {
  if (erro) {
    console.error("Erro ao conectar ao MySQL:", erro);

    return;
  }

  db.query(
    `CREATE TABLE IF NOT EXISTS vida_terrestre_sessions (
      session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
      expires INT UNSIGNED NOT NULL,
      data MEDIUMTEXT,
      PRIMARY KEY (session_id),
      INDEX vida_terrestre_sessions_expires_idx (expires)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`,
    (tableError) => {
      if (tableError) {
        console.error("Erro ao preparar as sessões no MySQL:", tableError);
        return;
      }

      console.log("MySQL conectado e sessões persistentes habilitadas.");
      const cleanupTimer = setInterval(() => {
        db.query("DELETE FROM vida_terrestre_sessions WHERE expires <= ?", [Math.floor(Date.now() / 1000)]);
      }, 15 * 60 * 1000);
      cleanupTimer.unref();

      app.listen(3000, () => {
        console.log("Servidor rodando em http://localhost:3000");
      });
    },
  );
});

// ============================================================
// GET ANIMAIS
// ============================================================

app.get("/animais_completos", (req, res) => {
  db.query(
    "SELECT * FROM animais",

    (erro, resultados) => {
      if (erro) {
        console.error("Erro ao buscar animais:", erro);

        return res.status(500).json({
          erro: "Erro ao buscar animais",
        });
      }

      res.json(resultados);
    },
  );
});

// ============================================================
// CADASTRO
// ============================================================

app.post("/cadastro", (req, res) => {
  const usuario = req.body;

  Usuarios.addUsuario(usuario, (message) => {
    res.status(201).json(message);
  });
});

// ============================================================
// LOGIN NORMAL
// ============================================================

app.post("/login", (req, res) => {
  const usuario = req.body;

  Usuarios.login(usuario, (message) => {
    if (message.error) return res.status(401).json(message);

    req.login(message.usuario, (error) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "Não foi possível iniciar a sessão." });
      }
      res.json(message);
    });
  });
});

// ============================================================
// USUÁRIO LOGADO
// ============================================================

app.get("/usuario", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      logado: false,
    });
  }

  if (!req.user?.email) {
    return res.json({
      logado: true,
      usuario: { name: req.user?.name || "", email: "", photo: "", bio: "" },
    });
  }

  db.query(
    "SELECT name, email, photo, banner, bio FROM usuario WHERE email = ? LIMIT 1",
    [req.user.email],
    (erro, resultados) => {
      if (erro) {
        console.error("Erro ao buscar dados do usuário:", erro);
        return res.status(500).json({ erro: "Não foi possível carregar a conta." });
      }
      const usuario = resultados[0] || req.user;
      res.json({
        logado: true,
        usuario: {
          name: usuario.name || "",
          email: usuario.email || "",
          photo: usuario.photo || "",
          banner: usuario.banner || "",
          bio: usuario.bio || "",
        },
      });
    },
  );
});

// ============================================================
// PERFIL DO USUÁRIO
// ============================================================

function validarImagemPerfil(valor) {
  if (valor === "") return true;
  if (typeof valor !== "string" || valor.length > 8_000_000) return false;
  if (/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(valor)) {
    return true;
  }
  try {
    return new URL(valor).protocol === "https:";
  } catch {
    return false;
  }
}

app.get("/usuario/perfil", (req, res) => {
  if (!req.isAuthenticated() || !req.user?.email) {
    return res.status(401).json({ erro: "Entre na sua conta para ver o perfil." });
  }

  db.query(
    "SELECT name, email, banner, photo, bio FROM usuario WHERE email = ? LIMIT 1",
    [req.user.email],
    (erro, resultados) => {
      if (erro) {
        console.error("Erro ao buscar perfil:", erro);
        return res.status(500).json({ erro: "Não foi possível carregar o perfil." });
      }
      if (!resultados.length) {
        return res.status(404).json({ erro: "A conta não foi encontrada." });
      }
      res.json({ perfil: resultados[0] });
    },
  );
});

app.put("/usuario/perfil", (req, res) => {
  if (!req.isAuthenticated() || !req.user?.email) {
    return res.status(401).json({ erro: "Entre na sua conta para salvar o perfil." });
  }

  const name = String(req.body?.name || "").trim();
  const bio = String(req.body?.bio || "").trim();
  const photo = req.body?.photo;
  const banner = req.body?.banner;
  if (!name || name.length > 50) {
    return res.status(400).json({ erro: "O nome deve ter entre 1 e 50 caracteres." });
  }
  if (bio.length > 500) {
    return res.status(400).json({ erro: "A bio pode ter no máximo 500 caracteres." });
  }
  if (!validarImagemPerfil(photo) || !validarImagemPerfil(banner)) {
    return res.status(400).json({ erro: "Envie uma imagem válida ou um endereço HTTPS." });
  }

  db.query(
    "UPDATE usuario SET name = ?, bio = ?, photo = ?, banner = ? WHERE email = ?",
    [name, bio, photo || "", banner || "", req.user.email],
    (erro) => {
      if (erro) {
        console.error("Erro ao salvar perfil:", erro);
        return res.status(500).json({ erro: "Não foi possível salvar. Confira se a migração do perfil foi aplicada." });
      }
      Object.assign(req.user, { name, bio, photo: photo || "", banner: banner || "" });
      res.json({
        mensagem: "Perfil atualizado.",
        perfil: { name, email: req.user.email, bio, photo: photo || "", banner: banner || "" },
      });
    },
  );
});

// ============================================================
// LOGOUT
// ============================================================

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        erro: "Erro ao sair",
      });
    }

    res.redirect("/login.html?logout=1");
  });
});

// ============================================================
// GOOGLE LOGIN
// ============================================================

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const googleId = profile.id;
      const name = profile.displayName;
      const email = profile.emails?.[0]?.value;

      console.log("Usuário recebido do Google:");
      console.log({
        googleId,
        name,
        email,
      });

      // ========================================================
      // 1. PROCURAR PELO GOOGLE ID
      // ========================================================

      db.query(
        "SELECT * FROM usuario WHERE google_id = ?",
        [googleId],

        (erro, resultados) => {
          if (erro) {
            console.error("Erro ao procurar Google ID:", erro);

            return done(erro);
          }

          // ====================================================
          // USUÁRIO JÁ EXISTE
          // ====================================================

          if (resultados.length > 0) {
            console.log("Usuário Google já existe.");

            return done(null, resultados[0]);
          }

          // ====================================================
          // 2. PROCURAR PELO EMAIL
          // ====================================================

          db.query(
            "SELECT * FROM usuario WHERE email = ?",
            [email],

            (erro, resultados) => {
              if (erro) {
                console.error("Erro ao procurar e-mail:", erro);

                return done(erro);
              }

              // ==============================================
              // EMAIL JÁ EXISTE
              // ==============================================

              if (resultados.length > 0) {
                const usuario = resultados[0];

                console.log("E-mail já cadastrado. Vinculando Google...");

                db.query(
                  "UPDATE usuario SET google_id = ? WHERE id = ?",

                  [googleId, usuario.id],

                  (erro) => {
                    if (erro) {
                      console.error("Erro ao vincular Google:", erro);

                      return done(erro);
                    }

                    usuario.google_id = googleId;

                    console.log("Google vinculado à conta existente!");

                    return done(null, usuario);
                  },
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
              };

              db.query(
                "INSERT INTO usuario SET ?",

                novoUsuario,

                (erro, resultado) => {
                  if (erro) {
                    console.error("Erro ao criar usuário Google:", erro);

                    return done(erro);
                  }

                  novoUsuario.id = resultado.insertId;

                  console.log("Novo usuário Google criado!");

                  console.log(novoUsuario);

                  return done(null, novoUsuario);
                },
              );
            },
          );
        },
      );
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,

      clientSecret: process.env.GITHUB_CLIENT_SECRET,

      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubId = profile.id;

        const name = profile.displayName || profile.username;

        // ========================================================
        // BUSCAR E-MAILS DO GITHUB
        // ========================================================

        const response = await axios.get("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
          },
        });
        const emails = response.data;
        // Procurar o e-mail principal
        const emailPrincipal = emails.find(
          (email) => email.primary && email.verified,
        );

        if (!emailPrincipal) {
          return done(
            new Error(
              "Não foi encontrado um e-mail verificado na conta do GitHub.",
            ),
          );
        }

        const email = emailPrincipal.email;

        console.log("Usuário recebido do GitHub:");

        console.log({
          githubId,
          name,
          email,
        });

        // ========================================================
        // PROCURAR PELO GITHUB ID
        // ========================================================

        db.query(
          "SELECT * FROM usuario WHERE github_id = ?",
          [githubId],

          (erro, resultados) => {
            if (erro) {
              console.error("Erro ao procurar GitHub ID:", erro);

              return done(erro);
            }

            // ==================================================
            // USUÁRIO JÁ EXISTE
            // ==================================================

            if (resultados.length > 0) {
              console.log("Usuário GitHub já existe.");

              return done(null, resultados[0]);
            }

            // ==================================================
            // PROCURAR PELO EMAIL
            // ==================================================

            db.query(
              "SELECT * FROM usuario WHERE email = ?",
              [email],

              (erro, resultados) => {
                if (erro) {
                  console.error("Erro ao procurar e-mail:", erro);

                  return done(erro);
                }

                // ==========================================
                // EMAIL JÁ EXISTE
                // ==========================================

                if (resultados.length > 0) {
                  const usuario = resultados[0];

                  db.query(
                    "UPDATE usuario SET github_id = ? WHERE id = ?",

                    [githubId, usuario.id],

                    (erro) => {
                      if (erro) {
                        console.error("Erro ao vincular GitHub:", erro);

                        return done(erro);
                      }

                      usuario.github_id = githubId;

                      console.log("GitHub vinculado à conta existente!");

                      return done(null, usuario);
                    },
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

                  github_id: githubId,
                };

                db.query(
                  "INSERT INTO usuario SET ?",

                  novoUsuario,

                  (erro, resultado) => {
                    if (erro) {
                      console.error("Erro ao criar usuário GitHub:", erro);

                      return done(erro);
                    }

                    novoUsuario.id = resultado.insertId;

                    console.log("Novo usuário GitHub criado:", novoUsuario);

                    return done(null, novoUsuario);
                  },
                );
              },
            );
          },
        );
      } catch (erro) {
        console.error(
          "Erro ao consultar API do GitHub:",
          erro.response?.data || erro.message,
        );

        return done(erro);
      }
    },
  ),
);

// ============================================================
// SERIALIZAÇÃO DA SESSÃO
// ============================================================

passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    email: user.email,
    name: user.name,
    photo: user.photo,
    bio: user.bio,
  });
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// ============================================================
// ROTAS DO GOOGLE
// ============================================================

app.get(
  "/auth/google",

  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

app.get(
  "/auth/google/callback",

  passport.authenticate("google", {
    failureRedirect: "/login.html",
  }),

  (req, res) => {
    console.log("Login Google realizado!");

    res.redirect("/");
  },
);

app.get(
  "/auth/github",

  passport.authenticate("github", {
    scope: ["user:email"],
  }),
);

app.get(
  "/auth/github/callback",

  passport.authenticate("github", {
    failureRedirect: "/login.html",
  }),

  (req, res) => {
    console.log("Login GitHub realizado!");

    res.redirect("/");
  },
);
// ============================================================
// ARQUIVOS DO SITE
// ============================================================

// Se seus HTML/CSS/JS estão em uma pasta pública,
// coloque o nome dela aqui.
//
// Exemplo:
// app.use(express.static('public'));
