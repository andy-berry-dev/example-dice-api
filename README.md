# AWS Overview — Dice API

A workshop demonstration project showing multiple AWS services working together through a simple dice-rolling API. Built as a teaching tool for engineers new to AWS serverless.

## 🆕 New to AWS?

Start with the **[Beginner's Guide](docs/guide.md)** — it explains every service in plain English, walks through a request end-to-end, and shows how the code connects to infrastructure.

## Quick Start

```bash
# Install dependencies
pnpm install

# Build Lambda packages
pnpm run build

# Run tests
pnpm run test

# Deploy to sandbox
cd infrastructure/sandbox/eu-west-2/dice-api
aws-vault exec sandbox -- terragrunt apply
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/roll` | None | Roll a dice (1-6) |
| GET | `/stats` | None | Get aggregated statistics |
| DELETE | `/reset` | `x-api-key` header | Reset all rolls and stats |

### Try it now

```bash
API_URL="https://ixvk4ixi35.execute-api.eu-west-2.amazonaws.com"

# Roll a dice
curl -X POST "$API_URL/roll"

# Check stats (updates asynchronously — wait 1-2 seconds after rolling)
curl "$API_URL/stats"

# Reset (requires API key from Secrets Manager)
curl -X DELETE "$API_URL/reset" -H "x-api-key: YOUR_API_KEY"
```

### Sandbox URL

```
https://ixvk4ixi35.execute-api.eu-west-2.amazonaws.com
```

### API Key

Retrieve from Secrets Manager:
```bash
aws-vault exec sandbox -- aws secretsmanager get-secret-value \
    --secret-id dice-api-api-key \
    --query SecretString --output text \
    --region eu-west-2
```

## Workshop: Enabling DynamoDB Streams

To toggle from direct SNS publish to DynamoDB Streams:

1. Edit `infrastructure/sandbox/eu-west-2/dice-api/terragrunt.hcl`
2. Set `enable_direct_publish = false` and `enable_stream_processor = true`
3. Apply: `aws-vault exec sandbox -- terragrunt apply`

See [Two Event Paths](docs/guide.md#two-event-paths-workshop-toggle) in the guide for a detailed explanation.

## Bruno Collection

Open the `_bruno/` directory in Bruno to test the API interactively. Select the "Sandbox" environment.

## Architecture

See [docs/architecture.md](docs/architecture.md) for full details and [docs/c4-container.md](docs/c4-container.md) for the system diagram.

## Documentation

| Document | Audience | Content |
|----------|----------|---------|
| [Beginner's Guide](docs/guide.md) | New to AWS | Services explained, glossary, end-to-end walkthrough, deployment steps |
| [Architecture](docs/architecture.md) | All | System overview, data flows, design decisions |
| [C4 Container Diagram](docs/c4-container.md) | All | Mermaid diagram of the system |

## Learning Path

1. Run `pnpm run test` — see what's being tested
2. Read `src/api/roll.ts` — the simplest Lambda (DynamoDB write + SNS publish)
3. Read `src/processors/stats-processor.ts` — consuming SQS events
4. Read `src/utils/update-stats.ts` — DynamoDB update expressions
5. Read `docs/guide.md` — full context on services and wiring
6. Read `infrastructure/modules/dice-api/lambda-roll.tf` — how Terraform creates and wires a Lambda
7. Deploy to your sandbox with `terragrunt apply`
8. Call the API and watch CloudWatch Logs in the AWS Console
9. Toggle the stream on and redeploy — see DynamoDB Streams in action
