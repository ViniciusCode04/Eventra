# Eventra — JobProcessor

Serviço de processamento de tarefas em background construído com **C# / ASP.NET Core 8**, **RabbitMQ** e **MongoDB**, desenvolvido como resposta ao desafio técnico de Desenvolvedor Jr C# / ASP.NET da FO360.

---

## Sumário

- [Deploy em produção](#deploy-em-produção)
- [Como rodar](#como-rodar)
- [Endpoints da API](#endpoints-da-api)
- [Arquitetura](#arquitetura)
- [Como o projeto atende ao desafio](#como-o-projeto-atende-ao-desafio)
- [Decisões técnicas](#decisões-técnicas)
- [Configuração SMTP / e-mail](#configuração-smtp--e-mail)
- [Testes](#testes)
- [Estrutura do projeto](#estrutura-do-projeto)

---

## Deploy em produção

O projeto está rodando em produção com cada serviço no provedor mais adequado:

| Serviço | Provedor |
|---------|----------|
| Frontend (React + nginx) | Render |
| API (ASP.NET Core) | Render |
| Worker (background) | Railway |
| MongoDB | MongoDB Atlas |
| RabbitMQ | CloudAMQP |

---

## Como rodar

**Pré-requisitos:** [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/).

> **Nenhuma configuração necessária.** Todas as dependências (MongoDB, RabbitMQ) sobem via Docker com credenciais padrão. O envio de e-mail roda em modo mock sem precisar de SMTP — o projeto funciona completo com apenas os dois comandos abaixo.

Na pasta `Backend/`:

```bash
cd Backend
docker-compose up --build
```

Isso sobe **todos os serviços automaticamente**: MongoDB, RabbitMQ, a API, 4 workers e o frontend Eventra.

| Serviço | URL |
|---------|-----|
| Frontend Eventra (React + nginx) | http://localhost:5173 |
| API REST | http://localhost:5000 |
| Swagger UI | http://localhost:5000/swagger |
| Swagger (via Eventra/nginx) | http://localhost:5173/swagger |
| Stress test interativo | http://localhost:5173/stress-test.html |
| RabbitMQ Management UI | http://localhost:15672 (guest/guest) |

> O frontend Eventra faz proxy de `/api` para a API internamente via nginx — não é necessário configurar CORS manualmente.

### Escalar workers manualmente

```bash
docker-compose up --build --scale worker=8
```

Por padrão já sobem 4 instâncias (`worker`, `worker-2`, `worker-3`, `worker-4`) definidas no `docker-compose.yml`.

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/jobs` | Cria um novo job e publica na fila |
| `GET` | `/api/jobs/{id}` | Consulta o status de um job pelo ID |
| `GET` | `/api/jobs` | Lista todos os jobs |
| `GET` | `/api/jobs/{id}/report` | Faz download do relatório gerado (quando aplicável) |

### Exemplos de uso

**Enviar e-mail** (mock por padrão; real quando SMTP/SendGrid configurado):

```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"type": "EnviarEmail", "payload": {"to": "user@email.com", "subject": "Teste"}}'
```

**Gerar relatório** (gera PDF, CSV ou Excel e disponibiliza para download):

```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"type": "GerarRelatorio", "payload": {"reportName": "VendasMensais", "format": "pdf"}}'
```

**Consultar status:**

```bash
curl http://localhost:5000/api/jobs/{job-id}
```

---

## Arquitetura

```
Cliente HTTP
     │
     ▼
POST /api/jobs
     │
     ├─► MongoDB  ──── persiste job com status "Pendente"
     │
     └─► RabbitMQ ──── publica jobId na fila "job-queue"
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Worker 1 ... N (RabbitMQConsumer — BackgroundService)
                    │
                    ├─► TryAcquireAsync (MongoDB, atômico)
                    │        └─ "Pendente" → "EmProcessamento"
                    │
                    ├─► JobExecutor → IJobHandler (por tipo)
                    │        ├─ SendEmailJobHandler
                    │        └─ GenerateReportJobHandler
                    │
                    └─► MongoDB ──── atualiza status "Concluido" ou "Erro"
                                          (com retry automático se falhar)

GET /api/jobs/{id} → MongoDB → retorna status atual
```

---

## Como o projeto atende ao desafio

### 1. Recebimento de tarefas

> *"A aplicação deverá expor uma API que recebe a criação de novas tarefas para processamento em background."*

`POST /api/jobs` recebe `type` e `payload` (JSON livre), persiste o job no MongoDB via `JobService.CreateJobAsync` e publica o `jobId` na fila RabbitMQ. A entidade `Job` contém:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Id` | `Guid` | Identificador único gerado automaticamente |
| `Type` | `string` | Tipo do job (`"EnviarEmail"`, `"GerarRelatorio"`) |
| `Payload` | `string` (JSON) | Dados necessários para o processamento |
| `Status` | `JobStatus` (enum) | Estado atual do job |
| `RetryCount` / `MaxRetries` | `int` | Controle de tentativas |
| `CreatedAt` / `UpdatedAt` | `DateTime` | Timestamps de auditoria |

### 2. Processamento em segundo plano

> *"As tarefas devem ser processadas por um ou mais workers em background."*
> *"Deve haver um sistema de re-tentativa com limite máximo de tentativas."*
> *"Deve existir controle de concorrência para múltiplos workers sem conflitos."*

`RabbitMQConsumer` herda de `BackgroundService` (hosted service nativo do ASP.NET Core) e escuta a fila continuamente. Múltiplas instâncias podem ser levantadas em paralelo.

**Controle de concorrência — `TryAcquireAsync`:**  
Usa `FindOneAndUpdate` atômico do MongoDB: só altera o status de `Pendente` → `EmProcessamento` se o job ainda estiver pendente. Se outro worker já adquiriu o job, a operação retorna `null` e o consumidor descarta a mensagem com `BasicAck` sem reprocessar — sem locks manuais, sem condições de corrida.

**Sistema de retry:**  
Em falha, o worker incrementa `RetryCount`. Enquanto `RetryCount < MaxRetries` (padrão: 3), o job volta para `Pendente` e é republicado na fila com delay de 1 segundo. Após esgotar as tentativas, o status muda para `Erro` com a mensagem registrada. Mensagens são sempre confirmadas com `BasicAck` para evitar loops infinitos no RabbitMQ.

### 3. Status das tarefas

> *"Manter o status de cada tarefa atualizado. Deve ser possível consultar o status via API."*

O enum `JobStatus` define os quatro estados:

```csharp
public enum JobStatus { Pendente, EmProcessamento, Concluido, Erro }
```

`GET /api/jobs/{id}` consulta o MongoDB e retorna o estado atual, incluindo `errorMessage` quando aplicável.

### 4. Escalabilidade

> *"A aplicação deve ser preparada para suportar grande volume de tarefas, utilizando filas."*

RabbitMQ é o broker de mensagens — fila `job-queue` configurada como `durable: true` e mensagens `Persistent`, garantindo sobrevivência a reinicializações. O `BasicQos(prefetchCount: 1)` distribui mensagens entre workers de forma equilibrada. A API é separada dos workers, permitindo escalar cada camada de forma independente:

```bash
# Subir com mais workers em tempo de execução:
docker-compose up --scale worker=10
```

A API suporta até 1000 conexões simultâneas (Kestrel configurado no `docker-compose.yml`).

### 5. Deployment

> *"Disponibilizar um Dockerfile para containerizar o serviço."*

O projeto possui dois Dockerfiles separados:

- `Dockerfile.api` — imagem da Web API
- `Dockerfile.worker` — imagem dos workers de background

O `docker-compose.yml` orquestra todos os serviços (MongoDB, RabbitMQ, API, 4 workers, frontend) com healthchecks e dependências configuradas, garantindo que os serviços só iniciem quando suas dependências estiverem prontas.

---

## Decisões técnicas

### Arquitetura em camadas (Clean Architecture)

O projeto é dividido em 4 projetos C# seguindo separação de responsabilidades:

| Projeto | Responsabilidade |
|---------|-----------------|
| `JobProcessor.Domain` | Entidades (`Job`) e enums (`JobStatus`) — sem dependências externas |
| `JobProcessor.Application` | Casos de uso (`JobService`), handlers, `JobExecutor`, interfaces |
| `JobProcessor.Infrastructure` | MongoDB, RabbitMQ, SMTP/SendGrid — implementações concretas |
| `JobProcessor.API` | Controllers, DTOs, configuração do host |

### Roteamento de handlers por tipo

`JobExecutor` resolve o handler correto em tempo de execução via `IEnumerable<IJobHandler>`, sem switch/case:

```csharp
var handler = _handlers.FirstOrDefault(h =>
    string.Equals(h.JobType, job.Type, StringComparison.OrdinalIgnoreCase));
```

Adicionar um novo tipo de job exige apenas criar uma classe que implemente `IJobHandler` e registrá-la no DI — sem alterar código existente (Open/Closed Principle).

### Banco de dados NoSQL — MongoDB

MongoDB armazena os jobs com `GuidSerializer` configurado para o formato `Standard` (UUID). O índice atômico via `FindOneAndUpdate` elimina a necessidade de locks distribuídos externos.

---

## Configuração SMTP / e-mail

Por padrão, o envio de e-mail é **simulado** (`Smtp:Enabled=false` / `SendGrid:ApiKey` ausente). Para enviar e-mails reais, há dois caminhos:

### Opção 1 — SendGrid (recomendado)

Defina no `env` ou `docker-compose.yml` do worker:

```env
SENDGRID_API_KEY=sua-chave-sendgrid
SENDGRID_FROM_EMAIL=remetente@seudominio.com
```

### Opção 2 — SMTP (Gmail, Brevo, etc.)

| Provedor | Host | Porta |
|----------|------|-------|
| **Brevo** | `smtp-relay.brevo.com` | 587 |
| **Gmail** | `smtp.gmail.com` | 587 |

```yaml
# No docker-compose.yml, seção environment do worker:
- Smtp__Enabled=true
- Smtp__Host=smtp-relay.brevo.com
- Smtp__Port=587
- Smtp__User=seu-usuario@exemplo.com
- Smtp__Password=sua-chave-smtp
- Smtp__FromEmail=remetente@seudominio.com
- Smtp__FromName=Eventra
- Smtp__UseSsl=true
```

> **Segurança:** nunca commite senhas reais. Use o arquivo `env` (já no `.gitignore`) ou [User Secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets) no desenvolvimento local. Veja `env.example` para referência.

---

## Testes

```bash
dotnet test
```

Cobertura atual (xUnit):

- `SendEmailJobHandlerTests` — validação de payload e comportamento do handler de e-mail
- `GenerateReportJobHandlerTests` — validação de geração de relatório (PDF, CSV, Excel)
- `JobExecutorTests` — roteamento correto por tipo de job

Em ambientes lentos ou com conflito de `testhost`:

```powershell
Get-Process testhost -ErrorAction SilentlyContinue | Stop-Process -Force
$env:VSTEST_CONNECTION_TIMEOUT = "600"
dotnet test --settings tests/JobProcessor.Application.Tests/test.runsettings
```

---

## Estrutura do projeto

```
Backend/
├── docker-compose.yml          # Orquestração completa (MongoDB, RabbitMQ, API, workers, frontend)
├── Dockerfile.api              # Imagem da Web API
├── Dockerfile.worker           # Imagem dos workers
├── env.example                 # Variáveis de ambiente de referência
├── rabbitmq.conf               # Configuração do RabbitMQ
├── render.yaml                 # Deploy no Render.com
└── src/
    ├── JobProcessor.API/           # Web API — controllers, DTOs, Program.cs
    ├── JobProcessor.Application/   # Casos de uso, handlers, JobExecutor, interfaces
    ├── JobProcessor.Domain/        # Entidades (Job) e enums (JobStatus)
    └── JobProcessor.Infrastructure/# MongoDB, RabbitMQ, SMTP/SendGrid
tests/
└── JobProcessor.Application.Tests/ # Testes xUnit
```
