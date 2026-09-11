# Evidence Hash Manifest v0.1

ORBI TE Studio now computes a SHA-256 fingerprint for every binary evidence
file stored in the local browser evidence database.

## Behavior

On new evidence:
- validate file type and size;
- compute SHA-256 from the file bytes;
- store the fingerprint together with the evidence record.

For evidence created before hashing was introduced:
- the record is read normally;
- SHA-256 is calculated lazily from the stored Blob;
- the record is backfilled in IndexedDB.

The Evidence Manager displays a shortened fingerprint for human inspection.

## Evidence manifest

After the professional/export gates pass and the browser confirms that all
required links are valid, ORBI builds a JSON evidence manifest containing:

- project id;
- manifest generation timestamp;
- hash algorithm;
- evidence id;
- semantic role in the TE1 workflow;
- filename;
- category;
- MIME type;
- byte size;
- SHA-256;
- evidence creation timestamp.

The generated download set therefore contains:

```
TE1 A2 SVG
TE1 A2 PDF
Project manifest JSON
Evidence manifest JSON
```

## Trust boundary

The SHA-256 manifest proves which local byte content was associated with each
evidence id at manifest generation time. It can detect later byte changes when
the file is re-hashed and compared.

At v0.1, the evidence binaries remain browser-local. The Node generation server
does not independently receive and re-hash them, so ORBI does not yet claim
server-authoritative evidence integrity.

A future evidence upload boundary can send files plus their expected hashes and
make the server verify the digest before generating the final package.
