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
- [x] Initial deterministic vector example
- [x] Initial cross-check engine: board vs project
- [ ] Extend reconciliation to legacy unilinear vs board vs field

## 0.3 RIC knowledge base
- [x] Define rule schema
- [x] Encode initial verified RIC N°10 rules with source metadata
- [x] RIC N°18 presentation baseline verified against current SEC publication
- [ ] Expand remaining authoritative current SEC sources
- [ ] Add version/effective-date handling to rule selection
- [x] Initial RIC N°18 presentation regression tests
- [ ] Regression tests per additional rule

## 0.4 Drawing engine
- [ ] Panel front-view renderer
- [x] Unilinear data model
- [x] Unilinear SVG renderer v0.1
- [x] Load schedule data model
- [x] Load schedule SVG renderer v0.1
- [x] A0/A1/A2 normalized sheet geometry
- [x] A2 SVG composition
- [x] RIC-style title-block data model
- [x] RIC-style title-block SVG renderer v0.1
- [x] Annex 18.1 margins and Annex 18.2 baseline geometry encoded
- [ ] Exact RIC N°18 print/layout visual certification
- [ ] Location sketch renderer
- [ ] Electrical floor-plan renderer
- [x] Vector SVG -> PDF export implementation
- [x] Casa Goyo SVG/PDF generation script

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
- [x] RIC N°18 first-sheet presentation blockers

## 0.7 SEC preparation
- [x] TE1 project manifest v0.1
- [x] Explicit PENDING attachments and powers
- [ ] Map manifest fields to current E-Declarador schema
- [ ] Attachment packaging
- [ ] Browser-assistance boundary specification

## Exit criteria

Phase 0 closes when the software can ingest structured data for both reference projects and reproducibly generate a validated project model and vector drawing artifacts without inventing missing technical data.
