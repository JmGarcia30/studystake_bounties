import type { Bounty, BountySubmission } from "../types/bounty";

const SUBMISSIONS_STORAGE_KEY = "studystake_bounty_submissions";

const INITIAL_BOUNTIES: Bounty[] = [
  {
    id: 1,
    title: "Rust Soroban Contract Escrow Logic Bugfix",
    category: "Soroban Smart Contracts",
    rewardXlm: "5.0",
    sponsor: "StudyStake Labs",
    sponsorAddress: "GC2F...9X2A",
    description: "Review soroban contract event emissions and optimize storage map gas consumption for peer payouts.",
    difficulty: "Intermediate",
    status: "Open",
    createdAt: new Date().toISOString(),
    submissionsCount: 1,
  },
  {
    id: 2,
    title: "Web3 Wallet Kit Connection React Hook Refactor",
    category: "Web3 Development",
    rewardXlm: "3.5",
    sponsor: "Stellar Dev Guild",
    sponsorAddress: "GBUF...VJBF",
    description: "Refactor wallet reconnect state management using custom React 19 hooks and optimistic status indicators.",
    difficulty: "Beginner",
    status: "Open",
    createdAt: new Date().toISOString(),
    submissionsCount: 0,
  },
  {
    id: 3,
    title: "Binary Search Tree Rebalancing Peer Review",
    category: "STEM & Peer Tutoring",
    rewardXlm: "1.5",
    sponsor: "CS Tutoring Circle",
    sponsorAddress: "GA88...L42X",
    description: "Provide detailed feedback on BST rebalancing algorithms and Big-O memory bounds for tutoring students.",
    difficulty: "Beginner",
    status: "Open",
    createdAt: new Date().toISOString(),
    submissionsCount: 2,
  },
  {
    id: 4,
    title: "Soroban Ledger Key Expiration & Storage Rental Optimization",
    category: "Soroban Smart Contracts",
    rewardXlm: "8.0",
    sponsor: "Stellar Horizon Labs",
    sponsorAddress: "GD77...Q88K",
    description: "Implement instance storage TTL extension helpers for long-running bounty escrow contracts on Stellar Testnet.",
    difficulty: "Advanced",
    status: "Open",
    createdAt: new Date().toISOString(),
    submissionsCount: 0,
  },
];

export async function fetchBounties(category: string = "All", query: string = ""): Promise<Bounty[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return INITIAL_BOUNTIES.filter((b) => {
    const matchesCat = category === "All" || b.category === category;
    const matchesQuery =
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.description.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });
}

export async function fetchBountyById(id: number): Promise<Bounty | null> {
  const bounties = await fetchBounties();
  return bounties.find((b) => b.id === id) || null;
}

export async function submitBountyProof(
  bountyId: number,
  studentAddress: string,
  studentName: string,
  proofUrl: string,
  notes: string
): Promise<BountySubmission> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newSubmission: BountySubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    bountyId,
    studentAddress,
    studentName,
    proofUrl,
    notes,
    submittedAt: new Date().toISOString(),
    status: "Pending",
  };

  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY) || "[]";
    const existing: BountySubmission[] = JSON.parse(raw);
    existing.unshift(newSubmission);
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Failed to save submission locally", err);
  }

  return newSubmission;
}

export async function fetchStudentSubmissions(studentAddress: string): Promise<BountySubmission[]> {
  if (!studentAddress) return [];
  await new Promise((resolve) => setTimeout(resolve, 150));
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY) || "[]";
    const existing: BountySubmission[] = JSON.parse(raw);
    return existing.filter((s) => s.studentAddress === studentAddress);
  } catch {
    return [];
  }
}
