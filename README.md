# AWS Overview — Dice API

A workshop demonstration project showing multiple AWS services working together through a simple dice-rolling API.

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

## Bruno Collection

Open the `_bruno/` directory in Bruno to test the API interactively. Select the "Sandbox" environment.

## Architecture

See [docs/architecture.md](docs/architecture.md) for full details and [docs/c4-container.md](docs/c4-container.md) for the system diagram.
