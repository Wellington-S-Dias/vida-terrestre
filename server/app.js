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

const conquistasPadrao = [
  ["Primeiro contato", "Abra seu primeiro modal de animal.", "/src/images/icons/esp-vistas.png", "modal_first", 1],
  ["Curioso por natureza", "Consulte 10 espécies diferentes.", "/src/images/icons/esp-vistas.png", "species_unique", 10],
  ["Explorador da fauna", "Abra 30 modais de animais.", "/src/images/icons/esp-vistas.png", "modal_opens", 30],
  ["Sem preconceito de penas", "Consulte espécies de quatro grupos: mamíferos, aves, répteis e anfíbios.", "/src/images/icons/esp-vistas.png", "groups_distinct", 4],
  ["Aprendiz da natureza", "Conclua seu primeiro quiz de espécie.", "/src/images/icons/cards.png", "quiz_completions", 1],
  ["Mente selvagem", "Conclua quizzes sobre cinco espécies diferentes.", "/src/images/icons/cards.png", "quiz_species", 5],
  ["Olhos de águia", "Acerte todas as questões de um quiz.", "/src/images/icons/cards.png", "quiz_perfect", 1],
  ["Conhecedor da fauna", "Conclua 10 quizzes.", "/src/images/icons/cards.png", "quiz_completions", 10],
  ["Minha primeira descoberta", "Adicione sua primeira carta ao inventário.", "/src/images/icons/cards.png", "cards", 1],
  ["Coleção em crescimento", "Colete 10 cartas de espécies diferentes.", "/src/images/icons/cards.png", "cards", 10],
  ["Naturalista colecionador", "Colete 25 cartas de espécies diferentes.", "/src/images/icons/cards.png", "cards", 25],
  ["Álbum completo", "Colete todas as cartas atualmente liberadas no catálogo.", "/src/images/icons/cards.png", "album_complete", 1],
  ["Pé na floresta", "Consulte o conteúdo de um bioma.", "/src/images/icons/biodiversidade.png", "biome_visit", 1],
  ["Viajante dos biomas", "Consulte o conteúdo de três biomas diferentes.", "/src/images/icons/biodiversidade.png", "biome_visit", 3],
  ["Brasil de ponta a ponta", "Explore Amazônia, Cerrado, Mata Atlântica, Caatinga, Pantanal e Pampa.", "/src/images/icons/biodiversidade.png", "biome_visit", 6],
  ["Conexão natural", "Consulte pelo menos duas espécies em cada um de três biomas diferentes.", "/src/images/icons/biodiversidade.png", "biome_species_pairs", 3],
  ["Persistência selvagem", "Conclua três quizzes no mesmo dia.", "/src/images/icons/sequencia.png", "quiz_daily", 3],
  ["Aprendizado contínuo", "Conclua pelo menos um quiz por dia durante três dias consecutivos.", "/src/images/icons/sequencia.png", "quiz_streak", 3],
  ["Além da fauna", "Consulte espécies de cinco grupos de animais distintos.", "/src/images/icons/esp-vistas.png", "groups_distinct", 5],
  ["Guardião da biodiversidade", "Consulte 10 espécies, conclua cinco quizzes e explore três biomas.", "/src/images/icons/biodiversidade.png", "conservation_set", 1],
  ["Explorador completo", "Estude os seis biomas e obtenha ao menos uma carta de espécie de cada um.", "/src/images/icons/biodiversidade.png", "explorer_complete", 1],
  ["Enciclopédia viva", "Conclua quizzes de 20 espécies e consulte 30 espécies.", "/src/images/icons/esp-vistas.png", "encyclopedia", 1],
  ["Primeiro broto", "Mantenha uma sequência de atividade por cinco dias consecutivos.", "/src/images/icons/sequencia.png", "activity_streak", 5],
  ["Raízes profundas", "Mantenha uma sequência de atividade por 10 dias consecutivos.", "/src/images/icons/sequencia.png", "activity_streak", 10],
  ["Em crescimento", "Mantenha uma sequência de atividade por 20 dias consecutivos.", "/src/images/icons/sequencia.png", "activity_streak", 20],
  ["Guardião da floresta", "Mantenha uma sequência de atividade por 50 dias consecutivos.", "/src/images/icons/sequencia.png", "activity_streak", 50],
  ["Naturalista veterano", "Mantenha uma sequência de atividade por 100 dias consecutivos.", "/src/images/icons/sequencia.png", "activity_streak", 100],
  ["Lenda da biodiversidade", "Mantenha uma sequência de atividade por 200 dias consecutivos.", "/src/images/icons/sequencia.png", "activity_streak", 200],
];

function animalTemQuiz(id) {
  return Number(id) % 2 === 0 || Number(id) % 5 === 0;
}

async function prepararGamificacao() {
  const connection = db.promise();
  const statements = [
    `CREATE TABLE IF NOT EXISTS user_species_views (user_id INT NOT NULL, animal_id INT NOT NULL, viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, animal_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS user_cards (user_id INT NOT NULL, animal_id INT NOT NULL, rarity ENUM('comum','rara','epica','lendaria') NOT NULL DEFAULT 'comum', collected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, animal_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS user_activity (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, kind VARCHAR(40) NOT NULL, animal_id INT NULL, detail VARCHAR(255) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX (user_id, created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS user_biome_visits (user_id INT NOT NULL, biome VARCHAR(80) NOT NULL, seconds INT NOT NULL DEFAULT 0, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (user_id, biome)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS user_quiz_attempts (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, animal_id INT NOT NULL, score INT NOT NULL DEFAULT 0, total_questions INT NOT NULL, perfect TINYINT NOT NULL DEFAULT 0, completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, source_activity_id BIGINT NULL UNIQUE, INDEX (user_id, completed_at), INDEX (user_id, animal_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS achievements (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, description VARCHAR(255) NOT NULL, icon VARCHAR(500) NOT NULL, kind VARCHAR(40) NOT NULL, threshold INT NOT NULL DEFAULT 1, active TINYINT NOT NULL DEFAULT 1) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS user_achievements (user_id INT NOT NULL, achievement_id INT NOT NULL, unlocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, achievement_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];
  for (const statement of statements) await connection.query(statement);

  const [oldFirstCard] = await connection.query("SELECT id FROM achievements WHERE name='Primeira carta' ORDER BY id LIMIT 1");
  const [newFirstCard] = await connection.query("SELECT id FROM achievements WHERE name='Minha primeira descoberta' ORDER BY id LIMIT 1");
  if (oldFirstCard.length && newFirstCard.length) {
    await connection.query("INSERT IGNORE INTO user_achievements(user_id,achievement_id,unlocked_at) SELECT user_id,?,unlocked_at FROM user_achievements WHERE achievement_id=?", [newFirstCard[0].id, oldFirstCard[0].id]);
    await connection.query("DELETE FROM user_achievements WHERE achievement_id=?", [oldFirstCard[0].id]);
    await connection.query("DELETE FROM achievements WHERE id=?", [oldFirstCard[0].id]);
  } else if (oldFirstCard.length) {
    await connection.query("UPDATE achievements SET name='Minha primeira descoberta', description='Adicione sua primeira carta ao inventário.', icon='/src/images/icons/cards.png', kind='cards', threshold=1 WHERE id=?", [oldFirstCard[0].id]);
  }
  for (const [name, description, icon, kind, threshold] of conquistasPadrao) {
    const [rows] = await connection.query("SELECT id FROM achievements WHERE name=? ORDER BY id LIMIT 1", [name]);
    if (rows.length) {
      await connection.query("UPDATE achievements SET description=?,icon=?,kind=?,threshold=?,active=1 WHERE id=?", [description, icon, kind, threshold, rows[0].id]);
    } else {
      await connection.query("INSERT INTO achievements(name,description,icon,kind,threshold,active) VALUES(?,?,?,?,?,1)", [name, description, icon, kind, threshold]);
    }
  }

  // Recupera quizzes registrados antes de existir a tabela estruturada de tentativas.
  await connection.query(`
    INSERT IGNORE INTO user_quiz_attempts(user_id,animal_id,score,total_questions,perfect,completed_at,source_activity_id)
    SELECT user_id,animal_id,IF(detail LIKE '%sucesso%',3,0),3,IF(detail LIKE '%sucesso%',1,0),created_at,id
    FROM user_activity WHERE kind='quiz' AND animal_id IS NOT NULL
  `);

  const [usersWithProgress] = await connection.query(`
    SELECT user_id FROM user_activity
    UNION SELECT user_id FROM user_species_views
    UNION SELECT user_id FROM user_cards
    UNION SELECT user_id FROM user_biome_visits
    UNION SELECT user_id FROM user_quiz_attempts
  `);
  for (const { user_id: userId } of usersWithProgress) {
    await atualizarConquistas(Number(userId));
  }
}

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

      prepararGamificacao().then(() => {
        console.log("MySQL conectado, sessões persistentes e conquistas preparadas.");
        const cleanupTimer = setInterval(() => {
          db.query("DELETE FROM vida_terrestre_sessions WHERE expires <= ?", [Math.floor(Date.now() / 1000)]);
        }, 15 * 60 * 1000);
        cleanupTimer.unref();
        app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
      }).catch((setupError) => {
        console.error("Erro ao preparar o progresso e as conquistas:", setupError);
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
  const usuario = { ...req.body };

  Usuarios.addUsuario(usuario, (message) => {
    res.status(message.error ? 409 : 201).json(message);
  });
});

app.get("/auth/erro", (req, res) => {
  const message = req.session?.messages?.pop();
  if (!message) return res.json({ error: "Não foi possível entrar com essa conta." });
  return res.json({ error: String(message) });
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

function usuarioId(req) { return Number(req.user?.id || req.user?.usuarioId || 0); }
function exigirConta(req, res) { if (!req.isAuthenticated() || !usuarioId(req)) { res.status(401).json({ erro: "Entre na sua conta para registrar seu progresso." }); return false; } return true; }
function calcularSequencia(dias, hoje) {
  const marcados = new Set(dias.map((item) => item.day));
  const dataAtual = new Date(`${hoje}T00:00:00Z`);
  if (Number.isNaN(dataAtual.getTime())) return 0;
  const ontem = new Date(dataAtual.getTime() - 86400000).toISOString().slice(0, 10);
  let cursor = marcados.has(hoje) ? hoje : ontem;
  let total = 0;
  while (marcados.has(cursor)) {
    total += 1;
    cursor = new Date(new Date(`${cursor}T00:00:00Z`).getTime() - 86400000).toISOString().slice(0, 10);
  }
  return total;
}

async function atualizarConquistas(userId) {
  const connection = db.promise();
  try {
    const [metricRows] = await connection.query(`
      SELECT
        (SELECT COUNT(*) FROM user_species_views WHERE user_id=?) especies,
        (SELECT COUNT(*) FROM user_cards WHERE user_id=?) cartas,
        (SELECT COUNT(*) FROM user_activity WHERE user_id=? AND kind='publicacao') publicacoes,
        (SELECT COUNT(DISTINCT DATE(created_at)) FROM user_activity WHERE user_id=?) dias,
        (SELECT COUNT(*) FROM user_activity WHERE user_id=?) total_atividades,
        (SELECT COUNT(*) FROM user_activity WHERE user_id=? AND kind='visualizacao') aberturas_modal,
        (SELECT COUNT(*) FROM user_quiz_attempts WHERE user_id=?) quizzes,
        (SELECT COUNT(DISTINCT animal_id) FROM user_quiz_attempts WHERE user_id=?) especies_em_quizzes,
        (SELECT COUNT(*) FROM user_quiz_attempts WHERE user_id=? AND perfect=1) quizzes_perfeitos,
        (SELECT COUNT(DISTINCT LOWER(TRIM(a.tipo))) FROM user_species_views v JOIN animais a ON a.id=v.animal_id WHERE v.user_id=?) grupos,
        (SELECT COUNT(*) FROM user_biome_visits WHERE user_id=? AND seconds>0) biomas,
        (SELECT COUNT(*) FROM user_quiz_attempts WHERE user_id=? AND DATE(completed_at)=CURRENT_DATE()) quizzes_hoje,
        (SELECT COUNT(*) FROM animais WHERE MOD(id,2)=0 OR MOD(id,5)=0) catalogo_cartas,
        (SELECT COUNT(*) FROM user_cards c JOIN animais a ON a.id=c.animal_id WHERE c.user_id=? AND (MOD(a.id,2)=0 OR MOD(a.id,5)=0)) cartas_catalogo,
        (SELECT COUNT(DISTINCT ab.bioma_id) FROM user_cards c JOIN animal_biomas ab ON ab.animal_id=c.animal_id WHERE c.user_id=?) biomas_com_cartas
    `, Array(14).fill(userId));
    const totals = metricRows[0];
    const [[todayRow]] = await connection.query("SELECT DATE_FORMAT(CURRENT_DATE(), '%Y-%m-%d') AS hoje");
    const [activityDays] = await connection.query("SELECT DISTINCT DATE_FORMAT(created_at, '%Y-%m-%d') AS day FROM user_activity WHERE user_id=? ORDER BY day DESC", [userId]);
    const [quizDays] = await connection.query("SELECT DISTINCT DATE_FORMAT(completed_at, '%Y-%m-%d') AS day FROM user_quiz_attempts WHERE user_id=? ORDER BY day DESC", [userId]);
    const [[pairedBiomeRow]] = await connection.query(`
      SELECT COUNT(*) AS total FROM (
        SELECT ab.bioma_id FROM user_species_views v
        JOIN animal_biomas ab ON ab.animal_id=v.animal_id
        WHERE v.user_id=? GROUP BY ab.bioma_id HAVING COUNT(DISTINCT v.animal_id)>=2
      ) biomas_com_duas_especies
    `, [userId]);
    totals.sequencia_atividade = calcularSequencia(activityDays, todayRow.hoje);
    totals.sequencia_quiz = calcularSequencia(quizDays, todayRow.hoje);
    totals.biomas_com_duas_especies = Number(pairedBiomeRow.total);

    const [achievements] = await connection.query("SELECT id,kind,threshold FROM achievements WHERE active=1");
    for (const item of achievements) {
      const threshold = Number(item.threshold);
      const unlocked = {
        modal_first: Number(totals.aberturas_modal) >= threshold,
        modal_opens: Number(totals.aberturas_modal) >= threshold,
        species_unique: Number(totals.especies) >= threshold,
        groups_distinct: Number(totals.grupos) >= threshold,
        quiz_completions: Number(totals.quizzes) >= threshold,
        quiz_species: Number(totals.especies_em_quizzes) >= threshold,
        quiz_perfect: Number(totals.quizzes_perfeitos) >= threshold,
        cards: Number(totals.cartas) >= threshold,
        album_complete: Number(totals.catalogo_cartas) > 0 && Number(totals.cartas_catalogo) >= Number(totals.catalogo_cartas),
        biome_visit: Number(totals.biomas) >= threshold,
        biome_species_pairs: Number(totals.biomas_com_duas_especies) >= threshold,
        quiz_daily: Number(totals.quizzes_hoje) >= threshold,
        quiz_streak: Number(totals.sequencia_quiz) >= threshold,
        conservation_set: Number(totals.especies) >= 10 && Number(totals.quizzes) >= 5 && Number(totals.biomas) >= 3,
        explorer_complete: Number(totals.biomas) >= 6 && Number(totals.biomas_com_cartas) >= 6,
        encyclopedia: Number(totals.especies_em_quizzes) >= 20 && Number(totals.especies) >= 30,
        activity_streak: Number(totals.sequencia_atividade) >= threshold,
      }[item.kind] || false;
      if (unlocked) await connection.query("INSERT IGNORE INTO user_achievements(user_id,achievement_id) VALUES(?,?)", [userId, item.id]);
    }
    return totals;
  } catch (error) {
    console.error("Erro ao atualizar conquistas:", error);
    return null;
  }
}
app.get("/usuario/progresso", (req,res) => {
  if (!exigirConta(req,res)) return;
  const id=usuarioId(req);
  atualizarConquistas(id).then(() => {
    db.query(`SELECT (SELECT COUNT(*) FROM user_species_views WHERE user_id=?) especies, (SELECT COUNT(*) FROM user_cards WHERE user_id=?) cartas, (SELECT COUNT(*) FROM user_activity WHERE user_id=? AND kind='publicacao') publicacoes, (SELECT COUNT(DISTINCT DATE(created_at)) FROM user_activity WHERE user_id=?) dias, (SELECT COUNT(*) FROM user_activity WHERE user_id=?) total_atividades, (SELECT COUNT(*) FROM animais WHERE MOD(id,2)=0 OR MOD(id,5)=0) total_cartas_catalogo`,[id,id,id,id,id],(e,stats)=>{
      if(e)return res.status(500).json({erro:"Não foi possível carregar o progresso."});
      db.query("SELECT c.animal_id,c.rarity,a.nome,a.nome_cientifico,a.imagem,a.bioma,c.collected_at FROM user_cards c JOIN animais a ON a.id=c.animal_id WHERE c.user_id=? ORDER BY c.collected_at DESC",[id],(e,cards)=>{
        if(e)return res.status(500).json({erro:"Não foi possível carregar as cartas."});
        db.query("SELECT u.kind,u.animal_id,u.detail,u.created_at,a.nome,a.imagem FROM user_activity u LEFT JOIN animais a ON a.id=u.animal_id WHERE u.user_id=? ORDER BY u.created_at DESC, u.id DESC LIMIT 4",[id],(e,activities)=>{
          if(e)return res.status(500).json({erro:"Não foi possível carregar as atividades."});
          db.query("SELECT biome,seconds FROM user_biome_visits WHERE user_id=? ORDER BY seconds DESC LIMIT 5",[id],(e,biomes)=>{
            if(e)return res.status(500).json({erro:"Não foi possível carregar biomas."});
            db.query("SELECT a.*,ua.unlocked_at FROM user_achievements ua JOIN achievements a ON a.id=ua.achievement_id WHERE ua.user_id=? AND a.active=1 ORDER BY ua.unlocked_at DESC",[id],(e,achievements)=>{
              if(e)return res.status(500).json({erro:"Não foi possível carregar conquistas."});
              res.json({stats:stats[0],cards,activities,biomes,achievements});
            });
          });
        });
      });
    });
  });
});
app.get("/usuario/atividades", (req, res) => {
  if (!exigirConta(req, res)) return;
  db.query("SELECT u.kind,u.animal_id,u.detail,u.created_at,a.nome,a.imagem FROM user_activity u LEFT JOIN animais a ON a.id=u.animal_id WHERE u.user_id=? ORDER BY u.created_at DESC, u.id DESC", [usuarioId(req)], (error, activities) => {
    if (error) return res.status(500).json({ erro: "Não foi possível carregar as atividades." });
    res.json({ atividades: activities });
  });
});
function normalizarBioma(value) {
  const key = String(value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z]/g, "");
  return ({ amazonia: "Amazônia", cerrado: "Cerrado", mataatlantica: "Mata Atlântica", caatinga: "Caatinga", pantanal: "Pantanal", pampa: "Pampa" })[key] || null;
}
app.post("/usuario/especie-visualizada", async (req,res) => {
  if (!exigirConta(req,res)) return;
  const animalId = Number(req.body?.animalId);
  if (!Number.isInteger(animalId)) return res.status(400).json({erro:"Espécie inválida."});
  const userId = usuarioId(req);
  try {
    const connection = db.promise();
    const [animals] = await connection.query("SELECT id FROM animais WHERE id=? LIMIT 1", [animalId]);
    if (!animals.length) return res.status(404).json({erro:"Espécie não encontrada."});
    const [viewResult] = await connection.query("INSERT IGNORE INTO user_species_views(user_id,animal_id) VALUES(?,?)", [userId, animalId]);
    await connection.query("INSERT INTO user_activity(user_id,kind,animal_id,detail) VALUES(?, 'visualizacao', ?, ?)", [userId, animalId, viewResult.affectedRows ? "Espécie descoberta" : "Espécie consultada"]);
    await atualizarConquistas(userId);
    res.json({ok:true});
  } catch (error) {
    console.error("Erro ao registrar consulta de espécie:", error);
    res.status(500).json({erro:"Não foi possível registrar a consulta."});
  }
});
app.post("/usuario/bioma-tempo", async (req,res) => {
  if (!exigirConta(req,res)) return;
  const biome = normalizarBioma(req.body?.biome);
  const seconds = Math.min(300, Math.max(1, Number(req.body?.seconds) || 1));
  if (!biome) return res.status(400).json({erro:"Bioma inválido."});
  const userId = usuarioId(req);
  try {
    const connection = db.promise();
    await connection.query("INSERT INTO user_biome_visits(user_id,biome,seconds) VALUES(?,?,?) ON DUPLICATE KEY UPDATE seconds=seconds+VALUES(seconds)", [userId, biome, seconds]);
    await connection.query("INSERT INTO user_activity(user_id,kind,detail) VALUES(?, 'exploracao', ?)", [userId, `Explorou ${biome}`]);
    await atualizarConquistas(userId);
    res.json({ok:true});
  } catch (error) {
    console.error("Erro ao registrar visita ao bioma:", error);
    res.status(500).json({erro:"Não foi possível registrar a visita ao bioma."});
  }
});
app.post("/quiz/iniciar", async (req, res) => {
  if (!exigirConta(req, res)) return;
  const id = Number(req.body?.animalId);
  if (!Number.isInteger(id) || !animalTemQuiz(id)) {
    return res.status(400).json({erro:"Esta espécie não tem quiz disponível agora."});
  }

  try {
    const connection = db.promise();
    const [[animal]] = await connection.query("SELECT id,nome,nome_cientifico,tipo,status FROM animais WHERE id=? LIMIT 1", [id]);
    if (!animal) return res.status(404).json({erro:"Espécie não encontrada."});

    const [catalogo] = await connection.query(
      "SELECT nome_cientifico,tipo,status FROM animais WHERE id<>?",
      [id],
    );
    const embaralhar = (items) => {
      const shuffled = [...new Set(items.filter(Boolean))];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }
      return shuffled;
    };
    const criarQuestao = (question, answer, candidates) => {
      const wrongAnswers = embaralhar(candidates.filter((option) => option !== answer)).slice(0, 3);
      const options = embaralhar([answer, ...wrongAnswers]);
      return {question, options, answer: options.indexOf(answer)};
    };
    const questions = [
      criarQuestao(
        `A qual grupo pertence ${animal.nome}?`,
        animal.tipo,
        catalogo.map((item) => item.tipo),
      ),
      criarQuestao(
        `Qual é o nome científico de ${animal.nome}?`,
        animal.nome_cientifico,
        catalogo.map((item) => item.nome_cientifico),
      ),
      criarQuestao(
        `Qual é o status de conservação de ${animal.nome}?`,
        animal.status,
        catalogo.map((item) => item.status),
      ),
    ];

    req.session.animalQuiz = {animalId:id, questions};
    res.json({questions:questions.map(({question,options}) => ({question,options}))});
  } catch (error) {
    console.error("Erro ao iniciar quiz:", error);
    res.status(500).json({erro:"Não foi possível carregar o quiz desta espécie."});
  }
});
app.post("/quiz/concluir", async (req, res) => {
  if (!exigirConta(req, res)) return;
  const quiz = req.session.animalQuiz;
  delete req.session.animalQuiz;
  if (!quiz || !Array.isArray(req.body?.answers)) {
    return res.status(400).json({ erro: "Quiz expirado. Comece novamente." });
  }
  if (req.body.answers.length !== quiz.questions.length) {
    return res.status(400).json({ erro: "Responda todas as questões antes de concluir." });
  }

  const score = quiz.questions.reduce((total, question, index) => total + (Number(req.body.answers[index]) === question.answer ? 1 : 0), 0);
  const totalQuestions = quiz.questions.length;
  const perfect = score === totalQuestions;
  const userId = usuarioId(req);
  const connection = db.promise();
  try {
    let cardResult = { affectedRows: 0 };
    let rarity = null;
    if (perfect) {
      rarity = ["comum", "rara", "epica", "lendaria"][Math.floor(Math.random() * 4)];
      [cardResult] = await connection.query("INSERT IGNORE INTO user_cards(user_id,animal_id,rarity) VALUES(?,?,?)", [userId, quiz.animalId, rarity]);
    }

    const detail = perfect ? "Quiz concluído com sucesso" : "Quiz concluído";
    const [activityResult] = await connection.query("INSERT INTO user_activity(user_id,kind,animal_id,detail) VALUES(?, 'quiz', ?, ?)", [userId, quiz.animalId, detail]);
    await connection.query(
      "INSERT INTO user_quiz_attempts(user_id,animal_id,score,total_questions,perfect,source_activity_id) VALUES(?,?,?,?,?,?)",
      [userId, quiz.animalId, score, totalQuestions, perfect ? 1 : 0, activityResult.insertId],
    );
    await atualizarConquistas(userId);

    if (!perfect) {
      return res.json({ correct: false, score, total: totalQuestions, message: "Quase! Confira as informações da espécie e tente novamente." });
    }
    if (!cardResult.affectedRows) {
      const [rows] = await connection.query("SELECT rarity FROM user_cards WHERE user_id=? AND animal_id=?", [userId, quiz.animalId]);
      rarity = rows[0]?.rarity || rarity;
    }
    return res.json({
      correct: true,
      score,
      total: totalQuestions,
      rarity,
      alreadyOwned: !cardResult.affectedRows,
      message: cardResult.affectedRows ? `Acertou tudo! Você ganhou uma carta ${rarity}.` : "Acertou tudo! Você já tem essa carta.",
      animalId: quiz.animalId,
    });
  } catch (error) {
    console.error("Erro ao salvar quiz concluído:", error);
    return res.status(500).json({ erro: perfect ? "Não foi possível salvar sua carta e o resultado do quiz." : "Não foi possível salvar o resultado do quiz." });
  }
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
      const name = String(profile.displayName || "").trim();
      const email = String(profile.emails?.[0]?.value || "").trim().toLowerCase();
      if (!name || !email) return done(new Error("O Google não forneceu um e-mail e nome válidos."));

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
            "SELECT * FROM usuario WHERE LOWER(email) = ?",
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
                if (usuario.google_id === googleId) return done(null, usuario);
                return done(null, false, { message: "Este e-mail já está cadastrado. Entre com o método usado no cadastro." });
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

                    return done(null, false, { message: erro.code === "ER_DUP_ENTRY" ? "Este e-mail ou nome de usuário já está em uso." : "Não foi possível criar sua conta Google." });
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

        const email = String(emailPrincipal.email || "").trim().toLowerCase();

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
              "SELECT * FROM usuario WHERE LOWER(email) = ?",
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
                  if (usuario.github_id === githubId) return done(null, usuario);
                  return done(null, false, { message: "Este e-mail já está cadastrado. Entre com o método usado no cadastro." });
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

                      return done(null, false, { message: erro.code === "ER_DUP_ENTRY" ? "Este e-mail ou nome de usuário já está em uso." : "Não foi possível criar sua conta GitHub." });
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
    failureRedirect: "/login.html?authError=1",
    failureMessage: true,
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
    failureRedirect: "/login.html?authError=1",
    failureMessage: true,
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
