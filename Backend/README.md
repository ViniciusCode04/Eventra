# JobProcessor

Serviço de processamento de tarefas (jobs) em C# com ASP.NET Core, RabbitMQ e MongoDB.

## Pré-requisitos

- [Docker](https://www.docker.com/) instalado
- [Docker Compose](https://docs.docker.com/compose/) instalado

## Como rodar

Na raiz do projeto (`JobProcessor/`):

```bash
docker-compose up --build
```

Para subir com **4 workers** (recomendado para throughput e testes de carga):

```bash
docker-compose up --build
```

Os serviços `worker`, `worker-2`, `worker-3` e `worker-4` sobem automaticamente.

| Serviço | URL |
|---------|-----|
| **Eventra (frontend)** | http://localhost:5173 |
| API | http://localhost:5000 |
| Swagger (direto na API) | http://localhost:5000/swagger |
| Swagger (via Eventra/nginx) | http://localhost:5173/swagger |
| **Stress test (paralelo)** | http://localhost:5173/stress-test.html |
| RabbitMQ UI | http://localhost:15672 (guest/guest) |

O frontend **Eventra** sobe no serviço `eventra` (nginx + React). Requisições `/api` são proxyadas para a API internamente.

## Endpoints disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/jobs` | Cria um novo job |
| GET | `/api/jobs/{id}` | Retorna status de um job |
| GET | `/api/jobs` | Lista todos os jobs |

Swagger UI: `http://localhost:5000/swagger` ou `http://localhost:5173/swagger`

## Testes de stress

A API aceita **até 1000 conexões simultâneas** (Kestrel configurado via Docker). Use:

1. **Swagger** — abra `http://localhost:5000/swagger` ou `http://localhost:5173/swagger`, clique em *Try it out* e dispare várias vezes `POST /api/jobs` (cada aba/janela do navegador conta como cliente separado).
2. **Stress test em paralelo** — `http://localhost:5173/stress-test.html` dispara dezenas ou centenas de requisições com concorrência configurável (ideal para carga na API e fila RabbitMQ).

Para stress com relatórios (processamento rápido), prefira jobs `GerarRelatorio`. Jobs de e-mail dependem do SMTP e são mais lentos.

## Exemplo de request

**Enviar email** (mock por padrão; SMTP real quando configurado — veja [Configuração SMTP](#configuração-smtp)):

```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"type": "EnviarEmail", "payload": {"to": "user@email.com", "subject": "Teste"}}'
```

**Gerar relatório (mock):**

```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"type": "GerarRelatorio", "payload": {"reportName": "VendasMensais", "format": "pdf"}}'
```

Consultar status:

```bash
curl http://localhost:5000/api/jobs/{job-id}
```

## RabbitMQ Management UI

- URL: http://localhost:15672
- Usuário: `guest`
- Senha: `guest`

## Arquitetura

```
POST /api/jobs → JobService → MongoDB (Pendente) + RabbitMQ (jobId)
RabbitMQ → Worker (RabbitMQConsumer) → JobExecutor → Handler (EnviarEmail / GerarRelatorio) → Concluido/Erro
GET /api/jobs/{id} → consulta status no MongoDB
```

## Decisões técnicas

### Controle de concorrência com `FindOneAndUpdate`

O método `TryAcquireAsync` usa um update atômico no MongoDB: só altera o status de `Pendente` para `EmProcessamento` se o job ainda estiver pendente. Se outro worker já tiver adquirido o job, a operação retorna `null` e o consumidor faz `BasicAck` sem reprocessar. Isso evita locks manuais e condições de corrida quando múltiplos workers consomem a mesma fila.

### Sistema de retry

Em falha de processamento, o worker incrementa `RetryCount`. Enquanto `RetryCount < MaxRetries`, o job volta para `Pendente` e é republicado na fila (com delay de 1 segundo). Após esgotar as tentativas, o status passa para `Erro` com a mensagem registrada. Mensagens são sempre confirmadas com `BasicAck` para evitar loops infinitos de requeue no RabbitMQ.

### Handlers mockados por tipo de job

| Tipo | Handler | Payload esperado |
|------|---------|------------------|
| `EnviarEmail` | `SendEmailJobHandler` | `{ "to", "subject", "body?" }` |
| `GerarRelatorio` | `GenerateReportJobHandler` | `{ "reportName", "format?" }` — gera PDF, CSV ou Excel e permite download em `GET /api/jobs/{id}/report` |

Os handlers validam o payload e lançam exceção em caso de erro — acionando o sistema de retry do worker. O handler de e-mail usa `IEmailSender`: com SMTP desabilitado, apenas registra log `[MOCK]`; com SMTP habilitado, envia e-mail real via MailKit.

## Configuração SMTP

Por padrão, o envio de e-mail é **simulado** (`Smtp:Enabled=false`). Para enviar e-mails reais, configure a seção `Smtp` no `appsettings.json` ou via variáveis de ambiente.

### Provedores gratuitos

| Provedor | Limite gratuito | Host | Porta |
|----------|-----------------|------|-------|
| **Brevo** (Sendinblue) | 300 e-mails/dia | `smtp-relay.brevo.com` | 587 |
| **Gmail** | ~500 e-mails/dia | `smtp.gmail.com` | 587 |

**Brevo:** crie uma conta em [brevo.com](https://www.brevo.com/), vá em *SMTP & API* e gere uma chave SMTP. Use o e-mail da conta como `User` e a chave como `Password`.

**Gmail:** ative a verificação em duas etapas na conta Google e crie uma [Senha de app](https://myaccount.google.com/apppasswords). Use seu e-mail Gmail como `User` e a senha de app como `Password`. O remetente (`FromEmail`) deve ser o mesmo e-mail Gmail.

### Variáveis de ambiente (Docker Compose)

No serviço `worker` do `docker-compose.yml`, descomente e preencha:

```yaml
environment:
  - Smtp__Enabled=true
  - Smtp__Host=smtp-relay.brevo.com
  - Smtp__Port=587
  - Smtp__User=seu-usuario-smtp@exemplo.com
  - Smtp__Password=sua-chave-smtp
  - Smtp__FromEmail=remetente@seudominio.com
  - Smtp__FromName=JobProcessor
  - Smtp__UseSsl=true
```

> **Segurança:** nunca commite senhas reais no repositório. Use variáveis de ambiente ou [User Secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets) no desenvolvimento local.

### Desenvolvimento local (User Secrets)

Na pasta do Worker:

```bash
cd src/JobProcessor.Worker
dotnet user-secrets init
dotnet user-secrets set "Smtp:Enabled" "true"
dotnet user-secrets set "Smtp:Host" "smtp-relay.brevo.com"
dotnet user-secrets set "Smtp:User" "seu-usuario"
dotnet user-secrets set "Smtp:Password" "sua-chave"
dotnet user-secrets set "Smtp:FromEmail" "remetente@exemplo.com"
```

O arquivo `appsettings.Development.json` mantém `Enabled=false` como exemplo seguro.

### Separação API / Worker

A API apenas persiste jobs e publica na fila. O processamento ocorre em `JobProcessor.Worker`, um host separado que pode ser escalado horizontalmente (`docker-compose up --scale worker=N`), permitindo maior throughput sem aumentar a carga da API.

## Testes (xUnit)

```bash
dotnet test
```

Em máquinas lentas ou se o `testhost` travar de execuções anteriores:

```powershell
Get-Process testhost -ErrorAction SilentlyContinue | Stop-Process -Force
$env:VSTEST_CONNECTION_TIMEOUT = "600"
dotnet test --settings tests/JobProcessor.Application.Tests/test.runsettings
```

Os testes rodam em série (`xunit.runner.json`) para evitar crash do test host neste ambiente.

Cobertura dos testes:
- `SendEmailJobHandlerTests` — validação de payload de email
- `GenerateReportJobHandlerTests` — validação de geração de relatório
- `JobExecutorTests` — roteamento por tipo de job

## Estrutura do projeto

```
src/
├── JobProcessor.API/           # Web API (controllers, DTOs)
├── JobProcessor.Application/   # Casos de uso, handlers, JobExecutor
├── JobProcessor.Domain/        # Entidades e enums
├── JobProcessor.Infrastructure/# MongoDB, RabbitMQ, SMTP (MailKit)
└── JobProcessor.Worker/        # Workers em segundo plano
tests/
└── JobProcessor.Application.Tests/  # Testes xUnit dos handlers
```
