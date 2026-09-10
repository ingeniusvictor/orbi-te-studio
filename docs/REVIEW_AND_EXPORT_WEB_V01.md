# Professional Review + Export Web Flow v0.1

The TE1 wizard now includes explicit stages for professional review and package preparation.

## Professional review gate

Approval is disabled until the current implementation can confirm:

- project/owner/location identity;
- board and circuit data;
- loads and verified conductors;
- measurement package with evidence;
- reviewed plan source;
- no blockers or non-verifiable outcomes among implemented RIC rules.

The reviewer must enter a name and explicitly approve. This approval is an ORBI project state only; it does not submit or declare anything to SEC.

## Export gate

The export screen distinguishes between:
- PENDING
- READY TO GENERATE

It does not claim that a document exists merely because enough input is present.

The current web export can provide the project manifest JSON when professional approval is present. PDF generation remains handled by the deterministic drawing/export pipeline.

SEC credentials are not requested, stored or automated by this feature.
