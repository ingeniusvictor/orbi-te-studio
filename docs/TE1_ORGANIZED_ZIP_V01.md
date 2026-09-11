# Organized TE1 ZIP v0.1

ORBI TE Studio now creates a single ZIP package after all server-side generation
and integrity steps succeed.

The ZIP uses a dependency-free store-only ZIP writer. Files are not recompressed,
which avoids changing the bytes that were already hashed in the package index.

## Folder structure

```
TE1_package.zip
├── LEEME_ORBI_TE1.txt
├── 00_Proyecto/
│   └── *_TE1_manifest.json
├── 01_Planos/
│   ├── *_TE1_A2.pdf
│   └── *_TE1_A2.svg
├── 02_Informes/
│   ├── *_TE1_evidence_report.pdf
│   └── *_TE1_informe_fotografico.pdf
├── 03_Evidencia/
│   └── *_TE1_evidence_manifest.json
└── 04_Integridad/
    ├── *_TE1_server_verification_manifest.json
    └── *_TE1_package_index.json
```

The root README explains the folder structure, ORBI review status, package
limitations, and SHA-256 verification commands for Windows PowerShell and
Linux/macOS.

The README itself is included in the package index, so its bytes are covered by
the package integrity inventory.

The ZIP itself is returned as the primary downloadable artifact while individual
files remain available for inspection.

## Integrity model

The package index is generated before the ZIP and contains SHA-256 hashes for all
included technical artifacts except the package index itself. The ZIP then
contains that package index alongside the original artifact bytes.

The ZIP is a convenience container. It does not alter the meaning of the
professional review and does not constitute SEC submission or approval.
