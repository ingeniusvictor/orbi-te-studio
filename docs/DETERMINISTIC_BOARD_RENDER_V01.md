# Deterministic Board Render v0.1

ORBI TE Studio can now generate a standalone digital representation of the
distribution board as SVG.

The output is created by the deterministic render engine, not by an image
generation model.

## Flow

```
verified / manually accepted data
        ↓
TE1 draft
        ↓
TE1 domain model
        ↓
PanelFrontModel
        ↓
SVG renderer
        ↓
*_TE1_tablero_frontal.svg
```

The artifact can represent:
- main breaker;
- differential protection;
- branch breakers;
- circuit numbers and labels;
- unused reserve positions.

It does not invent conductor sections, hidden wiring, service topology or
unverified measurements.

## Local vision relationship

The local Qwen vision provider may observe values from a verified image, but it
cannot write them directly into the TE1 draft.

Only medium/high-confidence `OBSERVED` values on an allowlisted set of board
fields can become proposals. Every proposal requires an explicit
`Aplicar propuesta` action by the user.

After manual acceptance, the normal ORBI draft-change path is used, so an
existing professional approval is invalidated if the technical state changed.

This preserves the architecture rule:

```
AI observes and proposes.
The user accepts.
ORBI stores and renders deterministically.
The professional reviews and approves.
```
