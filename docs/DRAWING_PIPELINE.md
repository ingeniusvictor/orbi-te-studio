# Drawing Pipeline — v0.1

The visual documents must be generated from the structured project model rather than directly from free-form AI output.

## Flow

```
TE1Project
  -> UnilinearModel
  -> LoadScheduleRows
  -> DrawingSheet / TitleBlock
  -> vector renderer
  -> A-series PDF
```

## Current state

Implemented:
- unilinear data model builder;
- load schedule row builder;
- A-series sheet/title-block model.

Pending:
- vector/SVG renderer;
- exact A2/A1/A0 dimensions and margins;
- RIC N°18 title-block geometry;
- panel front-view renderer;
- electrical floor-plan renderer;
- PDF packaging.

## Principle

A rendered sheet may improve typography and layout, but it must not introduce a protection, conductor, load, measurement, coordinate or professional datum that does not exist in the structured project state.
