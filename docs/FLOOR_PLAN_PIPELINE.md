# Electrical Floor-Plan Pipeline — v0.1

ORBI TE Studio may render an electrical plant only when geometry is grounded in a source plan, measured sketch or equivalent field evidence.

## Allowed flow

```
architectural plan / measured sketch
  -> normalized room geometry
  -> electrical points
  -> circuit association
  -> deterministic renderer
  -> professional review
```

## Prohibited behavior

The software must not invent:
- room dimensions;
- wall positions;
- doors/windows;
- number or location of electrical points;
- circuit routes;
- fixed-load locations.

For Casa Goyo the floor-plan document remains PENDING until an architectural plan or measured field sketch is supplied.
