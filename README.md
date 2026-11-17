# API REST de Alunos e Cursos — Express + MySQL

> **Projeto:** `express-bd-progweb2`  
> **Disciplina:** Programação Web 2 — Senac RJ  
> **Versão documentada:** `master` (projeto consolidado)  
> **Cliente HTTP para testes:** Insomnia

## 1. Descrição

Este projeto acadêmico implementa uma API REST para o gerenciamento de **alunos** e **cursos**, utilizando Node.js, Express e MySQL. Ele reúne o resultado final das atividades de conexão com o banco de dados, implementação de CRUD e organização do backend em camadas.

A API disponibiliza endpoints HTTP para consultar, cadastrar, atualizar e excluir registros. Cada aluno possui um `curso_id`, que representa o curso ao qual está associado. O servidor utiliza um pool de conexões e verifica o acesso ao MySQL antes de começar a receber requisições.

## 2. Funcionalidades

- Cadastro, listagem, consulta por ID, atualização e exclusão de cursos.
- Cadastro, listagem, consulta por ID, atualização e exclusão de alunos.
- Relacionamento lógico de aluno com curso pelo campo `curso_id`.
- Regra de negócio no cadastro de alunos: consultar se o curso informado existe.
- Operações de persistência por instruções SQL parametrizadas.
- Códigos de resposta HTTP para sucesso e registros não encontrados.
- Verificação inicial da disponibilidade do MySQL.
- Testes manuais dos endpoints com o **Insomnia**.

**Limitações conhecidas:** a versão atual apresenta uma incompatibilidade de campos no endpoint de atualização de alunos e não converte adequadamente a exceção de curso inexistente em uma resposta HTTP específica. Esses pontos são detalhados nas seções 12 e 16.

## 3. Tecnologias Utilizadas

| Tecnologia | Utilização |
|---|---|
| Node.js | Execução do backend com JavaScript e ES Modules |
| Express 5 | Servidor HTTP, rotas e respostas REST |
| MySQL 8.4 | Persistência relacional |
| mysql2/promise | Pool de conexões e consultas SQL assíncronas |
| Docker Compose | Infraestrutura local do banco de dados |
| npm | Gerenciamento de dependências e scripts |
| Insomnia | Envio e inspeção de requisições HTTP |
| Git e GitHub | Controle de versões e organização das atividades |

O `package.json` também declara o `nodemon` como dependência de desenvolvimento, mas os scripts atuais usam a opção nativa `node --watch`.

## 4. Arquitetura e Organização do Projeto

Estrutura da versão final, **após a retirada das antigas coleções de teste**:

```text
express-bd-progweb2/
├── .env.example
├── .gitignore
├── README.md
├── docker-compose.yml
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   ├── AlunoController.js
    │   └── CursoController.js
    ├── services/
    │   └── AlunoService.js
    ├── repositories/
    │   ├── AlunoRepository.js
    │   └── CursoRepository.js
    ├── routes/
    │   ├── alunos.routes.js
    │   └── cursos.routes.js
    └── database/
        └── pool.js
```

**Papel dos arquivos e camadas:**

- **`src/server.js`:** verifica a conexão com o banco e inicia o servidor HTTP.
- **`src/app.js`:** cria a aplicação Express, habilita o processamento de JSON e registra os grupos de rotas.
- **Routes:** associam métodos e caminhos HTTP às funções dos Controllers.
- **Controllers:** recebem `req`, acessam parâmetros e corpo da requisição e constroem as respostas `res`.
- **Service:** concentra a regra de existência do curso durante o cadastro de aluno.
- **Repositories:** executam instruções SQL para persistir e consultar dados.
- **`database/pool.js`:** configura um pool de conexões MySQL com `mysql2/promise`.

Fluxo da consulta de um curso:

```text
Insomnia → Express → cursos.routes.js → CursoController
                                             ↓
                                       CursoRepository
                                             ↓
                                       Pool → MySQL
```

Fluxo do cadastro de aluno:

```text
POST /alunos → alunos.routes.js → AlunoController.store()
                                         ↓
                                  AlunoService.cadastrar()
                                      ├── CursoRepository.findById()
                                      └── AlunoRepository.create()
                                                ↓
                                               MySQL
```

A camada **Service** é usada especificamente no cadastro de alunos. Os outros métodos do `AlunoController` acessam o Repository diretamente.

## 5. Pré-requisitos

- Node.js com suporte a `--env-file` (Node.js 20.6 ou superior) e npm.
- Git, para clonar e atualizar o projeto.
- MySQL acessível; o ambiente didático foi configurado para MySQL 8.4.
- Docker e Docker Compose, **se** o MySQL for executado pelo container descrito no repositório.
- Insomnia para testar as requisições HTTP.
- Banco de dados `api_rest` contendo tabelas compatíveis com o código atual: `cursos` e `alunos`.

O projeto **não** possui scripts de migration nem mecanismo que crie automaticamente as tabelas da versão final.

## 6. Instalação

Clone o repositório e utilize a versão consolidada:

```bash
git clone https://github.com/Bentim-Luccas/express-bd-progweb2.git
cd express-bd-progweb2
git switch master
npm ci
```

O comando `npm ci` instala as dependências com base no arquivo `package-lock.json`.

## 7. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` a partir do exemplo. No CMD do Windows:

```cmd
copy .env.example .env
```

Em Linux/macOS:

```bash
cp .env.example .env
```

Para o ambiente **didático** definido no `docker-compose.yml`, utilize:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=api_user
DB_PASSWORD=api123
DB_NAME=api_rest
```

- `PORT`: porta HTTP da API.
- `DB_HOST` e `DB_PORT`: localização do servidor MySQL acessível pelo Node.js.
- `DB_USER` e `DB_PASSWORD`: credenciais do banco.
- `DB_NAME`: banco de dados utilizado pela aplicação.

Essas credenciais são exemplos de desenvolvimento e **não devem ser usadas em produção**. O arquivo `.env` é ignorado pelo Git e não deve ser versionado.

## 8. Execução do Projeto

### 8.1 Iniciar o MySQL

Com Docker disponível e autorizado, na raiz do projeto:

```bash
docker compose up -d
docker compose ps
```

O Compose define um container chamado `mysql-api-rest`, a imagem `mysql:8.4`, a porta `3306` e um volume nomeado para persistência.

**Atenção:** o Compose cria o banco `api_rest` na primeira inicialização do volume, mas **não cria as tabelas** `alunos` e `cursos`.

Para entrar no MySQL:

```bash
docker exec -it mysql-api-rest mysql -u root -p
```

A senha de exemplo para o usuário `root` está no arquivo Compose. Dentro do cliente MySQL:

```sql
USE api_rest;
SHOW TABLES;
```

Se as tabelas não existirem, uma definição *de referência*, compatível com as operações dos Repositories, é:

```sql
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    curso_id INT NOT NULL,
    CONSTRAINT fk_alunos_cursos
        FOREIGN KEY (curso_id) REFERENCES cursos(id)
);
```

**Não execute os `CREATE TABLE` se já existirem tabelas com esses nomes.** Se o volume contiver a estrutura das aulas anteriores (`alunos.curso` como texto), será necessário conferir o esquema antes de modificá-lo. A chave estrangeira acima é uma sugestão de estrutura; não há migration versionada que comprove sua existência no banco utilizado anteriormente.

### 8.2 Iniciar a API

```bash
npm run dev
```

Para iniciar sem monitoramento de arquivos:

```bash
npm start
```

O `src/server.js` executa `SELECT 1` no MySQL antes de chamar `app.listen()`. Se a conexão falhar, a API encerra sua execução e não abre a porta HTTP. Se a conexão funcionar, o endereço padrão é `http://localhost:3000`.

> A consulta `SELECT 1` verifica a conectividade do banco, **não** a existência das tabelas ou o sucesso das operações CRUD.

## 9. Endpoints da API

URL-base local: `http://localhost:3000`.

| Método | Endpoint | Finalidade | Status de sucesso esperado |
|---|---|---|---|
| `GET` | `/` | Confirmar resposta HTTP da aplicação | `200` |
| `GET` | `/cursos` | Listar cursos | `200` |
| `GET` | `/cursos/:id` | Consultar curso | `200` |
| `POST` | `/cursos` | Criar curso | `201` |
| `PUT` | `/cursos/:id` | Atualizar curso | `200` |
| `DELETE` | `/cursos/:id` | Excluir curso | `204` |
| `GET` | `/alunos` | Listar alunos | `200` |
| `GET` | `/alunos/:id` | Consultar aluno | `200` |
| `POST` | `/alunos` | Criar aluno associado a curso | `201` |
| `PUT` | `/alunos/:id` | Atualizar aluno | `200`* |
| `DELETE` | `/alunos/:id` | Excluir aluno | `204` |

`GET`, `PUT` e `DELETE` por ID contemplam resposta `404` para registros ausentes conforme a implementação dos Controllers, ressalvadas falhas não tratadas. *O `PUT /alunos/:id` apresenta uma incompatibilidade de campos na versão atual.*

## 10. Exemplos de Requisição e Resposta

### Criar um curso

**POST** `http://localhost:3000/cursos` — JSON:

```json
{
  "nome": "Engenharia de Software"
}
```

Exemplo de resposta, **201 Created**:

```json
{
  "id": 1,
  "nome": "Engenharia de Software"
}
```

### Cadastrar um aluno no curso

**POST** `http://localhost:3000/alunos` — JSON:

```json
{
  "nome": "Camila Oliveira",
  "curso_id": 1
}
```

Exemplo de resposta, **201 Created**, desde que o curso exista:

```json
{
  "id": 1,
  "nome": "Camila Oliveira",
  "curso_id": 1
}
```

O identificador do aluno é gerado pelo MySQL, via `AUTO_INCREMENT`; ele **não** precisa ser informado no POST.

### Consultar e excluir

- **GET** `/alunos/1`: devolve o aluno cadastrado, se existir, com status `200`.
- **GET** `/alunos/99999`: se não existir, o Controller devolve `404` e `{ "mensagem": "Aluno não encontrado" }`.
- **DELETE** `/alunos/1`: quando a exclusão funciona, retorna `204 No Content`, sem corpo.

Os IDs mostrados são ilustrativos e dependem dos registros existentes no MySQL.

## 11. Autenticação

Não existe implementação de login, autenticação, JWT, controle de perfis ou autorização nesta versão acadêmica. As rotas não possuem middleware de autenticação.

## 12. Tratamento de Erros

- **Registro inexistente:** os Controllers retornam `404` para buscas, atualizações ou exclusões sem resultado, quando o Repository conclui a operação normalmente.
- **Banco indisponível ao iniciar:** o `server.js` registra a falha de conexão e encerra o processo.
- **Curso inexistente no cadastro de aluno:** `AlunoService.cadastrar()` lança `Error`, mas `AlunoController.store()` verifica `if (!aluno)` após o `await`; a exceção não chega a essa condição. No Express 5, esse erro tende a ser encaminhado ao tratamento de erros padrão, em vez de produzir o `404` pretendido.
- **Atualização de aluno:** o Controller extrai `nome` e `curso` do corpo, enquanto `AlunoRepository.update()` espera `nome` e `curso_id`. A divergência pode causar falha do driver ao receber `undefined` em `curso_id`.
- **Erros de validação e banco:** ainda não há validação sistemática dos dados de entrada, nem um middleware de erros personalizado para todos os casos.

As falhas acima são limitações **identificadas no código**, não correções já implementadas.

## 13. Testes

Os testes da API são realizados manualmente por meio do **Insomnia**, sem depender de uma pasta de coleções versionada no repositório.

### Preparação

1. Confirme que o MySQL está acessível, com as tabelas esperadas.
2. Configure o `.env` e execute `npm run dev`.
3. Crie uma coleção no Insomnia chamada `API Express — Alunos e Cursos`.
4. Defina `http://localhost:3000` como endereço-base das requisições.
5. Para POST/PUT, selecione corpo JSON e informe `Content-Type: application/json`.

### Roteiro recomendado

| Ordem | Requisição | Verificação |
|---|---|---|
| 1 | `GET /` | API responde `200` |
| 2 | `POST /cursos` | Curso criado; guardar `id` retornado |
| 3 | `GET /cursos` | Curso consta da listagem |
| 4 | `POST /alunos` com `curso_id` existente | Aluno criado (`201`) |
| 5 | `GET /alunos` | Aluno consta da listagem |
| 6 | `GET /alunos/:id` | Busca individual funciona |
| 7 | `GET /alunos/99999` | Recurso inexistente retorna `404` |
| 8 | `PUT /cursos/:id` | Curso atualizado (`200`) |
| 9 | `DELETE /alunos/:id` | Aluno removido (`204`) |
| 10 | `DELETE /cursos/:id` | Curso removido (`204`) se não houver restrição de integridade impedindo |

O `PUT /alunos/:id` e o cadastro com `curso_id` inexistente devem ser avaliados considerando os problemas documentados na seção 12. O repositório não inclui testes automatizados nem script `npm test` funcional. A execução real do banco e dos endpoints deve ser validada em um ambiente com MySQL disponível.

## 14. Documentação da API

Este README centraliza a documentação das funcionalidades, rotas, exemplos e procedimentos de teste da versão final do projeto. O código dos endpoints pode ser consultado nos arquivos de `src/routes/` e nos respectivos Controllers.

Não foi implementada interface Swagger, especificação OpenAPI ou documentação automática de API.

## 15. Modelo de Dados

Os Repositories utilizam as seguintes estruturas lógicas:

| Entidade | Campo | Finalidade |
|---|---|---|
| Curso | `id` | Identificador numérico gerado pelo MySQL |
| Curso | `nome` | Nome do curso |
| Aluno | `id` | Identificador numérico gerado pelo MySQL |
| Aluno | `nome` | Nome do aluno |
| Aluno | `curso_id` | Referência ao identificador do curso |

Relacionamento lógico: **um curso pode possuir vários alunos; cada aluno pertence a um curso**.

```text
CURSOS (id, nome)
     1
     │
     └──────── N
              ALUNOS (id, nome, curso_id)
```

A existência de uma **restrição `FOREIGN KEY` efetiva** depende da configuração do banco: o repositório não fornece migrations ou DDL oficial versionado para comprová-la. O exemplo SQL da seção 8 apresenta uma estrutura compatível para um banco novo.

## 16. Regras de Negócio

- O cadastro de aluno exige, pela intenção do código, a referência a um curso já existente.
- O `AlunoService.cadastrar()` consulta o curso com `CursoRepository.findById()` antes da inserção.
- Os Repositories usam SQL parametrizado com `?`, enviando valores separadamente da instrução.
- Os identificadores são gerados pelo banco nos cadastros, e `result.insertId` é utilizado para construir a resposta.
- `result.affectedRows` auxilia a identificar atualizações e exclusões sem registro correspondente.
- Os Controllers definem os códigos HTTP; os Repositories não recebem `req` nem `res`.

**Pontos pendentes:** corrigir o tratamento de curso inexistente e alinhar `curso_id` entre Controller e Repository na atualização do aluno. Não existem validações completas de tipos e campos obrigatórios no backend.

## 17. Extras — Programação Web 2

Este projeto consolida os assuntos trabalhados nas atividades:

- **18/08/2026:** introdução ao MySQL 8.4 com Docker Compose e volume persistente, mantendo inicialmente o CRUD em memória.
- **21/08/2026:** configuração do `mysql2`, pool de conexões, `.env` e teste de conexão antes de iniciar o servidor HTTP.
- **25/08/2026:** organização do CRUD de alunos em Routes, Controllers e Repositories com persistência SQL.
- **25/08/2026 — atividade extra:** CRUD de cursos, campo `curso_id` e Service com verificação de curso no cadastro de aluno.

Conceitos revisados: API REST, métodos HTTP, códigos de status, ES Modules, operações assíncronas, parametrização SQL, persistência relacional, relações entre entidades e separação de responsabilidades.

## 18. Versionamento e Organização das Branches

As atividades foram desenvolvidas e preservadas em branches com referência às datas das aulas:

| Branch | Conteúdo principal |
|---|---|
| `branch_20260818` | Docker Compose e introdução ao MySQL |
| `branch_20260821` | Conexão da API com MySQL por meio de `mysql2` |
| `branch_20260825` | CRUD de alunos em arquitetura em camadas |
| `branch_20260825_extra` | CRUD de cursos e regra de negócio em Service |
| `master` | **Versão final consolidada e documentada neste README** |

A `master` é a referência para execução e avaliação do projeto completo. O histórico das atividades pode ser consultado nas demais branches, enquanto este README descreve a **versão final**, sem repetir a documentação por aula.

## 19. Autor

Repositório acadêmico: [Bentim-Luccas](https://github.com/Bentim-Luccas/express-bd-progweb2).

Desenvolvido no contexto da unidade curricular Programação Web 2 do Senac RJ, a partir das atividades e orientações da disciplina.

## 20. Licença e Uso Acadêmico

O arquivo `package.json` declara a licença `ISC`. Esta aplicação foi elaborada para fins de estudo e demonstração de conceitos de desenvolvimento web e acesso a dados.

Os exemplos de credenciais são restritos ao ambiente didático; para ambientes reais, são necessários cuidados adicionais com segurança, validação, tratamento de erros, configuração do banco e gestão de segredos.
