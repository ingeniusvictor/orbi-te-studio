# ORBI TE Studio — Architecture v0.1

## Goal

Reduce the repetitive work needed to prepare TE1/TE4 projects while preserving professional responsibility, traceability and conservative handling of uncertain field data.

## Modules

1. **Field Intake**
   - photos
   - legacy plans
   - owner/property data
   - measurements
   - equipment nameplates

2. **AI Extraction Layer**
   - detects panel devices
   - reads labels
   - recognizes rooms/plan features
   - emits structured candidates with confidence
   - never decides compliance on its own

3. **Project Data Model**
   - normalized project facts
   - provenance/evidence for critical facts
   - missing-data state

4. **Electrical Engine**
   - deterministic calculations
   - load/current calculations
   - conductor/protection checks
   - voltage-drop calculations (future)

5. **Compliance Engine**
   - versioned RIC/RGR rules
   - each rule cites authoritative source/version
   - PASS / WARNING / BLOCKER / NOT-VERIFIED
   - no silent assumptions

6. **Drawing Engine**
   - front view of panel
   - unilinear
   - load schedule
   - electrical plan
   - earthing/connection details

7. **Document Engine**
   - PDF A-series sheets
   - title blocks
   - image report
   - verification report
   - project manifest

8. **Professional Review Gate**
   - project cannot be marked ready for declaration without explicit authorized-professional approval

9. **SEC Export**
   - prepares field manifest and attachments
   - future browser assistance
   - credentials are not stored by ORBI TE Studio

## Core principle

**AI may interpret. Rules and calculations decide. A professional approves.**
