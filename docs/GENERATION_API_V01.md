# TE1 Generation API v0.1

Local endpoint:

```
POST /api/te1/generate
```

Request:

```json
{
  "projectId": "TE1-...",
  "draft": { "...": "TE1FormDraft" }
}
```

The endpoint calls the same deterministic project conversion, export gate and
artifact builder used by ORBI TE Studio.

If the professional/export gate is not closed, HTTP 409 is returned and no PDF
is generated.

On success, the response contains:
- A2 SVG as UTF-8 text;
- A2 PDF as base64;
- project manifest as UTF-8 JSON.

This is a development/local API contract. It does not submit anything to SEC,
does not request SEC credentials, and does not bypass professional approval.

Health endpoint:

```
GET /api/health
```
