# Phase 0 — TE1 Foundation

Status: ACTIVE

## 0.1 Repository foundation
- [x] Dedicated repository
- [x] Feature branch
- [x] TypeScript baseline
- [x] Deterministic electrical helper layer
- [x] Conservative validation model
- [x] CI workflow

## 0.2 Reference cases
- [x] TE1-REF-001 — Departamento Víctor
- [x] TE1-REF-002 — Casa Goyo, Osorno
- [x] Structured Casa Goyo source evidence manifest
- [ ] Expected drawing outputs stored as reproducible fixtures
- [x] Initial cross-check engine: board vs project
- [ ] Extend reconciliation to legacy unilinear vs board vs field

## 0.3 RIC knowledge base
- [x] Define rule schema
- [x] Encode initial verified RIC N°10 rules with source metadata
- [ ] Expand authoritative current SEC sources
- [ ] Add version/effective-date handling to rule selection
- [ ] Regression tests per added rule

## 0.4 Drawing engine
- [ ] Panel front-view renderer
- [ ] Unilinear renderer
- [x] Load schedule data model
- [ ] A2/A1/A0 PDF layout renderer
- [x] RIC N°18 title-block data model
- [ ] Location sketch renderer

## 0.5 Field intake
- [x] Structured intake model
- [x] Minimum evidence checklist
- [x] Confidence + missing-data vocabulary
- [x] Casa Goyo field intake fixture
- [x] Photo-quality gate model
- [x] Retake-photo request states
- [ ] Project wizard UI
- [ ] Measurement validation states

## 0.6 Professional QA
- [x] Blocker/warning finding model
- [x] Board reconciliation findings
- [x] Approval audit record
- [x] Export readiness status
- [ ] Reviewer checklist UI

## Exit criteria

Phase 0 closes when the software can ingest structured data for both reference projects and reproducibly generate a validated project model without inventing missing technical data.
