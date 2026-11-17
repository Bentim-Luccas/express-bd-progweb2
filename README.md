# API REST com Express e MySQL — CRUD em Camadas

**Projeto:** `express-bd-progweb2`  
**Atividade:** Tutorial 4 — CRUD com Routes, Controllers e Repositories  
**Branch:** `branch_20260825`  
**Disciplina:** Programação Web 2 — Senac RJ

## 1. Descrição

API REST didática para gerenciamento de alunos, desenvolvida em Node.js e Express. Nesta etapa, o CRUD deixa de utilizar um array em memória e passa a realizar operações SQL no MySQL por meio da biblioteca `mysql2`. O código separa o roteamento HTTP, o tratamento das requisições e o acesso ao banco de dados. O servidor só passa a escutar requisições depois de confirmar a conexão com o MySQL.

## 2. Funcionalidades

- Listar todos os alunos cadastrados no banco.
- Consultar um aluno pelo identificador.
- Cadastrar um aluno, com ID gerado pelo MySQL.
- Atualizar nome e curso de um aluno.
- Excluir um aluno.
- Retornar HTTP `404` para alunos não encontrados nas operações de consulta, atualização ou exclusão.
- Verificar a conexão com o MySQL na inicialização.

## 3. Tecnologias Utilizadas

- **Node.js:** runtime JavaScript; o projeto utiliza ES Modules e os recursos `--watch` e `--env-file`.
- **Express 5:** API e roteamento HTTP.
- **MySQL 8.4:** banco de dados relacional.
- **mysql2/promise:** driver MySQL com Promises e pool de conexões.
- **Docker Compose:** disponibilização do serviço MySQL em ambiente de desenvolvimento.
- **Bruno:** coleção versionada para testar os endpoints HTTP.
- **npm:** gerenciamento de dependências e scripts.

Dependências declaradas no `package.json`: `express` `^5.2.1`, `mysql2` `^3.23.4` e `nodemon` `^3.1.14` (devDependency; não é usado pelos scripts atuais).

## 4. Arquitetura e Organização do Projeto

```text
express-bd-progweb2/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── package-lock.json
├── bruno/
│   └── API Alunos/
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   └── alunos.routes.js
    ├── controllers/
    │   └── AlunoController.js
    ├── repositories/
    │   └── AlunoRepository.js
    └── database/
        └── pool.js
```

Fluxo das operações de alunos:

```text
Cliente HTTP → src/app.js → alunos.routes.js → AlunoController
                                        → AlunoRepository → pool.js → MySQL
```

- `app.js`: cria a aplicação Express, habilita `express.json()` e registra `/alunos`.
- `alunos.routes.js`: relaciona métodos HTTP aos métodos do Controller.
- `AlunoController.js`: lê `req.params` e `req.body`, chama o Repository e define as respostas HTTP.
- `AlunoRepository.js`: executa consultas parametrizadas (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
- `pool.js`: configura o pool de conexões com o MySQL.
- `server.js`: verifica a conexão e inicia o servidor HTTP.

**Nesta branch não há camada Service:** as regras ainda são simples e o Controller chama diretamente o Repository, conforme o Tutorial 4.

## 5. Pré-requisitos

- Node.js compatível com os recursos `--watch` e `--env-file` (recomenda-se Node.js 20.6+).
- npm.
- Servidor MySQL acessível (a configuração didática utiliza MySQL 8.4).
- Docker com Docker Compose, **caso** o banco seja iniciado pelo arquivo `docker-compose.yml`.
- Tabela `alunos` preparada no banco `api_rest`.

O Docker é usado para o **MySQL**; a aplicação Node.js é executada diretamente no computador.

## 6. Instalação

```bash
git clone https://github.com/Bentim-Luccas/express-bd-progweb2.git
cd express-bd-progweb2
git switch branch_20260825
npm ci
```

Não execute `npm install` para substituir dependências sem necessidade; `npm ci` respeita o arquivo de lock versionado.

## 7. Configuração das Variáveis de Ambiente

Copie o arquivo de exemplo:

**Windows (CMD):**

```cmd
copy .env.example .env
```

**Linux/macOS:**

```bash
cp .env.example .env
```

Preencha as variáveis de acordo com seu MySQL:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=api_user
DB_PASSWORD=<senha_do_mysql_local>
DB_NAME=api_rest
```

Os valores de usuário e senha devem corresponder ao banco real. O `docker-compose.yml` contém credenciais **didáticas** e não adequadas à produção. O arquivo `.env` não deve ser enviado ao Git.

## 8. Execução do Projeto

Se estiver usando Docker para o banco:

```bash
docker compose up -d
docker compose ps
```

Prepare a tabela `alunos` no MySQL se ainda não existir (o projeto **não** contém migrations):

```sql
CREATE TABLE alunos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  curso VARCHAR(100) NOT NULL
);
```

Em outro terminal, na raiz do projeto:

```bash
npm run dev
```

Para execução sem monitoramento de alterações:

```bash
npm start
```

Os scripts executam `src/server.js` usando `--env-file=.env`. Antes de abrir a porta HTTP (3000 por padrão), o servidor executa `SELECT 1` no MySQL. Caso a conexão falhe, a aplicação encerra com código de erro e **não** atende os endpoints.

## 9. Endpoints da API

| Método | Endpoint | Função | Sucesso |
|---|---|---|---|
| `GET` | `/` | Verificação simples da API | `200` |
| `GET` | `/alunos` | Listar alunos | `200` |
| `GET` | `/alunos/:id` | Buscar por ID | `200` |
| `POST` | `/alunos` | Cadastrar aluno | `201` |
| `PUT` | `/alunos/:id` | Atualizar aluno | `200` |
| `DELETE` | `/alunos/:id` | Excluir aluno | `204` |

As operações por ID retornam `404` quando o registro não existe. O código não implementa validação explícita de tipo e conteúdo dos campos.

## 10. Exemplos de Requisição e Resposta

**POST `/alunos`** — corpo JSON:

```json
{"nome":"Pedro","curso":"ADS"}
```

Resposta esperada em caso de sucesso (`201 Created`):

```json
{"id":5,"nome":"Pedro","curso":"ADS"}
```

O ID exibido é ilustrativo: o número real depende do banco. A resposta também define o cabeçalho `Location: /alunos/<id>`.

**GET `/alunos/5`** — resposta esperada (`200 OK`):

```json
{"id":5,"nome":"Pedro","curso":"ADS"}
```

**PUT `/alunos/5`** — corpo JSON:

```json
{"nome":"Pedro Silva","curso":"Sistemas de Informação"}
```

**DELETE `/alunos/5`** — sucesso com `204 No Content`, sem corpo de resposta.

## 11. Autenticação

Não há autenticação, autorização, cadastro de contas nem tokens nesta versão acadêmica. Os endpoints estão acessíveis a clientes que alcancem a API.

## 12. Tratamento de Erros

- O Controller retorna `404` com `{"mensagem":"Aluno não encontrado"}` se não encontrar o registro nas operações por ID.
- O `server.js` encerra a inicialização se a conexão com MySQL falhar.
- As consultas utilizam parâmetros (`?`) com `pool.execute`, evitando a interpolação direta de valores externos em comandos SQL.
- **Limitações:** não há validação robusta do payload/ID, middleware específico de erros SQL ou respostas personalizadas para todas as falhas do banco. Na versão Express 5, erros assíncronos rejeitados seguem o tratamento de erro do framework.

## 13. Testes

A branch contém uma coleção de requisições Bruno em `bruno/API Alunos/`, mas **não** possui suíte automatizada ou script de testes configurado.

Procedimento manual no ambiente com MySQL:

1. Iniciar o banco e confirmar a tabela `alunos`.
2. Configurar `.env` e iniciar a API com `npm run dev`.
3. No Bruno, executar GET da raiz, POST de aluno, GET da lista, GET por ID, PUT e DELETE.
4. Verificar respostas `201`, `200`, `204` e o caso de `404`.
5. Consultar o MySQL para verificar se os dados realmente foram gravados.

A coleção Bruno inclui exemplos originados das aulas anteriores; **no POST desta branch, omita o campo `id`** para deixar o banco gerá-lo.

Sem MySQL acessível, os comandos `node --check` permitem conferir apenas a sintaxe — não validam a execução da API nem a persistência.

## 14. Documentação da API

Os endpoints podem ser consultados na seção 9 e na coleção `bruno/API Alunos/`. Não há Swagger/OpenAPI configurado no projeto.

## 15. Modelo de Dados

A implementação espera uma tabela relacional `alunos` com os campos:

| Campo | Tipo esperado | Observação |
|---|---|---|
| `id` | `INT` | Chave primária com `AUTO_INCREMENT` |
| `nome` | `VARCHAR(100)` | Nome do aluno, não nulo |
| `curso` | `VARCHAR(100)` | Texto do curso, não nulo |

As consultas ficam em `AlunoRepository.js`. O esquema SQL acima reproduz o modelo tratado no tutorial, mas não é executado automaticamente pelo projeto.

## 16. Regras de Negócio

- Cada aluno é identificado pelo `id` gerado no banco.
- A API aceita `nome` e `curso` no cadastro/atualização.
- Alunos inexistentes retornam `404` em consulta individual, atualização e exclusão.
- O Repository retorna dados ou indicadores de existência; o Controller converte esses resultados em respostas HTTP.
- Não há outras validações de negócio implementadas nesta branch.

## 17. Extras — Programação Web 2

Esta etapa demonstra:

- Separação entre **Routes**, **Controllers** e **Repositories**.
- Uso de `Router()` e composição do prefixo `/alunos` com as rotas `/:id`.
- Métodos assíncronos com `async/await`.
- `pool.execute()` e parâmetros SQL com `?`.
- `insertId` (novo ID) e `affectedRows` (resultado de UPDATE/DELETE).
- Desestruturação `const [rows]` e operador `??`.
- `res.location()`, status `200`, `201`, `204` e `404`.
- `bind(alunoController)` no registro dos handlers de rota.

## 18. Versionamento e Organização das Branches

A organização acadêmica utiliza branches no padrão `branch_yyyymmdd`, correspondentes às atividades de cada aula. Nesta branch estão o CRUD SQL de alunos e a separação em camadas. O README deve ser mantido na própria branch e integrado à `master` após a conclusão da atividade. A `master` pode conter funcionalidades posteriores, conforme a evolução do projeto.

## 19. Autor

Projeto acadêmico desenvolvido a partir dos tutoriais da disciplina Programação Web 2 — Senac RJ. Repositório: [Bentim-Luccas/express-bd-progweb2](https://github.com/Bentim-Luccas/express-bd-progweb2).

## 20. Licença e Uso Acadêmico

O `package.json` declara licença `ISC`; esta branch não contém um arquivo `LICENSE` independente. Material destinado ao aprendizado e à avaliação acadêmica. Para qualquer reutilização, respeitar a autoria dos tutoriais e das contribuições externas.
