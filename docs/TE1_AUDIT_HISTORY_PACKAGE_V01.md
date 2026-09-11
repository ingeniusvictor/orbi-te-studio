# TE1 Audit History Package v0.1

ORBI TE Studio now includes the project audit history inside the generated TE1
package.

## Generation flow

1. The browser validates the local per-project audit hash chain.
2. The browser sends the current audit history to the generation API.
3. The server independently validates:
   - schema version;
   - project id;
   - every event hash;
   - every previousHash link;
   - allowed audit actions;
   - that the current technical revision has a professional approval event;
   - that the current draft still reports professional approval as active.
4. The server appends the current `package-generated` event itself.
5. The resulting history is included as:
   `04_Integridad/<projectId>_TE1_audit_history.json`.
6. The audit-history artifact is included in the package SHA-256 index.
7. The exact server-authored history is returned to the browser and replaces the
   local project history, keeping both copies aligned.

## Current actions

- `approved`
- `approval-invalidated`
- `package-generated`

Reviewer/name or review-note changes after approval create an invalidation event.
Manual withdrawal of approval also creates an invalidation event.

## Trust boundary

The server validates the chain supplied at generation time and authors the
generation event, but historical events before that point still originate from
browser-local storage. This is stronger than a purely local package, but it is
not yet equivalent to a permanent external audit ledger or qualified digital
signature.

No audit event in this feature represents SEC approval or submission.
