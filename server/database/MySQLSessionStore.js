const session = require("express-session");

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS sessions (
    sid varchar(128) NOT NULL,
    expires bigint unsigned NOT NULL,
    data mediumtext NOT NULL,
    PRIMARY KEY (sid),
    KEY idx_sessions_expires (expires)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

class MySQLSessionStore extends session.Store {
  constructor(pool) {
    super();
    this.pool = pool;
    this.ready = new Promise((resolve, reject) => {
      this.pool.query(CREATE_TABLE_SQL, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    this.ready.catch((error) => {
      console.error("Não foi possível preparar o armazenamento de sessões:", error.message);
    });
    this.cleanupInterval = setInterval(() => {
      this.query("DELETE FROM sessions WHERE expires <= ?", [Date.now()], (error) => {
        if (error) {
          console.error("Não foi possível limpar sessões expiradas:", error.message);
        }
      });
    }, 60 * 60 * 1000);
    this.cleanupInterval.unref?.();
  }

  query(sql, values, callback) {
    const done = typeof callback === "function" ? callback : () => {};
    this.ready
      .then(() => {
        this.pool.query(sql, values, (error, result) => done(error, result));
      })
      .catch(done);
  }

  get(sid, callback) {
    this.query(
      "SELECT data, expires FROM sessions WHERE sid = ? LIMIT 1",
      [sid],
      (error, rows) => {
        if (error) return callback(error);
        if (!rows.length) return callback(null, null);

        if (Number(rows[0].expires) <= Date.now()) {
          return this.destroy(sid, (deleteError) => callback(deleteError, null));
        }

        try {
          callback(null, JSON.parse(rows[0].data));
        } catch (parseError) {
          callback(parseError);
        }
      },
    );
  }

  set(sid, sessionData, callback) {
    const expiry = this.getExpiry(sessionData);
    this.query(
      `INSERT INTO sessions (sid, expires, data) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE expires = VALUES(expires), data = VALUES(data)`,
      [sid, expiry, JSON.stringify(sessionData)],
      callback,
    );
  }

  touch(sid, sessionData, callback) {
    this.query(
      "UPDATE sessions SET expires = ? WHERE sid = ?",
      [this.getExpiry(sessionData), sid],
      callback,
    );
  }

  destroy(sid, callback) {
    this.query("DELETE FROM sessions WHERE sid = ?", [sid], callback);
  }

  getExpiry(sessionData) {
    const cookieExpiry = sessionData?.cookie?.expires;
    const timestamp = cookieExpiry ? new Date(cookieExpiry).getTime() : NaN;
    return Number.isFinite(timestamp) ? timestamp : Date.now() + 30 * 24 * 60 * 60 * 1000;
  }
}

module.exports = MySQLSessionStore;
