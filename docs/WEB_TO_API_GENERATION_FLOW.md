# Web → API TE1 package generation flow

The export step in ORBI TE Studio now calls the local generation API.

Development topology:

```
Vite web app :5173
      |
      | POST /api/te1/generate
      v
Vite proxy
      |
      v
ORBI TE API :8787
      |
      v
professional/export gate
      |
      v
SVG + PDF + manifest
```

Start the API and web app in separate terminals:

```bash
npm run serve:api
npm run dev
```

The browser requests generation only after the local UI export summary reports
the project as approved for preparation. The server independently repeats the
gate and remains authoritative.

On success, the browser exposes the returned SVG, PDF and manifest as explicit
download actions.

On failure, no artifact is presented as generated.

This flow does not log in to, upload to, or submit anything to SEC.
