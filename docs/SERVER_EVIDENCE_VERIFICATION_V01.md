# Server-side evidence verification v0.1

ORBI TE Studio now verifies linked evidence bytes on the local Node server before
allowing TE1 package generation.

## Flow

1. The browser builds the evidence manifest from the currently linked files.
2. Each required evidence file is read from IndexedDB.
3. Files are sent one at a time to:
   `POST /api/te1/evidence/verify`
4. The server decodes the received bytes and recomputes SHA-256 using Node
   `crypto`.
5. A file is accepted only when:
   - evidence id is present;
   - filename is present;
   - MIME type is allowed;
   - decoded file is non-empty;
   - decoded file is <= 20 MB;
   - expected SHA-256 is a valid 64-character hexadecimal digest;
   - server-computed SHA-256 exactly matches the expected digest.
6. For each accepted file, the server creates an ephemeral verification receipt.
7. Receipts expire after 15 minutes.
8. The generation request sends only receipt references, not the binary files
   again.
9. Before generating, the server checks:
   - each receipt exists and is unexpired;
   - project id matches;
   - evidence id matches;
   - SHA-256 matches;
   - receipts cover every evidence id required by the TE1 draft;
   - no unrelated evidence receipt is supplied.

Only after those checks does the server call the existing professional/export
gate and artifact generator.

## Request size

Evidence verification uploads are sequential. This avoids sending all binary
evidence in a single large generation request. The development server accepts up
to 30 MB JSON request bodies, sufficient for one current maximum-size 20 MB file
after base64 overhead.

## Trust boundary

This version provides server-authoritative verification of the bytes received at
verification time. The server does not permanently retain the binary evidence.
Verification receipts are in-memory and expire after 15 minutes, so restarting
the development API invalidates them.

The feature still does not submit anything to SEC and does not handle SEC
credentials.
