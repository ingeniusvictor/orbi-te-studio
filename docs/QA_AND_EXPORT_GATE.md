# Professional QA and Export Gate — v0.1

ORBI TE Studio must not equate "document generated" with "ready to declare".

## States

1. **blocked**
   - one or more technical/compliance blockers exist.

2. **field-data-incomplete**
   - no blocker is known, but mandatory field information is missing.

3. **ready-for-professional-review**
   - field package is complete enough and no blocker remains, but approval is pending.

4. **approved-for-export**
   - explicit professional approval exists.

## Audit

Approval/rejection/reopen events are stored as separate audit events. Generated documents should reference the project revision and approval state.

## Security boundary

Future SEC browser assistance may prepare or populate fields, but:
- SEC credentials are not stored by ORBI TE Studio;
- login remains under the authorized professional's control;
- final review/confirmation is not silently bypassed.
