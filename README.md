# Projeto Uninerd

João Lessio

Sistema de agendamento medico usando as ferramentas DevOps, Cloud, Redes, Cyberseguranca e Tech Forge.

## Estrutura de pastas

```text
.
  backend/          API Node.js + TypeScript
  frontend/         Aplicacao React + Vite
  database/         Scripts SQL de criacao do banco
  infra/
    nginx/          Proxy reverso, HTTPS e headers de seguranca
    certs/          Certificados locais para uninerd.local
  cypress/          Testes end-to-end
  docs/
    docker/         Guia do ambiente Docker/local
  scripts/          Scripts auxiliares do projeto
```

## Comandos principais

```bash
npm install
cp .env.example .env
npm run docker:up
npm run test:e2e
```

## Enderecos locais

- `https://uninerd.local`: aplicacao via Nginx com HTTPS.
- `https://localhost`: alternativa local.
- `http://localhost`: redireciona para HTTPS.

## Pontos da rubrica cobertos

- `docker-compose.yml` separado por servicos, redes, volumes e variaveis de ambiente.
- Backend conectado ao MySQL pela rede interna `database-net`.
- Frontend consumindo o backend por `/api` atraves do Nginx.
- MySQL persistindo dados no volume `mysql_data`.
- Nginx como proxy reverso com HTTPS, redirecionamento HTTP para HTTPS e headers de seguranca.
- Somente o Nginx expoe portas no host.
- Husky configurado para validar mensagem de commit e executar testes e2e no pre-push.
