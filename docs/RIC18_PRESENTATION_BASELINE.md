# RIC N°18 Presentation Baseline — verified 2026-09-10

Authoritative source: Superintendencia de Electricidad y Combustibles (SEC), Pliego Técnico Normativo RIC N°18 — Presentación de Proyectos.

## Verified requirements used by the renderer

- RIC N°18 references NCh 13.Of93 for drawing formats.
- Annex 18.1 lists normal sheet formats:
  - A0: 841 x 1189 mm
  - A1: 594 x 841 mm
  - A2: 420 x 594 mm
  - A3: 297 x 420 mm
  - A4: 210 x 297 mm
- Electrical-project margins from Annex 18.1:
  - A0: left 35 mm, other margins 10 mm
  - A1–A4: left 30 mm, other margins 10 mm
- Section 6.3.4 requires plan title blocks to follow Annex 18.2.
- Section 6.3.5 requires geographic location in the first sheet using UTM or WGS84.
- Section 6.3.6 requires a location sketch in the Annex 18.2 location-sketch box.
- Section 6.3.7 requires destination and sheet numbering / total on all sheets.
- Section 6.3.9 requires a symbol legend describing symbols and technical characteristics.
- Annex 18.2 Figure 18.2.1 shows the lower-band arrangement including:
  - Croquis de ubicación
  - Timbre de inscripción
  - Rotulación
  - an optional area for a load schedule when dimensions permit.
- Annex 18.2 Figure 18.2.2 shows a title block of approximately 110 x 80 mm with:
  - project title
  - commune
  - street
  - sheet number
  - scale
  - date
  - owner acceptance / signature / RUT
  - installer / signature / licence or title / commercial address / telephone.
- Figure 18.2.2 notes title lettering of 4–6 mm and other data of 2–3 mm.

## Implementation note

The renderer now encodes these dimensions and required areas. Exact print verification, typography fit, symbol legend and professional validation remain required before using the label "SEC-ready".
