# Evidence Manager v0.1

ORBI TE Studio now supports real local evidence files for each TE1 project.

## Storage model

Project form/wizard state:
- browser localStorage;
- versioned project envelope.

Binary evidence:
- browser IndexedDB;
- database: `orbi-te-studio-evidence`;
- object store: `evidence`;
- indexed by projectId.

This separation avoids putting binary files into localStorage.

## Supported evidence

- PDF
- JPG/JPEG
- PNG
- WEBP

Current local limit: 20 MB per file.

Evidence categories:
- board front;
- board internal;
- board legend;
- location sketch;
- architectural plan;
- legacy plan;
- measurement;
- service/meter;
- grounding;
- general.

The evidence manager can add, list, reopen/download and delete binary evidence.

Deleting a locally saved project also attempts to delete its locally stored binary
evidence.

## Current boundary

The files are real and persistent in the current browser, but they are not yet
automatically linked into individual wizard fields. Field-level evidence linking
is the next layer.

No evidence is uploaded to SEC or to a remote ORBI service in this version.
