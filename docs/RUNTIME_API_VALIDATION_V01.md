# Runtime API Validation v0.1

ORBI TE Studio no longer relies only on TypeScript casts for JSON received by
the local Node API.

## Evidence verification endpoint

Before evidence hashing, the API now validates:
- request body is an object;
- project id type and size;
- uploads is a non-empty bounded array;
- every upload is an object;
- evidence id, filename, MIME, expected SHA-256 and Base64 are strings;
- individual string lengths are bounded.

The evidence verification service also rejects malformed or non-canonical Base64
before decoding and hashing bytes.

## TE1 generation endpoint

Before any compliance, audit, evidence or document-generation logic executes,
the API validates the runtime shape of:
- TE1 draft;
- nested project, owner, location, board, plan and review objects;
- circuit and measurement arrays;
- enum-like values;
- booleans;
- evidence receipts;
- Evidence Manifest JSON;
- Audit History JSON;
- array and string size limits.

This layer is intentionally structural. Business readiness and engineering
requirements remain in the existing deterministic validation, compliance,
evidence, review and export gates instead of being duplicated here.

## Security boundary

Runtime validation reduces malformed-input and type-confusion risk. It does not
replace authentication, authorization, rate limiting, production-grade request
streaming or schema version migrations. Those remain separate deployment
concerns.
