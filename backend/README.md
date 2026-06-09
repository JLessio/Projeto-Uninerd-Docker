# Backend

API REST da Clinica Uninerd desenvolvida com Node.js, TypeScript, Express e MySQL.

## Pastas principais

```text
backend/
  src/
    config/        Configuracao do Express
    controllers/   Entrada das requisicoes HTTP
    database/      Conexao MySQL e schema local
    entities/      Entidades de dominio
    middlewares/   Validacoes de acesso
    repositories/  Acesso ao banco de dados
    routes/        Rotas da API
    services/      Regras de negocio
    utils/         Validadores compartilhados
```

## Comandos

```bash
npm install
npm run dev
npm run build
npm test
```

No Docker Compose, a API recebe as variaveis de banco pelo arquivo `.env` da raiz do projeto.
