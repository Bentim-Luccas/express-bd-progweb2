# API REST com Express — Conexão Inicial ao MySQL

**Projeto:** `express-bd-progweb2`  
**Atividade:** Conexão da API ao MySQL com `mysql2`  
**Branch:** `branch_20260821`

API RESTful acadêmica para gerenciamento de alunos. Nesta etapa, a aplicação configura um pool de conexões com MySQL e exige que o banco responda antes de iniciar o servidor HTTP. As rotas CRUD ainda utilizam um array em memória.

## 1. Descrição

O projeto faz parte da Unidade Curricular Programação Web 2 do Senac RJ e demonstra a transição de uma API Express com armazenamento em memória para uma arquitetura preparada para utilizar MySQL. O objetivo específico desta branch é configurar o acesso ao banco, separar o ponto de entrada do servidor e verificar a conexão na inicialização. Alunos, professores e clientes HTTP, como Bruno e Insomnia, são os consumidores previstos no contexto didático.

**Importante:** conectar-se ao banco **não** significa que o CRUD já persiste informações nele. Nesta versão, o cadastro, a consulta, a atualização e a exclusão de alunos continuam manipulando o array em `src/app.js`.

## 2. Funcionalidades

- Rota raiz para resposta de texto.
- CRUD de alunos armazenados em memória.
- Configuração de conexão com MySQL por meio de `mysql2/promise`.
- Pool de conexões reutilizáveis.
- Verificação da conexão com `SELECT 1` antes de iniciar o servidor HTTP.
- Encerramento do processo com código de erro caso a conexão inicial falhe.
- Variáveis de ambiente carregadas por meio de `.env`.
- Arquivo Docker Compose para executar um MySQL 8.4 e volume nomeado para persistência do banco.
- Coleção de requisições HTTP na pasta `bruno/`.

## 3. Tecnologias Utilizadas

- Node.js e JavaScript com ES Modules.
- Express 5 (dependência declarada `^5.2.1`).
- `mysql2` (dependência declarada `^3.23.4`).
- npm.
- MySQL 8.4 e Docker Compose (infraestrutura prevista pelo projeto).
- Requisições de teste na pasta `bruno/`.
- Git e GitHub.

O `package.json` também declara Nodemon como dependência de desenvolvimento, mas o script `dev` desta branch utiliza `node --watch` nativo do Node.js, e não Nodemon.

## 4. Arquitetura e Organização do Projeto

```text
express-bd-progweb2/
├── bruno/
│   └── API Alunos/
├── src/
│   ├── database/
│   │   └── pool.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

- `src/app.js`: cria a aplicação Express, registra middleware JSON e implementa rotas sobre um array local.
- `src/database/pool.js`: exporta um pool configurado com `mysql2/promise` e variáveis de ambiente.
- `src/server.js`: importa a aplicação e o pool, verifica `SELECT 1` e só então chama `app.listen()`.
- `.env.example`: modelo das variáveis necessárias.
- `docker-compose.yml`: definição do serviço MySQL e volume nomeado.
- `bruno/`: exemplos de requisições HTTP para a API.

**Fluxo na inicialização:** comando npm → carregamento de `.env` → `src/server.js` → `pool.query('SELECT 1')` → inicialização HTTP se a consulta funcionar.  
**Fluxo de uma requisição CRUD:** cliente HTTP → Express → rota em `src/app.js` → array de alunos → resposta HTTP. O MySQL ainda não participa desse segundo fluxo.

## 5. Pré-requisitos

- Node.js com suporte a `--watch` e `--env-file` (por exemplo, Node.js 24).
- npm e Git.
- Servidor MySQL acessível e credenciais válidas.
- Opcionalmente, Docker e Docker Compose para executar o MySQL definido no repositório.

## 6. Instalação

### 6.1 Clone o repositório

```bash
git clone https://github.com/Bentim-Luccas/express-bd-progweb2.git
```

### 6.2 Acesse a pasta e selecione a branch

```bash
cd express-bd-progweb2
git switch branch_20260821
```

### 6.3 Instale as dependências

```bash
npm ci
```

## 7. Configuração das Variáveis de Ambiente

Crie um `.env` na raiz, partindo de `.env.example`:

```cmd
copy .env.example .env
```

Preencha conforme a instalação local do banco:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=api_rest
```

Se estiver utilizando o Compose fornecido para o exercício, utilize as credenciais didáticas definidas nele, exclusivamente no ambiente local. **Nunca publique credenciais reais ou o arquivo `.env`.** O `.gitignore` contempla `.env`.

## 8. Execução do Projeto

Se autorizado e disponível, inicie o banco via Docker Compose:

```bash
docker compose up -d
docker compose ps
```

Com o MySQL acessível, execute a API em desenvolvimento:

```bash
npm run dev
```

O script executa `node --watch --env-file=.env src/server.js`. Para execução sem modo watch:

```bash
npm start
```

O script `start` executa `node --env-file=.env src/server.js`.

O endereço esperado após a verificação bem-sucedida da conexão é `http://localhost:3000`.

Se o banco não estiver acessível, a aplicação exibirá a falha de conexão e encerrará; isto decorre da verificação executada **antes** de abrir a porta HTTP.

## 9. Endpoints da API

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/` | Mensagem de apresentação da API. |
| GET | `/alunos` | Lista os alunos em memória. |
| GET | `/alunos/:id` | Retorna um array com alunos cujo ID corresponde ao parâmetro. |
| POST | `/alunos` | Adiciona um objeto ao array de alunos. |
| PUT | `/alunos/:id` | Altera nome e curso de um aluno pelo ID. |
| DELETE | `/alunos/:id` | Remove um elemento do array pelo ID. |

## 10. Exemplos de Requisição e Resposta

**Cadastro (requer servidor HTTP iniciado):**

```http
POST /alunos
Content-Type: application/json

{
  "id": 5,
  "nome": "Monica",
  "curso": "ADS"
}
```

**Resposta atual:** HTTP `201 Created`, corpo em texto simples:

```text
Aluno cadastrado com sucesso!
```

**Consulta:** `GET /alunos/5`. O retorno será um array JSON contendo o registro, caso ele exista no array em memória.

**Verificação interna do banco na inicialização:** `SELECT 1`. Esse comando **não** é um endpoint HTTP e não grava nem consulta a tabela `alunos`.

## 11. Autenticação

A API não implementa autenticação ou autorização. As rotas são públicas enquanto o servidor estiver acessível.

## 12. Tratamento de Erros

Existe tratamento da falha de conexão inicial com MySQL em `src/server.js`: a aplicação registra a mensagem de erro e encerra com `process.exit(1)`.

Ainda não há tratamento padronizado de erros nas rotas CRUD. Em particular, o código não valida IDs inexistentes: `findIndex()` pode retornar `-1`, o que torna a atualização inválida e pode fazer a exclusão remover o último elemento do array. O cadastro também não valida os campos ou evita IDs duplicados.

As rotas implementadas utilizam `200` para consultas e operações bem-sucedidas e `201` para criação, conforme o código atual. Outros status não estão explicitamente padronizados.

## 13. Testes

Não há suíte de testes automatizados configurada no `package.json` desta branch.

A pasta `bruno/API Alunos/` contém requisições manuais para a rota raiz, listagem, busca, cadastro, atualização e exclusão. Execute-as no Bruno quando o servidor estiver iniciado.

Para checar apenas a sintaxe dos arquivos sem conectar ao banco:

```bash
node --check src/app.js
node --check src/server.js
node --check src/database/pool.js
```

Esses comandos **não** validam a conexão com MySQL nem o funcionamento das rotas HTTP.

## 14. Documentação da API

Não existe Swagger/OpenAPI configurado nesta branch. Os endpoints estão documentados neste README e exemplificados na coleção `bruno/`.

## 15. Modelo de Dados

**Entidade didática `Aluno` (ainda em memória nesta branch):**

```text
Aluno
├── id
├── nome
└── curso
```

O banco configurado é `api_rest`. O tutorial prevê uma tabela relacional `alunos` com `id` inteiro autoincremental (chave primária), `nome` e `curso` como campos de texto obrigatórios. Entretanto, o código desta branch não executa operações de CRUD nessa tabela, nem possui migration ou script SQL de criação de tabelas versionado.

## 16. Regras de Negócio

- Os registros iniciais são definidos no array dentro de `src/app.js`.
- O cadastro acrescenta ao array o objeto recebido no corpo JSON, sem gerar ID automaticamente.
- A busca por ID utiliza `filter()` e retorna um array.
- A aplicação HTTP só é inicializada após uma consulta bem-sucedida `SELECT 1` ao banco.
- Os dados CRUD em memória são perdidos quando o processo Node.js é reiniciado.

Não existem validações formais de dados ou controles de acesso implementados.

## 17. Extras — Programação Web 2

- **Verificação de prontidão do banco:** `src/server.js` executa `SELECT 1` antes de iniciar o HTTP.
- **Pool de conexões:** `mysql2/promise` configura reutilização, limite de dez conexões e espera por conexões disponíveis.
- **Modo watch nativo:** desenvolvimento com `node --watch`.
- **Coleção de testes manuais:** arquivos para o cliente Bruno.

Esses recursos foram identificados no repositório e não representam testes automatizados nem persistência do CRUD no banco.

## 18. Versionamento e Organização das Branches

O formato de branches adotado pela disciplina é `branch_yyyymmdd`. Neste repositório, a branch principal chama-se `master`, em vez de `main`.

Branches observadas no repositório: `branch_20260818`, `branch_20260821`, `branch_20260825`, `branch_20260825_extra` e `master`.

Esta documentação descreve exclusivamente `branch_20260821`. O procedimento de aula é concluir a atividade, registrar commits claros e integrar à branch principal, preservando o desenvolvimento mais recente e a documentação de cada etapa.

## 19. Autor

- **Nome:** Luccas Souza Bentim
- **Turma:** Programação Web II — 2026.2 — Noite
- **Unidade Curricular:** Programação Web 2
- **GitHub:** https://github.com/Bentim-Luccas

## 20. Licença e Uso Acadêmico

Projeto desenvolvido para fins acadêmicos na Unidade Curricular Programação Web 2 — Senac RJ, destinado ao estudo, avaliação e acompanhamento da aprendizagem.

O `package.json` declara o identificador `ISC`; este README não substitui um arquivo de licença separado.

**Nota sobre execução:** a leitura e a análise desta branch foram feitas a partir dos arquivos no GitHub. A conexão do MySQL via Docker não foi validada nesta máquina institucional porque o Docker não está instalado e a instalação do WSL exigiu autorização administrativa. A execução completa deve ser verificada em um ambiente autorizado com MySQL disponível.
