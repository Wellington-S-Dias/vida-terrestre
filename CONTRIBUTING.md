# Guia de Contribuição

Obrigado por contribuir com o projeto **Vida Terrestre**.

## Sobre o projeto

O Vida Terrestre é uma plataforma educativa sobre a fauna brasileira, a biodiversidade e a conservação ambiental, desenvolvida como Projeto Integrador do curso de Desenvolvimento Web da Faculdade Senac Criciúma.

## Tecnologias

- HTML5, CSS3 e JavaScript
- Node.js, Express e MySQL para os recursos de autenticação e dados
- Git e GitHub

## Estrutura do projeto

```text
vida-terrestre/
├── css/                 # Estilos das páginas
├── js/                  # JavaScript executado no navegador
├── scripts/             # Ferramentas de manutenção
├── server/              # Aplicação Express e banco de dados
│   └── database/
├── src/images/          # Imagens e ícones
├── index.html
├── explore.html
├── login.html
└── conta.html
```

Mantenha arquivos do navegador em `js/` e `css/`, código do servidor em `server/` e ferramentas de manutenção em `scripts/`. Não envie `.env`, `node_modules/` ou relatórios gerados para o repositório.
