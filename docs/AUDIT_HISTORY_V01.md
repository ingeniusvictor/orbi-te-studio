# Project Audit History v0.1

ORBI TE Studio now keeps an append-only local audit history for key professional
review and package-generation events.

Current event types:
- professional approval;
- approval invalidation;
- TE1 package generation.

Each event stores:
- project id;
- action;
- actor;
- timestamp;
- SHA-256 revision fingerprint of the technical draft;
- human-readable details;
- previous event hash;
- event hash.

The event hash is calculated from the complete event payload excluding the hash
itself. The next event stores the previous event hash, creating a per-project
hash chain.

The review UI validates the chain and displays either:
- Cadena válida; or
- Cadena alterada.

This history is append-only through the ORBI application API; no update/delete
function is exposed.

## Trust boundary

The audit history is stored in browser localStorage. The hash chain can detect
accidental or partial local modification, but it is not a substitute for:
- external immutable storage;
- a trusted timestamp authority;
- a digital signature;
- SEC approval or certification.

A user with full control over local browser storage could rewrite the complete
chain. A later server-backed audit ledger can strengthen this trust boundary.
