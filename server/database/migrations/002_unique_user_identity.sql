-- Execute esta migração uma vez no banco vida_terrestre.
-- A checagem evita criar índices sobre dados que já estejam duplicados.
DELIMITER $$
CREATE PROCEDURE adicionar_indices_unicos_usuario()
BEGIN
  IF EXISTS (
    SELECT 1 FROM usuario GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Há e-mails duplicados em usuario. Corrija-os antes de aplicar a migração.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM usuario GROUP BY LOWER(TRIM(name)) HAVING COUNT(*) > 1
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Há nomes de usuário duplicados em usuario. Corrija-os antes de aplicar a migração.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'usuario' AND index_name = 'uk_usuario_email'
  ) THEN
    ALTER TABLE usuario ADD UNIQUE KEY uk_usuario_email (email);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'usuario' AND index_name = 'uk_usuario_name'
  ) THEN
    ALTER TABLE usuario ADD UNIQUE KEY uk_usuario_name (name);
  END IF;
END$$
DELIMITER ;

CALL adicionar_indices_unicos_usuario();
DROP PROCEDURE adicionar_indices_unicos_usuario;
