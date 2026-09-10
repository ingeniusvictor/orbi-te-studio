# Web Wizard v0.1

The React/Vite web application now exposes editable forms for the first operational TE1 intake stages:

- Proyecto
- Propietario
- Ubicación
- Tablero

Each stage validates required information before it may be marked complete.

## Important behavior

The interface does not silently auto-complete missing data.

For example:
- owner step blocks without name and RUT;
- location blocks without address, commune, region and at least one georeference;
- board blocks without board name, positive module count and frontal-photo evidence.

Casa Goyo remains a demonstration/reference project and is not treated as declaration-ready.

## Next web stages

- editable circuits and protection devices;
- installed loads;
- conductor verification;
- measurement entry;
- plan/evidence upload;
- RIC findings screen;
- professional approval;
- downloadable TE1 package.
