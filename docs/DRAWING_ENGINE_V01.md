# Drawing Engine v0.1

Implemented deterministic drawing components:

- normalized A0/A1/A2 sheet sizes;
- base SVG sheet renderer;
- title block renderer;
- unilinear renderer;
- load schedule renderer;
- front-view panel model and renderer;
- service/earthing detail renderer;
- location sketch placeholder renderer;
- Casa Goyo full A2 composition;
- SVG artifact export contract.

## Current limitation

The visual geometry is a project-controlled approximation. It is not yet certified as an exact reproduction of the RIC N°18 annex title-block geometry.

Before calling a sheet "SEC-ready", ORBI TE Studio must:
1. verify the exact current RIC N°18 sheet/viñeta requirements;
2. lock dimensions and mandatory fields;
3. add a real PDF export path;
4. verify text fitting and print legibility;
5. run professional review against a real TE1 package.

## Non-invention rule

Renderers consume structured project facts. Unknown technical values remain PENDING / VERIFY and must not be cosmetically replaced with defaults.
