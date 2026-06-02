# Eventra — Job Processor

> Serviço distribuído de processamento de tarefas em background — desenvolvido como resposta ao desafio técnico de **Desenvolvedor Jr C# / ASP.NET** da **F360**.

![Stack](https://img.shields.io/badge/.NET-8-512BD4?style=flat-square&logo=dotnet)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-CloudAMQP-FF6600?style=flat-square&logo=rabbitmq)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)

---

## 🚀 Deploy em produção

O projeto está rodando ao vivo com cada serviço no provedor mais adequado:

| Serviço | Provedor | URL / Host |
|---------|----------|------------|
| Frontend React | Render | https://eventra-frontend-259f.onrender.com |
| API ASP.NET Core | Render | https://eventra-api-91fb.onrender.com |
| Worker background | Railway | — |
| MongoDB | Atlas | `cluster0.ovzc8s1.mongodb.net` — database: `jobprocessor` — collection: `jobs` |
| RabbitMQ | CloudAMQP | `jaragua.lmq.cloudamqp.com` — vhost: `hnerpjna` — fila: `job-queue` |

---

## ⚡ Como rodar localmente

**Pré-requisitos:** [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/).

> Nenhuma configuração necessária. MongoDB, RabbitMQ, API, 4 workers e o frontend sobem com um único comando. O envio de e-mail roda em modo **mock** por padrão — o projeto funciona completo sem configurar SMTP.

```bash
cd Backend
docker-compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend Eventra | http://localhost:5173 |
| API REST | http://localhost:5000 |
| Swagger UI | http://localhost:5000/swagger |
| Stress test interativo | http://localhost:5173/stress-test.html |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |

### Escalar workers

```bash
docker-compose up --build --scale worker=8
```

---

## 📡 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/jobs` | Cria um job e publica na fila |
| `GET` | `/api/jobs` | Lista todos os jobs |
| `GET` | `/api/jobs/{id}` | Consulta status de um job |
| `GET` | `/api/jobs/{id}/report` | Download do relatório gerado |

### Exemplos

```bash
# Enviar e-mail
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"type":"EnviarEmail","payload":{"to":"user@email.com","subject":"Teste"}}'

# Gerar relatório (PDF, CSV ou Excel)
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"type":"GerarRelatorio","payload":{"reportName":"VendasMensais","format":"pdf"}}'

# Consultar status
curl http://localhost:5000/api/jobs/{job-id}
```

---

## 🏗️ Arquitetura

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
                    ┌─────────┴──────────┐
                    ▼                    ▼
              Worker 1 ... N  (RabbitMQConsumer — BackgroundService)
                    │
                    ├─► TryAcquireAsync (MongoDB atômico)
                    │        └─ "Pendente" → "EmProcessamento"
                    │
                    ├─► JobExecutor → IJobHandler (roteado por tipo)
                    │        ├─ SendEmailJobHandler  (SMTP / SendGrid)
                    │        └─ GenerateReportJobHandler (PDF / Excel / CSV)
                    │
                    └─► MongoDB ──── "Concluido" ou "Erro" (com retry automático)

GET /api/jobs/{id} → MongoDB → status atual
```

---

## ✅ Como o projeto atende ao desafio

### 1. Recebimento de tarefas

`POST /api/jobs` recebe `type` + `payload` (JSON livre), persiste no MongoDB e publica o `jobId` no RabbitMQ. A entidade `Job` contém:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Id` | `Guid` | Identificador único gerado automaticamente |
| `Type` | `string` | `"EnviarEmail"` ou `"GerarRelatorio"` |
| `Payload` | `string` (JSON) | Dados para o processamento |
| `Status` | `JobStatus` | Estado atual do job |
| `RetryCount` / `MaxRetries` | `int` | Controle de tentativas |
| `CreatedAt` / `UpdatedAt` | `DateTime` | Timestamps de auditoria |

### 2. Processamento em segundo plano

`RabbitMQConsumer` herda de `BackgroundService` e escuta a fila continuamente. Múltiplas instâncias rodam em paralelo.

**Controle de concorrência — `TryAcquireAsync`:**
Usa `FindOneAndUpdate` atômico do MongoDB: só muda status de `Pendente` → `EmProcessamento` se o job ainda estiver pendente. Se outro worker já adquiriu, a operação retorna `null` e a mensagem é descartada com `BasicAck` — sem locks manuais, sem race conditions.

**Sistema de retry:**
Em falha, incrementa `RetryCount`. Enquanto `RetryCount < MaxRetries` (padrão: 3), o job volta para `Pendente` e é republicado na fila com delay de 1 segundo. Após esgotar as tentativas, status muda para `Erro` com mensagem registrada. Mensagens são sempre confirmadas com `BasicAck` para evitar loops infinitos.

### 3. Status das tarefas

```csharp
public enum JobStatus { Pendente, EmProcessamento, Concluido, Erro }
```

`GET /api/jobs/{id}` retorna o estado atual incluindo `errorMessage` quando aplicável.

### 4. Escalabilidade

RabbitMQ com fila `durable: true` e mensagens `Persistent` — sobrevive a reinicializações. `BasicQos(prefetchCount: 1)` distribui mensagens de forma equilibrada entre workers. API e workers são serviços separados, escaláveis de forma independente:

```bash
docker-compose up --scale worker=10
```

### 5. Deployment

Dois Dockerfiles separados (`Dockerfile.api` e `Dockerfile.worker`) com `docker-compose.yml` orquestrando todos os serviços com healthchecks. Deploy em produção com API no Render, worker no Railway, MongoDB no Atlas e RabbitMQ no CloudAMQP.

---

## 🧠 Decisões técnicas

### Clean Architecture

| Projeto | Responsabilidade |
|---------|-----------------|
| `JobProcessor.Domain` | Entidades e enums — sem dependências externas |
| `JobProcessor.Application` | Casos de uso, handlers, `JobExecutor`, interfaces |
| `JobProcessor.Infrastructure` | MongoDB, RabbitMQ, SMTP, SendGrid, relatórios |
| `JobProcessor.API` | Controllers, DTOs, configuração do host |

### Roteamento de handlers por tipo

`JobExecutor` resolve o handler correto sem switch/case:

```csharp
var handler = _handlers.FirstOrDefault(h =>
    string.Equals(h.JobType, job.Type, StringComparison.OrdinalIgnoreCase));
```

Adicionar um novo tipo de job = criar uma classe que implemente `IJobHandler` + registrar no DI. Sem alterar código existente (Open/Closed Principle).

### Geração real de relatórios

O desafio pede a **estrutura** que suporte operações — o Eventra vai além e implementa geração real:

| Formato | Biblioteca | Resultado |
|---------|-----------|-----------|
| PDF | QuestPDF | Relatório estilizado com header Eventra, tabela e paginação |
| Excel | ClosedXML | Planilha formatada com cabeçalho colorido |
| CSV | nativo .NET | UTF-8 com BOM para compatibilidade |

Os arquivos ficam disponíveis via `GET /api/jobs/{id}/report` para download imediato.

### E-mail com fallback em camadas

```
SendGrid:ApiKey configurado? → SendGridEmailSender (API HTTP — funciona em qualquer host)
SMTP configurado?            → SmtpEmailSender (MailKit)
Nenhum?                      → MockEmailSender (log apenas — padrão local)
```

---

## 📧 Configuração de e-mail

### SendGrid (recomendado para produção)

```env
SendGrid__ApiKey=sua-chave
SendGrid__FromEmail=remetente@seudominio.com
SendGrid__FromName=Eventra
```

### SMTP (Gmail, Brevo, etc.)

```yaml
- Smtp__Enabled=true
- Smtp__Host=smtp.gmail.com
- Smtp__Port=587
- Smtp__User=seu@gmail.com
- Smtp__Password=senha-de-app
- Smtp__FromEmail=seu@gmail.com
- Smtp__FromName=Eventra
- Smtp__UseSsl=true
```

> Nunca commite senhas. Use `.env` (já no `.gitignore`) ou User Secrets em desenvolvimento.

---

## 🧪 Testes

```bash
cd Backend
dotnet test
```

Cobertura (xUnit):

- `SendEmailJobHandlerTests` — validação de payload e comportamento do handler de e-mail
- `GenerateReportJobHandlerTests` — geração de PDF, CSV e Excel
- `JobExecutorTests` — roteamento correto por tipo de job

---

## 🖥️ Frontend — Eventra

Dashboard React com identidade visual cyberpunk (azul ciano `#00D4FF` + roxo `#7B2FFF`).

**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + TanStack Query + Recharts

```bash
cd Frontend
npm install
npm run dev    # http://localhost:5173
```

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard com contadores, gráfico e últimos jobs em tempo real |
| `/jobs` | Tabela completa com filtros e modal de criação |
| `/jobs/:id` | Detalhe do job com polling de status |
| `/stress-test.html` | Ferramenta de stress test interativa |

---

## 📁 Estrutura do repositório

```
Eventra/
├── Backend/
│   ├── docker-compose.yml          # MongoDB, RabbitMQ, API, 4 workers, frontend
│   ├── Dockerfile.api              # Imagem da Web API
│   ├── Dockerfile.worker           # Imagem dos workers
│   ├── render.yaml                 # Deploy Render.com
│   ├── env.example                 # Variáveis de referência
│   └── src/
│       ├── JobProcessor.API/
│       ├── JobProcessor.Application/
│       ├── JobProcessor.Domain/
│       └── JobProcessor.Infrastructure/
│   tests/
│   └── JobProcessor.Application.Tests/
└── Frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   └── services/
    └── public/
        └── stress-test.html
```
