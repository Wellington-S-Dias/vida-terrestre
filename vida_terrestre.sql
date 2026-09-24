-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 23/09/2026 às 21:23
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `vida_terrestre`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `animais`
--

CREATE TABLE `animais` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `nome_cientifico` varchar(150) NOT NULL,
  `status` varchar(100) NOT NULL,
  `status_class` varchar(100) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `regiao` varchar(50) DEFAULT NULL,
  `bioma` varchar(50) DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `habitat` text DEFAULT NULL,
  `comportamento` text DEFAULT NULL,
  `curiosidade` text DEFAULT NULL,
  `alimentacao` text DEFAULT NULL,
  `ameacas` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `animais`
--

INSERT INTO `animais` (`id`, `nome`, `nome_cientifico`, `status`, `status_class`, `tipo`, `regiao`, `bioma`, `imagem`, `habitat`, `comportamento`, `curiosidade`, `alimentacao`, `ameacas`) VALUES
(1, 'Onça-Pintada', 'Panthera onca', 'Vulnerável', 'vulneravel', 'Mamífero', 'Norte, Centro-Oeste, Nordeste, Sudeste', 'Amazônia, Cerrado, Pantanal, Mata Atlântica', './images/onca-pintada.png', 'Florestas tropicais, áreas próximas a rios e regiões de mata densa.', 'É solitária, territorial e possui grande habilidade para nadar.', 'É o maior felino das Américas.', 'Peixes, jacarés, capivaras, veados e outros animais.', 'Desmatamento, caça ilegal e redução de suas presas naturais.'),
(2, 'Boto-Cor-de-Rosa', 'Inia geoffrensis', 'Em Perigo', 'em-perigo', 'Mamífero', 'Norte', 'Amazônia', './images/boto-cor-de-rosa.png', 'Rios, lagos e áreas alagadas da Bacia Amazônica.', 'Vive geralmente sozinho ou em pequenos grupos e utiliza ecolocalização.', 'Sua coloração pode ficar mais rosada com a idade.', 'Peixes, crustáceos e pequenos animais aquáticos.', 'Poluição dos rios, pesca acidental, barragens e degradação do habitat.'),
(3, 'Arara-Azul', 'Anodorhynchus hyacinthinus', 'Vulnerável', 'vulneravel', 'Ave', 'Norte, Centro-Oeste', 'Amazônia, Pantanal, Cerrado', './images/arara-azul.png', 'Áreas de cerrado, matas e regiões do Pantanal com árvores grandes.', 'Forma casais e costuma permanecer com o mesmo parceiro por longos períodos.', 'É uma das maiores espécies de araras do mundo.', 'Sementes e frutos de palmeiras.', 'Tráfico de animais, perda de habitat e retirada de árvores usadas para nidificação.'),
(4, 'Tuiuiú', 'Jabiru mycteria', 'Pouco preocupante', 'pouco-preocupante', 'Ave', 'Norte, Centro-Oeste, Nordeste', 'Amazônia, Pantanal, Cerrado, Caatinga', './images/tuiuiu.png', 'Áreas alagadas, margens de rios e campos próximos a áreas úmidas.', 'Costuma caminhar em águas rasas procurando alimento.', 'É considerado um dos símbolos do Pantanal.', 'Peixes, sapos, insetos, pequenos répteis e outros animais.', 'Alterações em áreas úmidas e perda de habitat.'),
(5, 'Tamanduá-Bandeira', 'Myrmecophaga tridactyla', 'Vulnerável', 'vulneravel', 'Mamífero', 'Norte, Centro-Oeste, Nordeste, Sudeste', 'Amazônia, Cerrado, Pantanal, Caatinga, Mata Atlânt', './images/tamandua-bandeira.png', 'Campos, cerrados, áreas abertas e regiões de vegetação variada.', 'É geralmente solitário e utiliza suas garras para abrir formigueiros.', 'Pode consumir milhares de formigas e cupins em um único dia.', 'Formigas e cupins.', 'Queimadas, atropelamentos, caça e perda de habitat.'),
(6, 'Lobo-Guará', 'Chrysocyon brachyurus', 'Vulnerável', 'vulneravel', 'Mamífero', 'Centro-Oeste, Sudeste, Sul', 'Cerrado, Pantanal, Mata Atlântica, Pampa', './images/lobo-guara.png', 'Campos e áreas abertas, principalmente em regiões de Cerrado.', 'É solitário e possui hábitos principalmente crepusculares e noturnos.', 'É o maior canídeo da América do Sul.', 'Frutos, pequenos mamíferos, aves, répteis e insetos.', 'Perda de habitat, atropelamentos e doenças transmitidas por animais domésticos.'),
(7, 'Ema', 'Rhea americana', 'Pouco preocupante', 'pouco-preocupante', 'Ave', 'Norte, Nordeste, Centro-Oeste, Sudeste, Sul', 'Amazônia, Caatinga, Cerrado, Pantanal, Mata Atlânt', './images/ema.png', 'Campos, cerrados e outras áreas abertas.', 'Não voa, mas consegue correr em alta velocidade.', 'É uma das maiores aves brasileiras que não voam.', 'Sementes, frutos, insetos e pequenos animais.', 'Caça, perda de habitat e atropelamentos.'),
(8, 'Mico-Leão-Dourado', 'Leontopithecus rosalia', 'Em Perigo', 'em-perigo', 'Mamífero', 'Sudeste', 'Mata Atlântica', './images/mico-leao-dourado.png', 'Florestas da Mata Atlântica.', 'Vive em grupos familiares e passa grande parte do tempo nas árvores.', 'Sua pelagem dourada é uma das características mais marcantes da espécie.', 'Frutos, insetos, pequenos vertebrados e néctar.', 'Desmatamento, fragmentação florestal e doenças.'),
(9, 'Tatu-Bola', 'Tolypeutes tricinctus', 'Vulnerável', 'vulneravel', 'Mamífero', 'Nordeste, Centro-Oeste', 'Caatinga, Cerrado', './images/tatu-bola.png', 'Caatinga e áreas de vegetação seca.', 'Quando ameaçado, pode se enrolar completamente formando uma bola.', 'É uma das poucas espécies de tatu capazes de se enrolar completamente.', 'Formigas, cupins, pequenos invertebrados e frutos.', 'Caça e perda de habitat.'),
(10, 'Carcará', 'Caracara plancus', 'Pouco preocupante', 'pouco-preocupante', 'Ave', 'Norte, Nordeste, Centro-Oeste, Sudeste, Sul', 'Amazônia, Caatinga, Cerrado, Pantanal, Mata Atlânt', './images/carcara.png', 'Campos, áreas abertas e regiões de vegetação variada.', 'É oportunista e consegue aproveitar diferentes fontes de alimento.', 'É conhecido por sua capacidade de aproveitar diferentes tipos de alimento.', 'Pequenos animais, carniça, ovos, insetos e frutos.', 'Alterações ambientais e redução de habitat.'),
(11, 'Cobra-Coral', 'Micrurus corallinus', 'Pouco preocupante', 'pouco-preocupante', 'Réptil', 'Nordeste, Sudeste, Sul', 'Caatinga, Mata Atlântica, Pampa', './images/cobra-coral.png', 'Florestas, áreas de serrapilheira e regiões úmidas.', 'É discreta e passa grande parte do tempo escondida.', 'Possui padrão de cores característico formado por anéis.', 'Pequenos répteis, anfíbios e outros animais.', 'Destruição do habitat e perseguição humana.'),
(12, 'Jararaca', 'Bothrops jararaca', 'Pouco preocupante', 'pouco-preocupante', 'Réptil', 'Sudeste, Sul', 'Mata Atlântica, Pampa', './images/jararaca.png', 'Matas, áreas rurais e regiões de vegetação densa.', 'É predominantemente noturna e utiliza camuflagem para capturar suas presas.', 'Seu veneno possui grande importância para pesquisas médicas.', 'Pequenos mamíferos, aves, anfíbios e outros animais.', 'Desmatamento e conflitos com seres humanos.'),
(13, 'Veado-Campeiro', 'Ozotoceros bezoarticus', 'Vulnerável', 'vulneravel', 'Mamífero', 'Centro-Oeste, Sudeste, Sul', 'Cerrado, Pantanal, Pampa', './images/veado-campeiro.png', 'Campos naturais e áreas abertas.', 'Vive em pequenos grupos e se alimenta principalmente durante períodos de menor calor.', 'É adaptado a ambientes abertos e possui grande capacidade de deslocamento.', 'Gramíneas, folhas e outras plantas.', 'Perda de habitat, caça e expansão agropecuária.'),
(14, 'Gato-do-Mato', 'Leopardus tigrinus', 'Vulnerável', 'vulneravel', 'Mamífero', 'Norte, Nordeste, Centro-Oeste, Sudeste, Sul', 'Amazônia, Caatinga, Cerrado, Mata Atlântica', './images/gato-do-mato.png', 'Florestas e áreas de vegetação densa.', 'É solitário e possui hábitos principalmente noturnos.', 'É um dos menores felinos silvestres encontrados no Brasil.', 'Pequenos mamíferos, aves, répteis e anfíbios.', 'Desmatamento, fragmentação do habitat e caça.'),
(15, 'Sapo-Cururu', 'Rhinella icterica', 'Pouco preocupante', 'pouco-preocupante', 'Anfíbio', 'Sudeste, Sul', 'Mata Atlântica, Pampa', './images/sapo-cururu.png', 'Áreas úmidas, florestas e ambientes próximos a corpos d’água.', 'Possui hábitos principalmente noturnos e utiliza áreas próximas à água para reprodução.', 'Possui glândulas que produzem substâncias utilizadas como defesa.', 'Insetos e outros pequenos invertebrados.', 'Poluição da água, perda de habitat e doenças que afetam anfíbios.');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `animais`
--
ALTER TABLE `animais`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `animais`
--
ALTER TABLE `animais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
