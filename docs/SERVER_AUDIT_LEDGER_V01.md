# Server Audit Ledger v0.1

ORBI TE Studio now maintains an audit ledger on the Node generation service,
separate from browser localStorage.

## Persistence

Default path:

```
.orbi-data/server-audit-ledger.json
```

The path can be overridden with:

```
ORBI_AUDIT_LEDGER_PATH=/custom/path/ledger.json
```

The `.orbi-data/` directory is excluded from Git.

Writes use a temporary file plus rename to reduce the chance of a partially
written JSON ledger.

## Events

The server ledger records:

- `client-approved`: a browser audit approval event independently observed and
  copied by the server;
- `client-approval-invalidated`: a browser invalidation event independently
  observed and copied by the server;
- `package-generated`: an event authored by the server itself during package
  generation.

Every server event contains:
- project id;
- actor;
- occurrence time;
- technical revision SHA-256 fingerprint;
- source browser event hash when applicable;
- previous server event hash;
- server event hash.

The chain is maintained independently per project.

## Generation gate

Before generating a TE1 package, the server:

1. validates the browser audit history;
2. synchronizes approval/invalidation events into the persistent server ledger;
3. validates the server ledger chain;
4. confirms that the current technical revision has a server-observed approval
   that has not later been invalidated;
5. only then continues with evidence verification and package generation.

After generation, the server authors a `package-generated` ledger event.

The project-specific ledger snapshot is exported as:

```
04_Integridad/<projectId>_TE1_server_audit_ledger.json
```

and its exact bytes are included in the package SHA-256 index.

## Trust boundary

This is materially stronger than a browser-only audit trail because a persisted
copy exists outside localStorage and server-authored generation events cannot be
created by the browser UI.

However, v0.1 is still a local application ledger. A person with operating-system
access to the ledger file can replace the complete file. It is not a qualified
digital signature, trusted timestamp service, remote WORM store, or SEC record.

A later phase can move the same event model to an authenticated remote database
or immutable object store.
