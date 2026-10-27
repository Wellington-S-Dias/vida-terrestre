const mysql = require("mysql2");
const bcrypt = require("bcrypt");

class Usuarios {
  static connect() {
    const connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "vida_terrestre", //fazer
    });
    connection.connect();
    return connection;
  }

  static async addUsuario(usuario, callback) {
    const connection = Usuarios.connect();
    const name = String(usuario.name || "").trim().replace(/\s+/g, " ");
    const email = String(usuario.email || "").trim().toLowerCase();
    const password = usuario.password;

    if (!name || !email || !password || name.length > 50 || email.length > 255) {
      connection.end();
      return callback({ error: "Preencha todos os campos corretamente." });
    }

    try {
      connection.query(
        "SELECT id FROM usuario WHERE LOWER(email) = ? OR LOWER(name) = ? LIMIT 1",
        [email, name.toLowerCase()],
        async (lookupError, rows) => {
          if (lookupError) {
            connection.end();
            console.error("Erro ao verificar cadastro:", lookupError);
            return callback({ error: "Não foi possível verificar os dados. Tente novamente." });
          }
          if (rows.length) {
            connection.end();
            return callback({ error: "Este e-mail ou nome de usuário já está em uso." });
          }

          try {
            const hashedPassword = await bcrypt.hash(password, 10);
            connection.query(
              "INSERT INTO usuario (name, email, password) VALUES (?, ?, ?)",
              [name, email, hashedPassword],
              (insertError) => {
                connection.end();
                if (insertError) {
                  if (insertError.code === "ER_DUP_ENTRY") {
                    return callback({ error: "Este e-mail ou nome de usuário já está em uso." });
                  }
                  console.error("Erro ao cadastrar usuário:", insertError);
                  return callback({ error: "Não foi possível concluir o cadastro. Tente novamente." });
                }
                return callback({ message: "Usuário cadastrado com sucesso!" });
              },
            );
          } catch (error) {
            connection.end();
            console.error("Erro ao proteger a senha:", error);
            return callback({ error: "Não foi possível concluir o cadastro. Tente novamente." });
          }
        },
      );
    } catch (error) {
      connection.end();
      console.error("Erro ao cadastrar usuário:", error);
      return callback({ error: "Não foi possível concluir o cadastro. Tente novamente." });
    }
  }

  static login(usuario, callback) {
    const connection = Usuarios.connect();
    const email = String(usuario?.email || "").trim().toLowerCase();
    const password = usuario?.password;

    if (!email || !password) {
      connection.end();
      return callback({ error: "Preencha todos os campos corretamente" });
    }
    connection.query("select name,email,password from usuario where LOWER(email)=? LIMIT 1", email, async (error, results) => {
      if (error) {
        connection.end();
        console.error("Erro ao buscar usuário:", error);
        return callback({ error: "Não foi possível entrar. Tente novamente." });
      }

      if (results.length == 0) {
        connection.end();
        return callback({ error: "Usuário não Cadastrado" });
      }
      var user = results[0];
      connection.end();
      try {
        const passwordValid = user.password && await bcrypt.compare(password, user.password);
        if (!passwordValid) return callback({ error: "Usuário ou senha incorreta" });
        return callback({
          message: "Logado com sucesso!",
          usuario: { name: user.name, email: user.email },
        });
      } catch (compareError) {
        console.error("Erro ao validar senha:", compareError);
        return callback({ error: "Não foi possível entrar. Tente novamente." });
      }
    });
  }

  static newPassword(senha, callback) {
    const connection = Usuarios.connect();
  }
}
module.exports = Usuarios;
