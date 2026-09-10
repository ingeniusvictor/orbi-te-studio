# Field-level evidence linking v0.1

ORBI TE Studio now links engineering fields to actual evidence records stored in
the browser evidence database.

Current links:

- board frontal photo → board-front evidence;
- optional board legend → board-legend evidence;
- RIC location sketch → location-sketch evidence;
- plan source → category matching the selected source type;
- each verification measurement → measurement evidence.

The draft keeps both the immutable local evidence id and a filename snapshot for
human-readable presentation.

## Integrity audit

Before professional approval and before package generation, the browser checks
that every required evidence id still exists in IndexedDB and that its category
is compatible with the field.

Deleting a linked file emits an evidence-change event. Active evidence pickers
clear stale links instead of leaving an apparently valid filename behind.

## Persistence migration

Project metadata storage moved from schema v1 to schema v2. Existing v1 drafts
are read and migrated conservatively. Legacy filename-only references do not
become trusted evidence ids; their new ids remain empty until the user links a
real local file.

## Current trust boundary

The local browser can verify that a linked binary file exists. The Node
generation service still receives the structured draft rather than the binary
evidence itself, so server-side cryptographic evidence verification is not yet
claimed. A later upload/hash manifest boundary should make that verification
server-authoritative.

This feature does not upload evidence or credentials to SEC.
