# TE1 Project Wizard v0.1

The wizard is the future operator-facing flow for creating a TE1 project without touching source code.

## Steps

1. Proyecto
2. Propietario
3. Ubicación
4. Tablero
5. Circuitos
6. Cargas
7. Conductores
8. Mediciones
9. Planos
10. Verificación RIC
11. Revisión profesional
12. Paquete TE1

Steps unlock sequentially. A step may be blocked with actionable issues, for example:

- "Protección posición 5 ilegible."
- "Falta georreferencia."
- "Sección de conductor no verificada."
- "Plano arquitectónico o croquis medido pendiente."

The wizard is intentionally independent from the future web UI so its logic can be tested deterministically.
