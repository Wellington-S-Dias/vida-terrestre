-- Execute uma vez no banco vida_terrestre para adicionar os detalhes do modal.
DELIMITER $$
CREATE PROCEDURE adicionar_detalhes_modal_animais()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'animais' AND column_name = 'porte'
  ) THEN
    ALTER TABLE animais ADD COLUMN porte VARCHAR(100) DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'animais' AND column_name = 'caracteristicas_fisicas'
  ) THEN
    ALTER TABLE animais ADD COLUMN caracteristicas_fisicas TEXT DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'animais' AND column_name = 'adaptacao'
  ) THEN
    ALTER TABLE animais ADD COLUMN adaptacao TEXT DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'animais' AND column_name = 'dieta_tipo'
  ) THEN
    ALTER TABLE animais ADD COLUMN dieta_tipo VARCHAR(50) DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'animais' AND column_name = 'orientacao_conservacao'
  ) THEN
    ALTER TABLE animais ADD COLUMN orientacao_conservacao TEXT DEFAULT NULL;
  END IF;
END$$
DELIMITER ;

CALL adicionar_detalhes_modal_animais();
DROP PROCEDURE adicionar_detalhes_modal_animais;

-- Reaproveita as curiosidades já cadastradas como características marcantes.
UPDATE animais
SET caracteristicas_fisicas = curiosidade
WHERE caracteristicas_fisicas IS NULL AND curiosidade IS NOT NULL;

-- Dieta registrada para as espécies do catálogo inicial.
UPDATE animais SET dieta_tipo = CASE id
  WHEN 1 THEN 'Carnívoro'
  WHEN 2 THEN 'Carnívoro'
  WHEN 3 THEN 'Herbívoro'
  WHEN 4 THEN 'Carnívoro'
  WHEN 5 THEN 'Insetívoro'
  WHEN 6 THEN 'Onívoro'
  WHEN 7 THEN 'Onívoro'
  WHEN 8 THEN 'Onívoro'
  WHEN 9 THEN 'Onívoro'
  WHEN 10 THEN 'Onívoro'
  WHEN 11 THEN 'Carnívoro'
  WHEN 12 THEN 'Carnívoro'
  WHEN 13 THEN 'Herbívoro'
  WHEN 14 THEN 'Carnívoro'
  WHEN 15 THEN 'Insetívoro'
  WHEN 16 THEN 'Herbívoro'
  WHEN 17 THEN 'Herbívoro'
  WHEN 18 THEN 'Herbívoro'
  WHEN 19 THEN 'Frugívoro'
  WHEN 20 THEN 'Frugívoro'
  WHEN 21 THEN 'Herbívoro'
  WHEN 22 THEN 'Herbívoro'
  WHEN 23 THEN 'Onívoro'
  WHEN 24 THEN 'Onívoro'
  WHEN 25 THEN 'Onívoro'
  WHEN 26 THEN 'Onívoro'
  WHEN 27 THEN 'Herbívoro'
  WHEN 28 THEN 'Herbívoro'
  WHEN 29 THEN 'Herbívoro'
  WHEN 30 THEN 'Onívoro'
  WHEN 31 THEN 'Onívoro'
  WHEN 32 THEN 'Herbívoro'
  WHEN 33 THEN 'Carnívoro'
  WHEN 34 THEN 'Onívoro'
  WHEN 35 THEN 'Onívoro'
  WHEN 36 THEN 'Carnívoro'
  WHEN 37 THEN 'Carnívoro'
  WHEN 38 THEN 'Onívoro'
  WHEN 39 THEN 'Carnívoro'
  WHEN 40 THEN 'Herbívoro'
  WHEN 41 THEN 'Carnívoro'
  WHEN 42 THEN 'Carnívoro'
  WHEN 43 THEN 'Onívoro'
  WHEN 44 THEN 'Onívoro'
  WHEN 45 THEN 'Onívoro'
  ELSE dieta_tipo
END
WHERE dieta_tipo IS NULL;

-- A orientação fica armazenada junto às ameaças e aos demais dados da espécie.
UPDATE animais
SET orientacao_conservacao = 'Preservar o habitat, não comprar animais silvestres e apoiar iniciativas de conservação da fauna.'
WHERE orientacao_conservacao IS NULL;
