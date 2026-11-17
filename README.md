# API REST com Express e MySQL — Alunos, Cursos e Service

**Projeto:** `express-bd-progweb2`  
**Atividade:** Complemento da aula de 25/08 — Cursos e Regras de Negócio  
**Branch:** `branch_20260825_extra`  
**Disciplina:** Programação Web 2 — Senac RJ

## 1. Descrição

Evolução da API REST desenvolvida com Node.js, Express e MySQL. Além do CRUD de alunos, esta etapa adiciona o CRUD de cursos e introduz uma camada **Service** no cadastro de alunos para verificar a existência do curso informado. O modelo de aluno muda: deixa de utilizar o texto `curso` e passa a armazenar a referência numérica `curso_id`.

Este README descreve o código efetivamente presente na branch, inclusive diferenças entre o comportamento pretendido e limitações ainda existentes.

## 2. Funcionalidades

- Listar, consultar, cadastrar, atualizar e excluir cursos.
- Listar, consultar, cadastrar, atualizar e excluir alunos por meio de consultas MySQL.
- Relacionar o aluno a um curso por `curso_id` nos métodos de acesso a dados.
- Verificar se um curso existe antes de cadastrar um aluno, por meio de `AlunoService.cadastrar()`.
- Iniciar o servidor HTTP apenas depois de confirmar a conexão com MySQL.
- Disponibilizar coleções de requisições HTTP no Bruno para alunos e cursos.

**Ressalva:** a atualização de alunos e o tratamento de erro para curso inexistente possuem inconsistências identificadas na implementação atual; consulte as seções 12 e 16.

## 3. Tecnologias Utilizadas

- **Node.js** com ES Modules, `--watch` e `--env-file`.
- **Express 5** para rotas e respostas HTTP.
- **MySQL 8.4** para armazenamento relacional.
- **mysql2/promise** e pool de conexões para execução de SQL.
- **Docker Compose** para inicializar o serviço MySQL no ambiente didático.
- **Bruno** para coleções de testes manuais.
- **npm** para gerenciamento de dependências.

Dependências declaradas: `express` `^5.2.1`, `mysql2` `^3.23.4`, `nodemon` `^3.1.14` como dependência de desenvolvimento (não utilizado nos scripts atuais).

## 4. Arquitetura e Organização do Projeto

```text
express-bd-progweb2/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── package-lock.json
├── bruno/
│   ├── API Alunos/
│   └── Cursos/
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   ├── alunos.routes.js
    │   └── cursos.routes.js
    ├── controllers/
    │   ├── AlunoController.js
    │   └── CursoController.js
    ├── services/
    │   └── AlunoService.js
    ├── repositories/
    │   ├── AlunoRepository.js
    │   └── CursoRepository.js
    └── database/
        └── pool.js
```

Fluxos principais:

```text
GET /cursos → Route → CursoController → CursoRepository → MySQL

POST /alunos → Route → AlunoController → AlunoService
                                   ├── CursoRepository (verifica o curso)
                                   └── AlunoRepository (insere o aluno)
```

As outras operações de alunos ainda chamam `AlunoRepository` diretamente do Controller; a Service atua especificamente no cadastro.

## 5. Pré-requisitos

- Node.js compatível com `--env-file` (recomenda-se Node.js 20.6+), npm e acesso a MySQL.
- Docker/Compose opcional para iniciar o MySQL segundo o arquivo versionado.
- Banco `api_rest` com tabelas **`cursos`** e **`alunos`** compatíveis com as queries dos Repositories.
- Credenciais de acesso ao banco.

**Importante:** o repositório não contém migrations ou arquivo SQL que configure automaticamente o novo esquema de alunos/cursos. A criação/adequação das tabelas é uma preparação separada.

## 6. Instalação

```bash
git clone https://github.com/Bentim-Luccas/express-bd-progweb2.git
cd express-bd-progweb2
git switch branch_20260825_extra
npm ci
```

## 7. Configuração das Variáveis de Ambiente

No Windows (CMD):

```cmd
copy .env.example .env
```

Exemplo para banco local:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=api_user
DB_PASSWORD=<senha_do_mysql_local>
DB_NAME=api_rest
```

Ajustar `DB_USER` e `DB_PASSWORD` aos valores da instância MySQL. As credenciais do Compose são apenas didáticas; `.env` não deve ser versionado.

## 8. Execução do Projeto

Com Docker disponível, iniciar a infraestrutura:

```bash
docker compose up -d
docker compose ps
```

**Antes da API:** garantir que o MySQL contém as tabelas esperadas (`cursos` com `id` e `nome`; `alunos` com `id`, `nome` e `curso_id`). O `docker-compose.yml` cria o banco `api_rest`, mas não cria automaticamente essas tabelas.

Iniciar a API:

```bash
npm run dev
```

Ou, sem monitoramento de alterações:

```bash
npm start
```

O script carrega `.env` e executa `src/server.js`. O servidor testa `SELECT 1` antes de chamar `app.listen()`. Portanto, sem conexão com o MySQL ele não inicia o HTTP.

## 9. Endpoints da API

| Método | Endpoint | Operação | Resposta de sucesso |
|---|---|---|---|
| `GET` | `/` | Status básico da API | `200` |
| `GET` | `/alunos` | Listar alunos | `200` |
| `GET` | `/alunos/:id` | Consultar aluno | `200` |
| `POST` | `/alunos` | Cadastrar aluno vinculado a curso | `201` |
| `PUT` | `/alunos/:id` | Atualizar aluno | `200`* |
| `DELETE` | `/alunos/:id` | Excluir aluno | `204` |
| `GET` | `/cursos` | Listar cursos | `200` |
| `GET` | `/cursos/:id` | Consultar curso | `200` |
| `POST` | `/cursos` | Cadastrar curso | `201` |
| `PUT` | `/cursos/:id` | Atualizar curso | `200` |
| `DELETE` | `/cursos/:id` | Excluir curso | `204` |

*O `PUT /alunos/:id` tem incompatibilidade de campos entre Controller e Repository; pode falhar na prática (seção 12). Operações por ID retornam `404` quando o recurso não existe, conforme os Controllers, exceto por falhas não tratadas.

## 10. Exemplos de Requisição e Resposta

**POST `/cursos`:**

```json
{"nome":"ADS"}
```

Resposta ilustrativa (`201 Created`):

```json
{"id":1,"nome":"ADS"}
```

**POST `/alunos`:** agora o corpo esperado pelo código utiliza `curso_id`:

```json
{"nome":"Mônica","curso_id":1}
```

Se o curso existir e a inserção funcionar, exemplo de resposta `201 Created`:

```json
{"id":5,"nome":"Mônica","curso_id":1}
```

Os identificadores exibidos são exemplos e dependem dos dados existentes no MySQL.

**GET `/alunos/5`:** retorna `{ "id": 5, "nome": "Mônica", "curso_id": 1 }` se o registro existir.

**DELETE `/cursos/1`:** em caso de sucesso, retorna `204 No Content`. O resultado depende das restrições de integridade referencial configuradas no banco.

## 11. Autenticação

Não há autenticação, perfis, autorização ou JWT nesta branch acadêmica.

## 12. Tratamento de Erros

- Consulta, edição ou exclusão de aluno/curso inexistente: os Controllers possuem caminhos de retorno `404`.
- Falha de conexão inicial com o MySQL: `server.js` registra o erro e encerra o processo.
- Falhas SQL e payloads inválidos: não há middleware dedicado de validação e tratamento específico para todos os casos.
- **Curso inexistente no cadastro de aluno:** `AlunoService.cadastrar()` executa `throw new Error(...)` quando o curso não existe, enquanto `AlunoController.store()` verifica `if (!aluno)` depois de `await`. Essa verificação não captura a exceção. Como o projeto utiliza Express 5, a rejeição pode ser encaminhada ao tratamento padrão de erro e resultar em HTTP `500`, em vez do `404` pretendido.
- **Atualização de aluno:** o Controller extrai `{ nome, curso }`, mas `AlunoRepository.update()` espera `{ nome, curso_id }`. Como consequência, o campo `curso_id` chega como `undefined` ao driver, e a atualização pode falhar.

Esses pontos são **limitações reais do código**, não correções já aplicadas.

## 13. Testes

Há coleções Bruno em `bruno/API Alunos/` e `bruno/Cursos/`. Não existe suíte de testes automatizados ou script `npm test` funcional nesta branch.

Sequência recomendada para teste manual com o banco preparado:

1. Criar um curso por `POST /cursos` e consultar por `GET /cursos`.
2. Criar um aluno por `POST /alunos` usando o `curso_id` retornado.
3. Conferir `GET /alunos` e `GET /alunos/:id`.
4. Testar casos inexistentes (`GET /cursos/999`, `GET /alunos/999`).
5. Testar o comportamento do cadastro com `curso_id` inexistente e registrar o status efetivo.
6. Verificar separadamente a atualização de alunos e as restrições de exclusão com relacionamentos.

**Atenção:** os arquivos Bruno de alunos mantêm exemplos antigos com `curso` textual e, no POST, um `id` enviado pelo cliente. Para esta branch, o corpo correto do cadastro é `{ "nome": "...", "curso_id": <id_existente> }`, sem `id`.

Sem MySQL disponível, `node --check` verifica apenas a sintaxe dos arquivos, não o funcionamento das operações SQL.

## 14. Documentação da API

As rotas são definidas em `src/routes/` e demonstradas na coleção Bruno. Não há Swagger/OpenAPI.

## 15. Modelo de Dados

Os Repositories pressupõem estas estruturas:

| Tabela | Campos acessados no código | Papel |
|---|---|---|
| `cursos` | `id`, `nome` | Cadastro dos cursos |
| `alunos` | `id`, `nome`, `curso_id` | Cadastro dos alunos e referência ao curso |

O relacionamento lógico é `alunos.curso_id → cursos.id`. A **existência de uma chave estrangeira declarada no MySQL não pode ser confirmada apenas pelo repositório**: não há scripts SQL/migrations versionados nesta branch. Uma relação de FK é recomendável para garantir integridade no banco.

Na branch anterior, alunos tinham a coluna textual `curso`; nesta etapa, o SQL foi alterado para `curso_id`, portanto um banco criado com a tabela antiga precisa de adequação de esquema antes da execução integral.

## 16. Regras de Negócio

- O novo cadastro de aluno recebe `nome` e `curso_id`.
- `AlunoService.cadastrar()` consulta `CursoRepository.findById(curso_id)` antes de inserir o aluno.
- Se o curso existir, `AlunoRepository.create()` executa o `INSERT` na tabela `alunos`.
- Se o curso não existir, a Service lança uma exceção; o Controller ainda não transforma corretamente esse caso em `404`.
- O MySQL gera os IDs automaticamente; o Repository usa `insertId` e `affectedRows`.
- Não foram implementadas validações formais de nome, IDs e relacionamentos no código da API.

## 17. Extras — Programação Web 2

Evoluções em relação à branch de 25/08:

- CRUD completo de `cursos` com Routes, Controller e Repository próprios.
- Introdução de `AlunoService.js` para uma regra de negócio que envolve duas entidades.
- Substituição de `alunos.curso` por `alunos.curso_id`.
- Importação e montagem da rota `/cursos` em `src/app.js`.
- Exemplos de requisições Bruno para cursos.
- Discussão prática sobre tratamento de erros assíncronos, consistência do payload e integridade referencial.

## 18. Versionamento e Organização das Branches

Esta branch representa a atividade complementar de 25/08 (`branch_20260825_extra`), posterior à `branch_20260825`. O projeto utiliza branches por data (`branch_yyyymmdd`) e realiza merges para manter a `master` atualizada. O README desta branch deve refletir a versão de alunos e cursos, sem reescrever a documentação das branches anteriores.

## 19. Autor

Projeto acadêmico baseado nas atividades da disciplina Programação Web 2 — Senac RJ. Repositório: [Bentim-Luccas/express-bd-progweb2](https://github.com/Bentim-Luccas/express-bd-progweb2).

## 20. Licença e Uso Acadêmico

O `package.json` indica licença `ISC`, sem arquivo `LICENSE` independente nesta branch. Material de finalidade acadêmica; reutilizações devem respeitar a autoria dos tutoriais e de eventuais colaboradores.
