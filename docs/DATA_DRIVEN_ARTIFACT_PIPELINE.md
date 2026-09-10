# Data-driven TE1 artifact pipeline

ORBI TE Studio now has one deterministic artifact builder for a generic
`TE1Project`.

Input:

```
TE1Project
```

Outputs:

```
A2 SVG
A2 PDF
Project manifest JSON
```

The PDF and SVG are generated from the same project model and the same drawing
renderer. This prevents a web preview and exported PDF from diverging.

## Safety / engineering behavior

Unknown service, meter, grounding or location-sketch topology must not be
invented. Generic project drawings render explicit pending/verification labels
until grounded evidence is available.

Artifact generation does not mean the installation is declaration-ready.
Professional review and the export gate remain separate concerns.

## Browser integration

The current Vite interface renders the SVG preview directly in-browser. PDF
generation uses the Node-side PDF pipeline and is intentionally kept out of the
browser bundle. A later API/service boundary can call the same artifact builder
after the professional gate passes.
