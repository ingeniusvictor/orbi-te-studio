# Professional Approval Invalidation v0.1

ORBI TE Studio now treats professional approval as revision-sensitive.

If a project has already been approved inside ORBI and a technical field changes,
the approval is automatically invalidated. The same happens when the reviewer
identity or review notes are changed after approval.

The draft records:
- whether approval was invalidated;
- invalidation timestamp;
- human-readable invalidation reason.

A new explicit professional approval clears the invalidation state and creates a
new approval timestamp.

This prevents a saved or reopened project from appearing approved after its
engineering content has changed.

The mechanism is an internal ORBI workflow integrity control. It does not create
or replace SEC approval, authorization, declaration or certification.
