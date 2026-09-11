# TE1 Photographic Report v0.1

ORBI TE Studio now generates a dedicated human-readable photographic report
after server-side evidence verification and before verification receipts are
consumed.

## Structure

The report contains:

- cover page with project identity, destination, available location,
  georeference, reviewer, evidence count and generation timestamp;
- evidence index;
- one evidence section per verified item;
- semantic TE1 role(s);
- engineering caption derived from the current draft;
- filename, MIME type, verified byte size, verification timestamp and SHA-256;
- inline preview for JPEG and PNG evidence when PDFKit can render it.

PDF and WEBP evidence remain fully traceable by metadata and SHA-256 but are not
rasterized into the report in this version.

## Generated package

A successful package can now contain:

- TE1 A2 SVG;
- TE1 A2 PDF;
- project manifest JSON;
- evidence manifest JSON;
- Project Evidence Report PDF;
- TE1 Photographic Report PDF;
- server verification manifest JSON.

## Safety boundary

The report is generated only from evidence that has already passed the
server-side SHA-256 verification flow. The report does not state that SEC has
approved the project or the evidence.

Evidence bytes are retained only in the in-memory verified-evidence buffer long
enough to generate the reports. The buffers and receipts are consumed after a
successful package generation.
