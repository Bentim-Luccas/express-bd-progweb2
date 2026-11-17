# API REST com Express — Introdução ao MySQL com Docker

**Projeto:** `express-bd-progweb2`  
**Atividade:** Tutorial 2 — Banco de Dados MySQL com Docker  
**Branch:** `branch_20260818`

API RESTful acadêmica utilizada para estudar o CRUD de alunos em memória e, paralelamente, preparar um servidor MySQL em container Docker para a futura migração da persistência.

## 1. Descrição

Esta etapa da Unidade Curricular Programação Web 2 demonstra a preparação de um banco de dados relacional com Docker Compose, sem ainda conectá-lo à aplicação Node.js + Express. O problema abordado é a ausência de persistência dos dados armazenados em arrays na memória da aplicação. A API pode ser consumida por navegadores e clientes HTTP como Bruno e Insomnia; o ambiente é didático e local.

**Estado desta branch:** o CRUD de alunos ainda utiliza um array JavaScript em `src/app.js`. O servidor MySQL é iniciado e administrado separadamente. **As requisições HTTP não consultam nem alteram o banco MySQL nesta versão.**

## 2. Funcionalidades

- Servidor Express com rota inicial e endpoints CRUD de alunos em memória.
- Configuração de um container MySQL 8.4 com Docker Compose.
- Criação inicial do banco `api_rest` por configuração do container, em um volume persistente.
- Preparação para criar a tabela `alunos` e executar comandos SQL manualmente.

Não há integração Express–MySQL, autenticação, validação de payloads ou tratamento personalizado de erros nesta branch.

## 3. Tecnologias Utilizadas

- **Node.js** e **JavaScript** com ES Modules.
- **Express 5** (`^5.2.1`).
- **Nodemon** (`^3.1.14`) para desenvolvimento.
- **MySQL 8.4**, por meio de sua imagem Docker.
- **Docker** e **Docker Compose** para a infraestrutura do banco.
- **npm** e **Git**.

> A aplicação Express não usa `mysql2` nesta branch; esse driver não consta das dependências deste `package.json`.

## 4. Arquitetura e Organização do Projeto

```text
express-bd-progweb2/
├── src/
│   └── app.js
├── docker-compose.yml
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

- `src/app.js`: cria a aplicação Express, registra `express.json()` e as rotas HTTP; mantém o array `alunos`.
- `server.js`: importa a aplicação e inicia o servidor na porta `3000`.
- `docker-compose.yml`: declara o serviço MySQL, a porta publicada e o volume de dados.
- `package.json`: define dependências e o script `dev`.
- `package-lock.json`: fixa a árvore de dependências resolvida.
- `.gitignore`: exclui `node_modules/`, arquivos `.env` e outros arquivos locais.

**Arquitetura na etapa:**

```text
Cliente HTTP ──> Express (porta 3000) ──> Array de alunos em memória

Cliente MySQL ──> Porta 3306 ──> Container MySQL ──> Volume de dados
```

As linhas acima representam **dois fluxos separados** nesta versão.

## 5. Pré-requisitos

Para executar a **API**:

- Node.js com npm.
- Git, caso vá clonar o repositório.

Para executar **também o banco conforme o tutorial**:

- Docker Engine ou Docker Desktop devidamente configurado.
- Docker Compose v2 (`docker compose`).
- Porta `3306` disponível ou uma adaptação controlada do mapeamento de portas.

O projeto foi desenvolvido para ambiente local. A disponibilidade do Docker depende das permissões e da configuração de cada computador.

## 6. Instalação

### 6.1 Clone o repositório

```bash
git clone https://github.com/Bentim-Luccas/express-bd-progweb2.git
```

### 6.2 Acesse a pasta e selecione a branch

```bash
cd express-bd-progweb2
git switch branch_20260818
```

### 6.3 Instale as dependências

```bash
npm ci
```

O `npm ci` utiliza o `package-lock.json` versionado. Alternativamente, é possível utilizar `npm install`.

## 7. Configuração das Variáveis de Ambiente

Nesta branch, a aplicação Express **não lê um arquivo `.env`** e usa a porta fixa `3000` em `server.js`. Ainda não existe `.env.example` no conteúdo desta branch.

O MySQL utiliza os parâmetros declarados na seção `environment` de `docker-compose.yml`, incluindo nome do banco, usuário e credenciais de exemplo. Essas credenciais são **somente didáticas**; não são adequadas para ambientes reais. Não reutilize senhas de exemplo em produção, nem envie segredos para o Git.

O `.gitignore` contempla arquivos `.env` para atividades futuras.

## 8. Execução do Projeto

### API Express (desenvolvimento)

```bash
npm run dev
```

O script executa `nodemon server.js`. A API fica disponível, por padrão, em `http://localhost:3000`.

### MySQL com Docker Compose

Na pasta raiz, com o Docker funcionando:

```bash
docker compose up -d
docker compose ps
docker compose logs mysql
```

O Compose cria/inicia o container `mysql-api-rest`, a partir da imagem `mysql:8.4`, com publicação da porta `3306` e um volume nomeado para os arquivos de dados.

Para parar os containers do projeto preservando o volume:

```bash
docker compose down
```

**Cuidado:** `docker compose down -v` remove também os volumes do projeto e pode causar perda dos dados de estudo.

### Execução sem Nodemon

```bash
node server.js
```

Não há script `npm start` específico no `package.json` desta branch.

## 9. Endpoints da API

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/` | Mensagem inicial da API. |
| GET | `/alunos` | Lista os alunos do array. |
| GET | `/alunos/:id` | Filtra o array por ID; retorna um array. |
| POST | `/alunos` | Acrescenta o corpo recebido ao array. |
| PUT | `/alunos/:id` | Altera nome e curso do aluno encontrado. |
| DELETE | `/alunos/:id` | Remove do array o item no índice encontrado. |

As rotas acessam exclusivamente o array JavaScript, **não** o banco MySQL.

## 10. Exemplos de Requisição e Resposta

**Requisição:**

```http
GET /alunos/1 HTTP/1.1
Host: localhost:3000
```

**Resposta típica (200):**

```json
[
  { "id": 1, "nome": "Bruno", "curso": "ADS" }
]
```

**Cadastro:**

```http
POST /alunos HTTP/1.1
Host: localhost:3000
Content-Type: application/json
```

```json
{
  "id": 5,
  "nome": "Ana",
  "curso": "ADS"
}
```

**Resposta da implementação atual:** status HTTP `201` com a mensagem em texto `Aluno cadastrado com sucesso!`. O `id` precisa ser fornecido no corpo; não é gerado automaticamente pelo Express.

**Exemplo SQL para o banco preparado separadamente:**

```sql
USE api_rest;
CREATE TABLE alunos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  curso VARCHAR(100) NOT NULL
);
INSERT INTO alunos (nome, curso) VALUES ('Bruno', 'ADS');
SELECT * FROM alunos;
```

Antes de criar a tabela, consulte `SHOW TABLES;` para evitar erro caso ela já exista.

## 11. Autenticação

A API Express não implementa autenticação. Todas as rotas estão públicas no ambiente local. O MySQL possui suas credenciais de conexão próprias, configuradas no Compose; isso **não** equivale à autenticação de usuários na API.

## 12. Tratamento de Erros

Ainda não há um padrão próprio de tratamento de erros HTTP. A implementação atual possui limitações conhecidas:

- A busca por ID usa `filter()` e retorna `[]` se não encontrar um aluno, em vez de devolver `404`.
- O `DELETE` utiliza `findIndex()` seguido de `splice()`, sem verificar índice `-1`; nesse caso pode remover o último elemento.
- O `PUT` também não verifica se o índice existe e pode provocar erro de execução.
- O `POST` não valida tipos, campos obrigatórios nem unicidade do ID.

Portanto, os exemplos de códigos `400`, `404` e `409` do modelo de documentação do professor **não representam comportamentos implementados** nesta branch.

## 13. Testes

Não há suíte automatizada configurada. O script `npm test` é o placeholder gerado pelo npm, que retorna erro intencionalmente.

**Testes manuais sugeridos:**

1. Executar `npm run dev` e consultar `GET /` e `GET /alunos`.
2. Enviar `POST`, `GET`, `PUT` e `DELETE` com IDs existentes, utilizando Bruno ou Insomnia.
3. Quando houver Docker disponível, executar `docker compose up -d`, entrar no MySQL e testar `SHOW DATABASES;`, `CREATE TABLE`, `INSERT` e `SELECT`.
4. Com dados de teste que possam ser preservados, validar a persistência do volume usando `docker compose down` e `docker compose up -d`.

**Ambiente de execução nesta revisão:** foi possível iniciar e utilizar a API Express, mas a parte Docker/MySQL não foi executada no computador institucional, pois `docker` não está instalado/disponível e o WSL também não está instalado. Isso não constitui um teste de sucesso do banco de dados.

## 14. Documentação da API

Não foi configurado Swagger/OpenAPI. Consulte as seções **9** e **10** para os endpoints e exemplos desta etapa.

## 15. Modelo de Dados

**Modelo em memória na API Express:**

```text
Aluno
├── id
├── nome
└── curso
```

**Modelo relacional previsto no tutorial do banco MySQL:**

```text
alunos
├── id INT PRIMARY KEY AUTO_INCREMENT
├── nome VARCHAR(100) NOT NULL
└── curso VARCHAR(100) NOT NULL
```

A tabela é criada manualmente por SQL; ela não é criada pelo código Express nesta etapa. Por haver somente uma tabela nesse exemplo, não existem relacionamentos para representar em um DER.

## 16. Regras de Negócio

Nesta etapa, as operações de CRUD manipulam diretamente os objetos do array, sem validação de campos ou regras de autorização. O MySQL é configurado com uma tabela de estudo, cujo `id` é chave primária autoincremental e cujas colunas `nome` e `curso` não aceitam `NULL`.

A API ainda **não impõe** essas restrições do MySQL sobre os dados enviados ao Express, pois as duas partes não estão integradas.

## 17. Extras — Programação Web 2

Não foram adicionadas funcionalidades extras fora do escopo do tutorial. Docker Compose, o container MySQL e o volume persistente fazem parte dos objetivos básicos desta atividade, não de uma extensão opcional. Não há autenticação JWT, Swagger, paginação, cache ou testes automatizados.

## 18. Versionamento e Organização das Branches

A disciplina orienta branches semanais no formato `branch_yyyymmdd`, com commits descritivos e posterior merge na branch principal.

Neste repositório, a branch principal se chama **`master`**. As branches encontradas no GitHub são:

- `branch_20260818` — preparação do MySQL com Docker (este README).
- `branch_20260821` — atividade posterior.
- `branch_20260825` — atividade posterior.
- `branch_20260825_extra` — atividade complementar posterior.
- `master` — versão consolidada mais recente.

A documentação e o histórico devem ser preservados por branch. Antes de mesclar atividades históricas em `master`, confira o grafo Git, pois `master` já pode conter atividades posteriores. Não substitua o README da `master` pelo de uma aula antiga sem analisar o resultado do merge.

## 19. Autor

**Nome:** Luccas Souza Bentim  
**Turma:** Programação Web II — 2026.2 — Noite  
**Unidade Curricular:** Programação Web 2  
**GitHub:** https://github.com/Bentim-Luccas

## 20. Licença e Uso Acadêmico

Projeto desenvolvido para fins acadêmicos na Unidade Curricular Programação Web 2 — Senac RJ. O código pode ser utilizado para estudo, avaliação e acompanhamento acadêmico durante a disciplina.

O `package.json` declara `ISC` como identificador de licença; este README não substitui os termos completos de uma licença.
