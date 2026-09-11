# Server Verification Manifest v0.1

Successful TE1 generation now includes a server-generated verification manifest.

Generated package:

```
TE1 A2 SVG
TE1 A2 PDF
Project manifest JSON
Evidence manifest JSON
Server verification manifest JSON
```

The server verification manifest records, for each verified evidence item:

- evidence id;
- semantic TE1 role(s);
- filename;
- MIME type;
- verified byte size;
- SHA-256;
- verification timestamp;
- receipt expiry timestamp;
- verifier identity;
- SHA-256 fingerprint of the ephemeral receipt token.

The raw receipt token is never written into the durable manifest.

## Receipt behavior

Verification receipts are:
- bound to project id;
- bound to evidence id;
- bound to SHA-256;
- valid for 15 minutes;
- held only in server memory;
- consumed after successful package generation.

A consumed receipt cannot be replayed to generate another package. A new
generation therefore requires a new byte-level evidence verification cycle.

If artifact generation fails after receipt validation, receipts are not consumed
so the user can correct a transient generation issue within the receipt lifetime.

## Meaning

The server verification manifest documents what byte content the ORBI API
verified immediately before the package was generated. It does not mean SEC
approved the evidence, installation or declaration.

No SEC credentials or submission actions are part of this flow.
