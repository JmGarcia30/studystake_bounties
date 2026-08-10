export type BountyStatus = "Open" | "In Progress" | "In Review" | "Completed" | "Disputed";

export type BountyCategory =
  | "Soroban Smart Contracts"
  | "Web3 Development"
  | "STEM & Peer Tutoring"
  | "Data & Algorithms";

export interface BountySubmission {
  id: string;
  bountyId: number;
  studentAddress: string;
  studentName: string;
  proofUrl: string;
  notes: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface Bounty {
  id: number;
  title: string;
  category: BountyCategory;
  rewardXlm: string;
  sponsor: string;
  sponsorAddress?: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: BountyStatus;
  createdAt: string;
  submissionsCount?: number;
}
