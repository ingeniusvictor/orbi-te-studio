# ORBI TE Studio - Local AI Setup v0.1

ORBI TE Studio can run its assistant and visual-observation layer without a paid
external AI API.

## Architecture

```
ORBI deterministic core
├── calculations
├── RIC/RGR compliance
├── evidence and audit
├── rendering
└── professional approval

Local AI layer
├── text provider: qwen-local
└── vision provider: qwen-vision-local
```

AI is advisory only. It cannot approve a project, alter deterministic rule
results, or silently write visual observations into technical fields.

## Text model

Recommended starting configuration for a 16 GB RAM workstation:

```
ORBI_AI_PROVIDER=qwen-local
ORBI_QWEN_BASE_URL=http://127.0.0.1:11434
ORBI_QWEN_MODEL=qwen3:1.7b
```

The repository defaults to `mock` so the application and test suite do not
require Ollama. `qwen3:1.7b` is the initial ORBI workstation profile; larger
Qwen models remain selectable through `ORBI_QWEN_MODEL` after local validation.

## Vision model

Vision is disabled by default.

Enable it only when a compatible local multimodal Qwen model is installed:

```
ORBI_VISION_PROVIDER=qwen-vision-local
ORBI_QWEN_VISION_MODEL=qwen2.5vl:3b
```

The model name is configurable because local Ollama model tags can change.

## Ollama

After installing Ollama locally, pull the selected models using your normal
Ollama workflow, then start Ollama on localhost.

The application expects the default local endpoint:

```
http://127.0.0.1:11434
```

No SEC credentials, project owner identity, or external API key is required by
the local provider.

## Diagnostic

Run:

```
npm run ai:doctor
```

The command checks:
- selected text provider;
- selected text model;
- text readiness;
- selected visual provider;
- selected visual model;
- vision readiness.

A non-ready configured provider returns a non-zero exit status.

## Runtime endpoints

```
GET  /api/ai/health
POST /api/ai/chat

GET  /api/ai/vision/health
POST /api/ai/vision/analyze
```

The visual endpoint never accepts arbitrary unverified image bytes directly.
Evidence must first pass the existing ORBI SHA-256 verification flow and be
referenced through an active verification receipt.

## Resource policy

Text and vision inference share a local exclusive resource gate so that a
16 GB-class workstation is not asked to run multiple large local inference
jobs concurrently.

The vision model is configured with short keep-alive behavior so it can be
released instead of assuming text and vision models remain resident together.

## Manual proposal acceptance

Visual output is normalized to observation-only records.

Only allowlisted, medium/high-confidence `OBSERVED` board fields can become
proposals. The UI shows `Aplicar propuesta`; no proposal is written
automatically.

After acceptance, the regular TE1 draft-change path runs. If a professional
approval already existed, ORBI invalidates it and requires a new review.

## Production boundary

This v0.1 local integration is intended for a trusted local workstation. Future
production deployment still needs authentication, authorization, deployment
hardening, and a formal model/version validation matrix.
