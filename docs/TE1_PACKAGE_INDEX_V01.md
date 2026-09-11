# TE1 Package Index v0.1

ORBI TE Studio now generates a package-level JSON index after all server-side
artifacts have been created.

The package index records for each artifact:

- filename;
- MIME type;
- transport encoding;
- exact byte size;
- SHA-256.

The evidence manifest is now sent to the generation API, validated against the
server verification receipts, and returned by the server as part of the
authoritative package. It is no longer appended only by the browser after
generation.

Current package artifacts can include:

1. TE1 A2 SVG;
2. TE1 A2 PDF;
3. project manifest JSON;
4. Project Evidence Report PDF;
5. TE1 Photographic Report PDF;
6. evidence manifest JSON;
7. server verification manifest JSON;
8. package index JSON.

The package index hashes all artifacts except itself to avoid a recursive hash
definition.

The package index does not imply SEC approval. It provides a deterministic
integrity inventory for the ORBI-generated package.
