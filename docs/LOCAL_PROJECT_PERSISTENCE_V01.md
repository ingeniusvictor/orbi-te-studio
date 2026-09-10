# Local project persistence v0.1

ORBI TE Studio now persists TE1 work-in-progress projects in browser
`localStorage` under a versioned envelope.

Storage key:

```
orbi.te-studio.projects.v1
```

Stored state:
- project identifier;
- display name;
- last-updated timestamp;
- complete editable TE1 draft;
- complete wizard state.

The start screen lists stored projects and can reopen or delete them.

## Scope and limitations

This is local persistence only. It is intentionally a bridge toward a future
database-backed project repository.

It does **not**:
- synchronize across devices or browsers;
- upload data to a server;
- persist binary evidence files;
- provide encryption at rest beyond whatever protection the browser/OS offers;
- replace project backups.

Only data and evidence references entered in the current draft are stored.

The storage codec is versioned and rejects corrupted or unsupported envelopes
by returning an empty project list rather than attempting to guess/migrate
unknown structures.

## Safety

Professional approval, RIC validation and export gates remain part of the
stored project state and are re-evaluated by the application/server when
needed. Reopening a project does not bypass any generation or compliance gate.
