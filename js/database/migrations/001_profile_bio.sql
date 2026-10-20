-- Run once on databases created before profile customization.
-- Renames the old quote field without losing existing text and enlarges the
-- image columns so resized profile uploads can be stored as data URLs.
ALTER TABLE `usuario`
  CHANGE COLUMN `quote` `bio` varchar(500) DEFAULT NULL,
  MODIFY COLUMN `banner` mediumtext DEFAULT NULL,
  MODIFY COLUMN `photo` mediumtext DEFAULT NULL;
