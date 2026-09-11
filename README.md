# ORBI TE Studio

Plataforma para apoyar el diseño, verificación, documentación y preparación de proyectos eléctricos TE1 y TE4 en Chile.

## Principios

- Automatización asistida, con revisión profesional final.
- Motor de cálculo determinístico para decisiones eléctricas.
- Motor normativo versionado para RIC/RGR.
- IA para interpretación de planos, fotografías y antecedentes.
- Trazabilidad: ningún dato crítico debe inferirse silenciosamente.
- Los datos no verificables deben quedar marcados como pendientes de terreno/revisión.

## Alcance inicial

La primera línea de desarrollo es **TE1 residencial**, usando casos de referencia reales para validar:
1. digitalización de tableros;
2. reconstrucción de diagramas unilineales;
3. generación de cuadros de carga;
4. planta eléctrica;
5. generación de láminas PDF;
6. checklist y paquete documental previo a E-Declarador.

TE4 se incorporará en una fase posterior.

## Estado

Inicio de proyecto — Phase 0: Foundation.


## IA local

ORBI TE Studio mantiene la IA separada del núcleo determinístico.

- `mock` es el proveedor predeterminado para desarrollo y pruebas.
- `qwen-local` usa Qwen a través de Ollama en la máquina local.
- La IA interpreta y explica; no calcula, no decide cumplimiento RIC/RGR y no aprueba proyectos.

Configuración inicial recomendada:

```bash
ollama pull qwen3:8b
ollama pull qwen2.5vl:3b
```

Copiar `.env.example` a `.env` y habilitar:

```
ORBI_AI_PROVIDER=qwen-local
ORBI_QWEN_BASE_URL=http://127.0.0.1:11434
ORBI_QWEN_MODEL=qwen3:8b
```

El asistente local está disponible mediante:

```
GET  /api/ai/health
POST /api/ai/chat
```

La visión local es opt-in:

```
ORBI_VISION_PROVIDER=qwen-vision-local
ORBI_QWEN_VISION_MODEL=qwen2.5vl:3b
```

y usa:

```
GET  /api/ai/vision/health
POST /api/ai/vision/analyze
```

Diagnóstico rápido:

```bash
npm run ai:doctor
```

Los proveedores IA v0.1 están restringidos a localhost/loopback.

La capa visual permanece observation-only: cualquier dato visual no legible debe
quedar como `PENDING` y nunca convertirse silenciosamente en un valor técnico
verificado. Solo campos de tablero permitidos, observados y con confianza
media/alta pueden transformarse en propuestas, y siempre requieren aceptación
manual.

Después de aceptar una propuesta, ORBI usa el flujo normal del draft, registra el
evento de auditoría y, si corresponde, invalida la aprobación profesional previa.

El tablero final no se genera con IA de imágenes: ORBI produce un SVG técnico
determinista desde los datos registrados y lo incorpora al paquete TE1 como
`*_TE1_tablero_frontal.svg`.
