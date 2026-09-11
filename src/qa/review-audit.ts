export interface ReviewAuditEvent {
  id: string;
  projectId: string;
  action: "approved" | "rejected" | "reopened";
  reviewer: string;
  occurredAt: string;
  notes?: string;
}

export function createReviewAuditEvent(input: ReviewAuditEvent): Readonly<ReviewAuditEvent> {
  if (!input.reviewer.trim()) {
    throw new Error("reviewer is required");
  }
  if (!input.projectId.trim()) {
    throw new Error("projectId is required");
  }
  if (!input.occurredAt.trim()) {
    throw new Error("occurredAt is required");
  }

  return Object.freeze({ ...input });
}
