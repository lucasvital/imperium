# Fincheck

Aplicação completa para controle financeiro com back-end em NestJS e front-end em React/Vite. Este guia explica como preparar o ambiente, configurar variáveis e subir todos os serviços localmente.

## Pré-requisitos

- Node.js 18+ e npm (ou yarn/pnpm, se preferir)
- Docker Engine e Docker Desktop instalados e em execução
- Git (apenas se for clonar a partir de outro repositório)

## Banco de dados PostgreSQL via Docker

1. Baixe a imagem oficial (caso ainda não tenha):
   ```bash
   docker pull postgres:16
   ```
2. Crie um volume para manter os dados entre reinicializações (opcional, porém recomendado):
   ```bash
   docker volume create fincheck-postgres-data
   ```
3. Suba o contêiner com usuário, senha e banco já configurados:
   ```bash
   docker run --name fincheck-postgres \
     -e POSTGRES_USER=fincheck \
     -e POSTGRES_PASSWORD=fincheck \
     -e POSTGRES_DB=fincheck \
     -p 5432:5432 \
     -v fincheck-postgres-data:/var/lib/postgresql/data \
     -d postgres:16
   ```
4. Confirme que o contêiner está saudável:
   ```bash
   docker ps
   docker logs -f fincheck-postgres   # opcional, para acompanhar a inicialização
   ```

> Para encerrar ou reiniciar o banco: `docker stop fincheck-postgres` e `docker start fincheck-postgres`.

## Configuração do Back-end (`api`)

1. Entre na pasta do back-end:
   ```bash
   cd api
   ```
2. Copie o arquivo de exemplo e ajuste as variáveis:
   ```bash
   copy .env.example .env        # Windows
   # ou
   cp .env.example .env          # Linux/macOS
   ```
   Preencha o arquivo `.env` com os valores desejados. Valores mínimos sugeridos:
   ```
   DATABASE_URL="postgresql://fincheck:fincheck@localhost:5432/fincheck?schema=public"
   JWT_SECRET="uma_chave_segura_qualquer"
   ```
3. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn
   ```
4. Execute as migrações (gera tabelas no banco já criado):
   ```bash
   npx prisma migrate dev
   ```
5. Suba a API em modo desenvolvimento:
   ```bash
   npm run start:dev
   # ou
   yarn start:dev
   ```
   A API ficará disponível em `http://localhost:3001` (ajuste conforme configurar o `PORT` no projeto, se aplicável).

## Configuração do Front-end (`client`)

1. Em outro terminal, acesse a pasta do front:
   ```bash
   cd client
   ```
2. Copie o arquivo `.env.example` para `.env` e ajuste a URL da API, caso necessário:
   ```
   VITE_API_URL=http://localhost:3001
   ```
3. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn
   ```
4. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```
   O front-end ficará disponível em `http://localhost:5173` (porta padrão do Vite).

## Fluxo de desenvolvimento recomendado

- Inicie o contêiner do PostgreSQL (`docker start fincheck-postgres`).
- Suba a API (`npm run start:dev` dentro de `api`).
- Suba o front (`npm run dev` dentro de `client`).
- Verifique logs dos serviços sempre que precisar (`docker logs`, terminal da API ou do front).

## Dicas adicionais

- Para listar migrações e checar o estado do Prisma, use `npx prisma migrate status`.
- Caso altere o schema Prisma, rode `npx prisma migrate dev` novamente para aplicar as mudanças.
- Para parar rapidamente todos os serviços: interrompa os processos `start:dev`/`dev` com `Ctrl+C` e pare o contêiner `docker stop fincheck-postgres`.

Com isso, o ambiente estará pronto para desenvolver e testar o Fincheck localmente. Bons testes! :)
