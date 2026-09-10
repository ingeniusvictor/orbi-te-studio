# Local Generation Workflow

Once dependencies are installed:

```bash
npm install
npm run check
npm run generate:casa-goyo
```

Expected generated files:

```
artifacts/TE1-REF-002-casa-goyo/
  Casa_Goyo_TE1_A2.svg
  Casa_Goyo_TE1_A2.pdf
```

These generated artifacts are outputs, not authoritative input. Source facts remain in the structured reference/intake models.

The generated sheet is still a development artifact until:
- exact RIC N°18 print geometry is visually certified;
- missing georeference is supplied;
- symbol legend is implemented;
- project/field technical data are complete;
- professional review is approved.
