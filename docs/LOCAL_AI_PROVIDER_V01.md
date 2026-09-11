# Local AI Provider v0.1

ORBI TE Studio now has an AI-provider boundary isolated from its deterministic
engineering core.

## Design rule

```
AI interprets and explains.
Deterministic engines calculate and decide.
A professional approves.
```

The AI provider cannot replace:
- Calculation Engine;
- Compliance Engine;
- Evidence Engine;
- professional approval;
- SEC declaration.

## Providers

### mock

Default provider. It is deterministic and requires no model or network.

```
ORBI_AI_PROVIDER=mock
```

### qwen-local

Local Qwen through Ollama:

```
ORBI_AI_PROVIDER=qwen-local
ORBI_QWEN_BASE_URL=http://127.0.0.1:11434
ORBI_QWEN_MODEL=qwen3:8b
```

The provider uses the local Ollama chat endpoint with streaming disabled.

## API

```
GET  /api/ai/health
POST /api/ai/chat
```

The TE Assistant service always prepends an ORBI-controlled system instruction.
Client history cannot inject a system-role message.

The assistant is explicitly instructed to:
- mark missing data as pending;
- never invent measurements or conductor/protection values;
- never claim RIC/RGR compliance by itself;
- never claim SEC approval;
- explain deterministic ORBI results without altering them.

## Vision boundary

A separate observation-only `VisionProvider` interface exists for future
tablero/plan/photo analysis.

The first Ollama implementation uses a local multimodal Qwen model and converts
any unsupported visual status into `PENDING`. Vision observations carry the
evidence id and confidence so they can never silently become verified
engineering values.

Recommended initial visual model for a 16 GB machine:

```
qwen2.5vl:3b
```

The text and visual models are independent and should be loaded on demand rather
than assuming both remain resident in memory.

## No API dependency

With Ollama and the required local models installed, this architecture does not
require a paid external AI API. The rest of TE1/TE4 generation continues to work
without the AI provider because the deterministic core remains independent.


## Verified-evidence vision flow

The local vision endpoint is opt-in and disabled by default:

```
ORBI_VISION_PROVIDER=qwen-vision-local
ORBI_QWEN_VISION_MODEL=qwen2.5vl:3b
```

Endpoints:

```
GET  /api/ai/vision/health
POST /api/ai/vision/analyze
```

Vision analysis cannot receive arbitrary unverified image bytes directly. The
request must reference an active server verification receipt. ORBI checks:

1. receipt exists and is not expired;
2. receipt belongs to the project;
3. evidence id matches;
4. verified SHA-256 receipt is valid;
5. MIME is JPEG, PNG or WEBP;
6. verified bytes are still present in the temporary server buffer.

Only then are the already-verified bytes sent to the local visual model.

The visual model returns proposals/observations only. Unsupported model statuses
are downgraded to `PENDING`; the visual provider has no direct write path into
the TE1/TE4 draft.
