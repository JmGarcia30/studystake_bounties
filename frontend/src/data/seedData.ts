// MOCK DATA ONLY — wallet addresses are synthetic Stellar-style public addresses.
// MOCK DATA ONLY — transaction hashes are synthetic and are not real Stellar transactions.

import type { EcosystemInteractionType } from "../types/walletEcosystem";
import type { UserRole } from "../types/user";

export const DEMO_SEED_KEY = "wallet_ecosystem_v1";

export interface DemoRawUser {
  id: string;
  name: string;
  username: string;
  walletAddress: string;
  role: UserRole;
  bio: string;
  createdAt: string;
  verifiedAt: string;
  initialBalance: number;
}

export interface DemoRawBounty {
  id: number;
  title: string;
  category: "Frontend" | "Backend" | "Design" | "Smart Contracts" | "Research" | "Data Science";
  rewardXlm: number;
  creatorWalletAddress: string;
  creatorDisplayName: string;
  contributorWalletAddress?: string;
  contributorDisplayName?: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "Open" | "In Progress" | "Completed";
  contractEscrowId?: number;
  fundingTransactionHash?: string;
  createdAt: string;
}

export interface DemoRawInteraction {
  walletAddress: string;
  interactionType: EcosystemInteractionType;
  transactionHash?: string;
  contractEscrowId?: number;
  amount?: number;
  bountyId?: string;
  description: string;
  walletProvider?: "Freighter" | "Albedo" | "xBull" | "Hana";
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// 1. Exactly 15 Demo Users (10 Students, 5 Sponsors)
// MOCK DATA ONLY — wallet addresses are synthetic Stellar-style public addresses.
export const DEMO_USERS: DemoRawUser[] = [
  // Students (10)
  {
    id: "user-student-01",
    name: "Alex Rivera",
    username: "alexrivera",
    walletAddress: "GCF82K9X3P1111111111111111111111111111111111111111111111",
    role: "student",
    bio: "Computer Science student focused on frontend development and UI engineering.",
    createdAt: "2026-07-15T09:00:00Z",
    verifiedAt: "2026-07-15T09:05:00Z",
    initialBalance: 74.3821,
  },
  {
    id: "user-student-02",
    name: "Mia Santos",
    username: "miasantos",
    walletAddress: "GDB91P4W8Q2222222222222222222222222222222222222222222222",
    role: "student",
    bio: "Information technology student interested in data visualization and UX.",
    createdAt: "2026-07-16T10:30:00Z",
    verifiedAt: "2026-07-16T10:35:00Z",
    initialBalance: 381.2247,
  },
  {
    id: "user-student-03",
    name: "Ethan Cruz",
    username: "ethancruz",
    walletAddress: "GEA72M5K9R3333333333333333333333333333333333333333333333",
    role: "student",
    bio: "Software engineering senior building distributed backend systems and TypeScript microservices.",
    createdAt: "2026-07-17T11:15:00Z",
    verifiedAt: "2026-07-17T11:20:00Z",
    initialBalance: 48.9102,
  },
  {
    id: "user-student-04",
    name: "Sophia Reyes",
    username: "sophiareyes",
    walletAddress: "GHS54K3L2M4444444444444444444444444444444444444444444444",
    role: "student",
    bio: "Data Science scholar researching AI models, data pipelines, and python analysis.",
    createdAt: "2026-07-18T14:20:00Z",
    verifiedAt: "2026-07-18T14:25:00Z",
    initialBalance: 95.4501,
  },
  {
    id: "user-student-05",
    name: "Daniel Garcia",
    username: "danielgarcia",
    walletAddress: "GJK88M1N9P5555555555555555555555555555555555555555555555",
    role: "student",
    bio: "Web3 enthusiast exploring Stellar Soroban smart contracts and decentralized finance.",
    createdAt: "2026-07-19T08:45:00Z",
    verifiedAt: "2026-07-19T08:50:00Z",
    initialBalance: 120.7389,
  },
  {
    id: "user-student-06",
    name: "Chloe Mendoza",
    username: "chloemendoza",
    walletAddress: "GLM12P7Q4R6666666666666666666666666666666666666666666666",
    role: "student",
    bio: "Mobile app developer specializing in React Native and cross-platform UI workflows.",
    createdAt: "2026-07-20T13:10:00Z",
    verifiedAt: "2026-07-20T13:15:00Z",
    initialBalance: 32.1904,
  },
  {
    id: "user-student-07",
    name: "Noah Aquino",
    username: "noahaquino",
    walletAddress: "GNP34R9S1T7777777777777777777777777777777777777777777777",
    role: "student",
    bio: "Cybersecurity major focused on web security, smart contract auditing, and protocol safety.",
    createdAt: "2026-07-21T16:00:00Z",
    verifiedAt: "2026-07-21T16:05:00Z",
    initialBalance: 71.0543,
  },
  {
    id: "user-student-08",
    name: "Isabella Flores",
    username: "isabellaflores",
    walletAddress: "GQR56S3T8U8888888888888888888888888888888888888888888888",
    role: "student",
    bio: "Product designer and Figma enthusiast crafting intuitive interfaces for Web3 platforms.",
    createdAt: "2026-07-22T09:30:00Z",
    verifiedAt: "2026-07-22T09:35:00Z",
    initialBalance: 115.8234,
  },
  {
    id: "user-student-09",
    name: "Liam Navarro",
    username: "liamnavarro",
    walletAddress: "GST78T5U2V9999999999999999999999999999999999999999999999",
    role: "student",
    bio: "Fullstack JavaScript developer passionate about open-source developer tooling.",
    createdAt: "2026-07-23T11:50:00Z",
    verifiedAt: "2026-07-23T11:55:00Z",
    initialBalance: 28.6410,
  },
  {
    id: "user-student-10",
    name: "Ava Bautista",
    username: "avabautista",
    walletAddress: "GUV90U7V4W0000000000000000000000000000000000000000000000",
    role: "student",
    bio: "Technical writer and documentation specialist creating developer guides and research tutorials.",
    createdAt: "2026-07-24T15:20:00Z",
    verifiedAt: "2026-07-24T15:25:00Z",
    initialBalance: 64.9128,
  },

  // Sponsors (5)
  {
    id: "user-sponsor-01",
    name: "Marcus Thompson",
    username: "marcusthompson",
    walletAddress: "GWA12V9W6X1111111111111111111111111111111111111111111111",
    role: "sponsor",
    bio: "Independent product sponsor supporting student developers through practical projects.",
    createdAt: "2026-07-15T08:00:00Z",
    verifiedAt: "2026-07-15T08:10:00Z",
    initialBalance: 1842.7104,
  },
  {
    id: "user-sponsor-02",
    name: "Olivia Carter",
    username: "oliviacarter",
    walletAddress: "GXB34W1X8Y2222222222222222222222222222222222222222222222",
    role: "sponsor",
    bio: "EdTech ecosystem lead funding student micro-grants for open-source research.",
    createdAt: "2026-07-16T09:15:00Z",
    verifiedAt: "2026-07-16T09:20:00Z",
    initialBalance: 2450.8900,
  },
  {
    id: "user-sponsor-03",
    name: "James Anderson",
    username: "jamesanderson",
    walletAddress: "GYC56X3Y0Z3333333333333333333333333333333333333333333333",
    role: "sponsor",
    bio: "Open source grant manager supporting Stellar Soroban innovation and developer bounties.",
    createdAt: "2026-07-17T10:00:00Z",
    verifiedAt: "2026-07-17T10:05:00Z",
    initialBalance: 1248.7392,
  },
  {
    id: "user-sponsor-04",
    name: "Emma Williams",
    username: "emmawilliams",
    walletAddress: "GZD78Y5Z2A4444444444444444444444444444444444444444444444",
    role: "sponsor",
    bio: "Web3 scholarship director empowering next-generation scholars with micro-escrow rewards.",
    createdAt: "2026-07-18T11:30:00Z",
    verifiedAt: "2026-07-18T11:35:00Z",
    initialBalance: 1980.1500,
  },
  {
    id: "user-sponsor-05",
    name: "Lucas Martinez",
    username: "lucasmartinez",
    walletAddress: "GAE90Z7A4B5555555555555555555555555555555555555555555555",
    role: "sponsor",
    bio: "Tech venture mentor building talent pipelines for AI and decentralized application bounties.",
    createdAt: "2026-07-19T14:10:00Z",
    verifiedAt: "2026-07-19T14:15:00Z",
    initialBalance: 750.3200,
  },
];

// 2. Realistic Demo Bounties (12 bounties)
export const DEMO_BOUNTIES: DemoRawBounty[] = [
  {
    id: 101,
    title: "React Dashboard Redesign",
    category: "Frontend",
    rewardXlm: 250,
    creatorWalletAddress: DEMO_USERS[10].walletAddress, // Marcus Thompson
    creatorDisplayName: "Marcus Thompson",
    contributorWalletAddress: DEMO_USERS[0].walletAddress, // Alex Rivera
    contributorDisplayName: "Alex Rivera",
    description: "Modernize the main dashboard overview with responsive layout grids, glassmorphism UI elements, and instant statistical summary widgets.",
    difficulty: "Intermediate",
    status: "Completed",
    contractEscrowId: 2001,
    fundingTransactionHash: "7f8a9c0111111111111111111111111111111111111111111111111111111111",
    createdAt: "2026-07-18T09:30:00Z",
  },
  {
    id: 102,
    title: "Python Data Analysis & Visualization",
    category: "Data Science",
    rewardXlm: 400,
    creatorWalletAddress: DEMO_USERS[10].walletAddress, // Marcus Thompson
    creatorDisplayName: "Marcus Thompson",
    contributorWalletAddress: DEMO_USERS[3].walletAddress, // Sophia Reyes
    contributorDisplayName: "Sophia Reyes",
    description: "Analyze micro-grant distribution datasets using Pandas and Seaborn to produce actionable insight graphs for sponsor reviews.",
    difficulty: "Advanced",
    status: "Completed",
    contractEscrowId: 2002,
    fundingTransactionHash: "7f8a9c0222222222222222222222222222222222222222222222222222222222",
    createdAt: "2026-07-20T11:00:00Z",
  },
  {
    id: 103,
    title: "UI Design & Figma Component Library",
    category: "Design",
    rewardXlm: 175,
    creatorWalletAddress: DEMO_USERS[11].walletAddress, // Olivia Carter
    creatorDisplayName: "Olivia Carter",
    contributorWalletAddress: DEMO_USERS[7].walletAddress, // Isabella Flores
    contributorDisplayName: "Isabella Flores",
    description: "Construct a reusable Figma UI kit matching StudyStake purple/emerald design tokens, dark mode overlays, and modal dialogues.",
    difficulty: "Intermediate",
    status: "Completed",
    contractEscrowId: 2003,
    fundingTransactionHash: "7f8a9c0333333333333333333333333333333333333333333333333333333333",
    createdAt: "2026-07-22T14:15:00Z",
  },
  {
    id: 104,
    title: "TypeScript API Gateway Integration",
    category: "Backend",
    rewardXlm: 300,
    creatorWalletAddress: DEMO_USERS[12].walletAddress, // James Anderson
    creatorDisplayName: "James Anderson",
    contributorWalletAddress: DEMO_USERS[2].walletAddress, // Ethan Cruz
    contributorDisplayName: "Ethan Cruz",
    description: "Build robust REST/GraphQL proxy endpoints for Supabase data caching, request validation, and rate limiting.",
    difficulty: "Advanced",
    status: "In Progress",
    contractEscrowId: 2004,
    fundingTransactionHash: "7f8a9c0444444444444444444444444444444444444444444444444444444444",
    createdAt: "2026-07-25T10:45:00Z",
  },
  {
    id: 105,
    title: "Data Visualization Widgets",
    category: "Data Science",
    rewardXlm: 220,
    creatorWalletAddress: DEMO_USERS[11].walletAddress, // Olivia Carter
    creatorDisplayName: "Olivia Carter",
    contributorWalletAddress: DEMO_USERS[1].walletAddress, // Mia Santos
    contributorDisplayName: "Mia Santos",
    description: "Interactive chart components displaying real-time XLM escrow volumes and active scholar participation trends.",
    difficulty: "Intermediate",
    status: "Completed",
    contractEscrowId: 2005,
    fundingTransactionHash: "7f8a9c0555555555555555555555555555555555555555555555555555555555",
    createdAt: "2026-07-27T15:30:00Z",
  },
  {
    id: 106,
    title: "Mobile UI React Native Screens",
    category: "Frontend",
    rewardXlm: 350,
    creatorWalletAddress: DEMO_USERS[13].walletAddress, // Emma Williams
    creatorDisplayName: "Emma Williams",
    contributorWalletAddress: DEMO_USERS[5].walletAddress, // Chloe Mendoza
    contributorDisplayName: "Chloe Mendoza",
    description: "Build responsive cross-platform screens for mobile wallet authorization, bounty discovery, and submission reviews.",
    difficulty: "Advanced",
    status: "In Progress",
    contractEscrowId: 2006,
    fundingTransactionHash: "7f8a9c0666666666666666666666666666666666666666666666666666666666",
    createdAt: "2026-07-29T09:00:00Z",
  },
  {
    id: 107,
    title: "Soroban Smart Contract Research",
    category: "Smart Contracts",
    rewardXlm: 500,
    creatorWalletAddress: DEMO_USERS[12].walletAddress, // James Anderson
    creatorDisplayName: "James Anderson",
    contributorWalletAddress: DEMO_USERS[4].walletAddress, // Daniel Garcia
    contributorDisplayName: "Daniel Garcia",
    description: "Audit and optimize Soroban Rust escrow contract methods for gas efficiency and instant settlement verification.",
    difficulty: "Advanced",
    status: "Completed",
    contractEscrowId: 2007,
    fundingTransactionHash: "7f8a9c0777777777777777777777777777777777777777777777777777777777",
    createdAt: "2026-08-01T11:20:00Z",
  },
  {
    id: 108,
    title: "Node.js Micro-bounty Service API",
    category: "Backend",
    rewardXlm: 180,
    creatorWalletAddress: DEMO_USERS[14].walletAddress, // Lucas Martinez
    creatorDisplayName: "Lucas Martinez",
    contributorWalletAddress: DEMO_USERS[8].walletAddress, // Liam Navarro
    contributorDisplayName: "Liam Navarro",
    description: "Create lightweight Express middleware for processing webhook notifications when Soroban contract events trigger.",
    difficulty: "Intermediate",
    status: "Completed",
    contractEscrowId: 2008,
    fundingTransactionHash: "7f8a9c0888888888888888888888888888888888888888888888888888888888",
    createdAt: "2026-08-03T13:40:00Z",
  },
  {
    id: 109,
    title: "Figma Design System Guidelines",
    category: "Design",
    rewardXlm: 120,
    creatorWalletAddress: DEMO_USERS[14].walletAddress, // Lucas Martinez
    creatorDisplayName: "Lucas Martinez",
    contributorWalletAddress: DEMO_USERS[9].walletAddress, // Ava Bautista
    contributorDisplayName: "Ava Bautista",
    description: "Draft comprehensive design specification guidelines and user flow documentations for StudyStake contributor onboarding.",
    difficulty: "Beginner",
    status: "Completed",
    contractEscrowId: 2010,
    fundingTransactionHash: "7f8a9c0999999999999999999999999999999999999999999999999999999999",
    createdAt: "2026-08-05T16:10:00Z",
  },
  {
    id: 110,
    title: "AI Study Assistant Integration",
    category: "Data Science",
    rewardXlm: 450,
    creatorWalletAddress: DEMO_USERS[13].walletAddress, // Emma Williams
    creatorDisplayName: "Emma Williams",
    contributorWalletAddress: DEMO_USERS[3].walletAddress, // Sophia Reyes
    contributorDisplayName: "Sophia Reyes",
    description: "Prototype LLM prompt templates for automated proof submission validation and scholar code quality scoring.",
    difficulty: "Advanced",
    status: "Open",
    contractEscrowId: 2011,
    fundingTransactionHash: "7f8a9c1010101010101010101010101010101010101010101010101010101010",
    createdAt: "2026-08-08T10:00:00Z",
  },
  {
    id: 111,
    title: "Smart Contract Escrow Security Review",
    category: "Smart Contracts",
    rewardXlm: 380,
    creatorWalletAddress: DEMO_USERS[12].walletAddress, // James Anderson
    creatorDisplayName: "James Anderson",
    contributorWalletAddress: DEMO_USERS[6].walletAddress, // Noah Aquino
    contributorDisplayName: "Noah Aquino",
    description: "Perform formal verification and threat modeling on multi-signature escrow release pathways.",
    difficulty: "Advanced",
    status: "In Progress",
    contractEscrowId: 2012,
    fundingTransactionHash: "7f8a9c1111111111111111111111111111111111111111111111111111111111",
    createdAt: "2026-08-10T14:30:00Z",
  },
  {
    id: 112,
    title: "Scholarly Research Documentation",
    category: "Research",
    rewardXlm: 150,
    creatorWalletAddress: DEMO_USERS[11].walletAddress, // Olivia Carter
    creatorDisplayName: "Olivia Carter",
    contributorWalletAddress: DEMO_USERS[9].walletAddress, // Ava Bautista
    contributorDisplayName: "Ava Bautista",
    description: "Write comprehensive technical whitepaper outlining StudyStake micro-grant protocols and decentralized academic credentials.",
    difficulty: "Beginner",
    status: "Open",
    createdAt: "2026-08-12T09:15:00Z",
  },
];

// Helper to generate deterministic 64-char transaction hash
function mockHash(seedNum: number): string {
  const hex = seedNum.toString(16).padStart(8, "0");
  return `${hex}a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789a`.slice(0, 64);
}

// 3. Generate 100+ Realistic Wallet Interactions
// MOCK DATA ONLY — transaction hashes are synthetic and are not real Stellar transactions.
export function generateDemoInteractions(): DemoRawInteraction[] {
  const interactions: DemoRawInteraction[] = [];

  // Define providers for distribution
  const providers: ("Freighter" | "Albedo" | "xBull" | "Hana")[] = [
    "Freighter", "Freighter", "Freighter", "Freighter", // ~60% Freighter
    "Albedo", "Albedo",                                 // ~20% Albedo
    "xBull",                                           // ~10% xBull
    "Hana",                                            // ~10% Hana
  ];

  let hashCounter = 500;

  // 1. Connection events for all 15 users
  DEMO_USERS.forEach((user, idx) => {
    const provider = providers[idx % providers.length];
    const dayNum = 15 + (idx % 15);
    const day = dayNum.toString().padStart(2, "0");

    interactions.push({
      walletAddress: user.walletAddress,
      interactionType: "wallet_connected",
      description: `${user.name} connected Stellar wallet via ${provider}`,
      walletProvider: provider,
      createdAt: `2026-07-${day}T09:00:00Z`,
    });
  });

  // 2. Realistic Bounty Workflows
  // Workflow 1: Marcus Thompson -> Alex Rivera (React Dashboard Redesign)
  const marcus = DEMO_USERS[10].walletAddress;
  const alex = DEMO_USERS[0].walletAddress;
  interactions.push(
    {
      walletAddress: marcus,
      interactionType: "escrow_created",
      contractEscrowId: 2001,
      transactionHash: mockHash(++hashCounter),
      amount: 250,
      bountyId: "101",
      description: "Funded and locked 250 XLM in Soroban Escrow for 'React Dashboard Redesign'",
      walletProvider: "Freighter",
      createdAt: "2026-07-18T09:30:00Z",
    },
    {
      walletAddress: alex,
      interactionType: "bounty_accepted",
      contractEscrowId: 2001,
      bountyId: "101",
      description: "Alex Rivera accepted bounty 'React Dashboard Redesign'",
      walletProvider: "Freighter",
      createdAt: "2026-07-18T14:20:00Z",
    },
    {
      walletAddress: alex,
      interactionType: "proof_submitted",
      bountyId: "101",
      description: "Alex Rivera submitted pull request proof for 'React Dashboard Redesign'",
      walletProvider: "Freighter",
      createdAt: "2026-07-21T16:00:00Z",
    },
    {
      walletAddress: marcus,
      interactionType: "reward_released",
      contractEscrowId: 2001,
      transactionHash: mockHash(++hashCounter),
      amount: 250,
      bountyId: "101",
      description: "Released 250 XLM escrow reward to Alex Rivera",
      walletProvider: "Freighter",
      createdAt: "2026-07-22T10:15:00Z",
    },
    {
      walletAddress: alex,
      interactionType: "xlm_payment_sent",
      transactionHash: mockHash(++hashCounter),
      amount: 15,
      description: "Sent 15 XLM student-to-student peer assistance transfer",
      walletProvider: "Freighter",
      createdAt: "2026-07-23T11:00:00Z",
    }
  );

  // Workflow 2: Marcus Thompson -> Sophia Reyes (Python Data Analysis)
  const sophia = DEMO_USERS[3].walletAddress;
  interactions.push(
    {
      walletAddress: marcus,
      interactionType: "escrow_created",
      contractEscrowId: 2002,
      transactionHash: mockHash(++hashCounter),
      amount: 400,
      bountyId: "102",
      description: "Funded and locked 400 XLM in Soroban Escrow for 'Python Data Analysis'",
      walletProvider: "Freighter",
      createdAt: "2026-07-20T11:00:00Z",
    },
    {
      walletAddress: sophia,
      interactionType: "bounty_accepted",
      contractEscrowId: 2002,
      bountyId: "102",
      description: "Sophia Reyes accepted bounty 'Python Data Analysis'",
      walletProvider: "Albedo",
      createdAt: "2026-07-20T15:10:00Z",
    },
    {
      walletAddress: sophia,
      interactionType: "proof_submitted",
      bountyId: "102",
      description: "Sophia Reyes submitted Jupyter notebook proof for 'Python Data Analysis'",
      walletProvider: "Albedo",
      createdAt: "2026-07-24T18:30:00Z",
    },
    {
      walletAddress: marcus,
      interactionType: "reward_released",
      contractEscrowId: 2002,
      transactionHash: mockHash(++hashCounter),
      amount: 400,
      bountyId: "102",
      description: "Released 400 XLM escrow reward to Sophia Reyes",
      walletProvider: "Freighter",
      createdAt: "2026-07-25T09:45:00Z",
    }
  );

  // Workflow 3: Olivia Carter -> Isabella Flores & Mia Santos
  const olivia = DEMO_USERS[11].walletAddress;
  const isabella = DEMO_USERS[7].walletAddress;
  const mia = DEMO_USERS[1].walletAddress;
  interactions.push(
    {
      walletAddress: olivia,
      interactionType: "escrow_created",
      contractEscrowId: 2003,
      transactionHash: mockHash(++hashCounter),
      amount: 175,
      bountyId: "103",
      description: "Funded 175 XLM escrow for 'UI Design & Figma Component Library'",
      walletProvider: "Freighter",
      createdAt: "2026-07-22T14:15:00Z",
    },
    {
      walletAddress: isabella,
      interactionType: "bounty_accepted",
      contractEscrowId: 2003,
      bountyId: "103",
      description: "Isabella Flores accepted Figma component library bounty",
      walletProvider: "xBull",
      createdAt: "2026-07-23T08:20:00Z",
    },
    {
      walletAddress: isabella,
      interactionType: "proof_submitted",
      bountyId: "103",
      description: "Isabella Flores submitted Figma link proof for UI Design",
      walletProvider: "xBull",
      createdAt: "2026-07-26T12:00:00Z",
    },
    {
      walletAddress: olivia,
      interactionType: "reward_released",
      contractEscrowId: 2003,
      transactionHash: mockHash(++hashCounter),
      amount: 175,
      bountyId: "103",
      description: "Released 175 XLM reward to Isabella Flores",
      walletProvider: "Freighter",
      createdAt: "2026-07-27T10:00:00Z",
    },
    {
      walletAddress: olivia,
      interactionType: "escrow_created",
      contractEscrowId: 2005,
      transactionHash: mockHash(++hashCounter),
      amount: 220,
      bountyId: "105",
      description: "Funded 220 XLM escrow for 'Data Visualization Widgets'",
      walletProvider: "Freighter",
      createdAt: "2026-07-27T15:30:00Z",
    },
    {
      walletAddress: mia,
      interactionType: "bounty_accepted",
      contractEscrowId: 2005,
      bountyId: "105",
      description: "Mia Santos accepted Data Visualization bounty",
      walletProvider: "Albedo",
      createdAt: "2026-07-28T09:10:00Z",
    },
    {
      walletAddress: mia,
      interactionType: "proof_submitted",
      bountyId: "105",
      description: "Mia Santos submitted chart component repository",
      walletProvider: "Albedo",
      createdAt: "2026-07-30T16:45:00Z",
    },
    {
      walletAddress: olivia,
      interactionType: "reward_released",
      contractEscrowId: 2005,
      transactionHash: mockHash(++hashCounter),
      amount: 220,
      bountyId: "105",
      description: "Released 220 XLM reward to Mia Santos",
      walletProvider: "Freighter",
      createdAt: "2026-07-31T11:20:00Z",
    }
  );

  // Workflow 4: James Anderson -> Ethan Cruz & Daniel Garcia
  const james = DEMO_USERS[12].walletAddress;
  const ethan = DEMO_USERS[2].walletAddress;
  const daniel = DEMO_USERS[4].walletAddress;
  interactions.push(
    {
      walletAddress: james,
      interactionType: "escrow_created",
      contractEscrowId: 2004,
      transactionHash: mockHash(++hashCounter),
      amount: 300,
      bountyId: "104",
      description: "Funded 300 XLM escrow for 'TypeScript API Gateway Integration'",
      walletProvider: "Freighter",
      createdAt: "2026-07-25T10:45:00Z",
    },
    {
      walletAddress: ethan,
      interactionType: "bounty_accepted",
      contractEscrowId: 2004,
      bountyId: "104",
      description: "Ethan Cruz accepted TypeScript API gateway bounty",
      walletProvider: "Freighter",
      createdAt: "2026-07-26T09:30:00Z",
    },
    {
      walletAddress: james,
      interactionType: "escrow_created",
      contractEscrowId: 2007,
      transactionHash: mockHash(++hashCounter),
      amount: 500,
      bountyId: "107",
      description: "Funded 500 XLM escrow for 'Soroban Smart Contract Research'",
      walletProvider: "Freighter",
      createdAt: "2026-08-01T11:20:00Z",
    },
    {
      walletAddress: daniel,
      interactionType: "bounty_accepted",
      contractEscrowId: 2007,
      bountyId: "107",
      description: "Daniel Garcia accepted Soroban research bounty",
      walletProvider: "Hana",
      createdAt: "2026-08-02T13:00:00Z",
    },
    {
      walletAddress: daniel,
      interactionType: "proof_submitted",
      bountyId: "107",
      description: "Daniel Garcia submitted Rust security report and benchmark suite",
      walletProvider: "Hana",
      createdAt: "2026-08-04T17:15:00Z",
    },
    {
      walletAddress: james,
      interactionType: "reward_released",
      contractEscrowId: 2007,
      transactionHash: mockHash(++hashCounter),
      amount: 500,
      bountyId: "107",
      description: "Released 500 XLM escrow reward to Daniel Garcia",
      walletProvider: "Freighter",
      createdAt: "2026-08-05T10:30:00Z",
    }
  );

  // Workflow 5: Emma Williams -> Chloe Mendoza & Sophia Reyes
  const emma = DEMO_USERS[13].walletAddress;
  const chloe = DEMO_USERS[5].walletAddress;
  interactions.push(
    {
      walletAddress: emma,
      interactionType: "escrow_created",
      contractEscrowId: 2006,
      transactionHash: mockHash(++hashCounter),
      amount: 350,
      bountyId: "106",
      description: "Funded 350 XLM escrow for 'Mobile UI React Native Screens'",
      walletProvider: "Freighter",
      createdAt: "2026-07-29T09:00:00Z",
    },
    {
      walletAddress: chloe,
      interactionType: "bounty_accepted",
      contractEscrowId: 2006,
      bountyId: "106",
      description: "Chloe Mendoza accepted Mobile UI bounty",
      walletProvider: "Freighter",
      createdAt: "2026-07-30T10:20:00Z",
    },
    {
      walletAddress: emma,
      interactionType: "escrow_created",
      contractEscrowId: 2011,
      transactionHash: mockHash(++hashCounter),
      amount: 450,
      bountyId: "110",
      description: "Funded 450 XLM escrow for 'AI Study Assistant Integration'",
      walletProvider: "Freighter",
      createdAt: "2026-08-08T10:00:00Z",
    }
  );

  // Workflow 6: Lucas Martinez -> Liam Navarro & Ava Bautista
  const lucas = DEMO_USERS[14].walletAddress;
  const liam = DEMO_USERS[8].walletAddress;
  const ava = DEMO_USERS[9].walletAddress;
  interactions.push(
    {
      walletAddress: lucas,
      interactionType: "escrow_created",
      contractEscrowId: 2008,
      transactionHash: mockHash(++hashCounter),
      amount: 180,
      bountyId: "108",
      description: "Funded 180 XLM escrow for 'Node.js Micro-bounty Service API'",
      walletProvider: "Albedo",
      createdAt: "2026-08-03T13:40:00Z",
    },
    {
      walletAddress: liam,
      interactionType: "bounty_accepted",
      contractEscrowId: 2008,
      bountyId: "108",
      description: "Liam Navarro accepted Node.js micro-bounty API task",
      walletProvider: "Freighter",
      createdAt: "2026-08-04T09:15:00Z",
    },
    {
      walletAddress: liam,
      interactionType: "proof_submitted",
      bountyId: "108",
      description: "Liam Navarro submitted Express API implementation",
      walletProvider: "Freighter",
      createdAt: "2026-08-06T14:50:00Z",
    },
    {
      walletAddress: lucas,
      interactionType: "reward_released",
      contractEscrowId: 2008,
      transactionHash: mockHash(++hashCounter),
      amount: 180,
      bountyId: "108",
      description: "Released 180 XLM escrow reward to Liam Navarro",
      walletProvider: "Albedo",
      createdAt: "2026-08-07T11:00:00Z",
    },
    {
      walletAddress: lucas,
      interactionType: "escrow_created",
      contractEscrowId: 2010,
      transactionHash: mockHash(++hashCounter),
      amount: 120,
      bountyId: "109",
      description: "Funded 120 XLM escrow for 'Figma Design System Guidelines'",
      walletProvider: "Albedo",
      createdAt: "2026-08-05T16:10:00Z",
    },
    {
      walletAddress: ava,
      interactionType: "bounty_accepted",
      contractEscrowId: 2010,
      bountyId: "109",
      description: "Ava Bautista accepted Figma guidelines documentation task",
      walletProvider: "Freighter",
      createdAt: "2026-08-06T10:00:00Z",
    },
    {
      walletAddress: ava,
      interactionType: "proof_submitted",
      bountyId: "109",
      description: "Ava Bautista submitted technical design guide draft",
      walletProvider: "Freighter",
      createdAt: "2026-08-08T15:30:00Z",
    },
    {
      walletAddress: lucas,
      interactionType: "reward_released",
      contractEscrowId: 2010,
      transactionHash: mockHash(++hashCounter),
      amount: 120,
      bountyId: "109",
      description: "Released 120 XLM escrow reward to Ava Bautista",
      walletProvider: "Albedo",
      createdAt: "2026-08-09T09:20:00Z",
    }
  );

  // 3. Fill up to ~105-110 realistic interaction logs with dates spanning July 15 – Aug 13, 2026
  const noah = DEMO_USERS[6].walletAddress;
  DEMO_USERS.forEach((u, index) => {
    const provider = providers[(index + 3) % providers.length];
    const day = (1 + (index % 12)).toString().padStart(2, "0");

    // Additional periodic session and payment events
    interactions.push({
      walletAddress: u.walletAddress,
      interactionType: "wallet_connected",
      description: `${u.name} authenticated wallet session`,
      walletProvider: provider,
      createdAt: `2026-08-${day}T08:30:00Z`,
    });

    if (u.role === "student" && index % 2 === 0) {
      interactions.push({
        walletAddress: u.walletAddress,
        interactionType: "xlm_payment_sent",
        transactionHash: mockHash(++hashCounter),
        amount: Number((5 + index * 2.5).toFixed(2)),
        description: `Peer transfer for learning resource reimbursement`,
        walletProvider: provider,
        createdAt: `2026-08-${day}T14:45:00Z`,
      });
    }

    interactions.push({
      walletAddress: u.walletAddress,
      interactionType: "wallet_disconnected",
      description: `${u.name} disconnected session`,
      walletProvider: provider,
      createdAt: `2026-08-${day}T18:00:00Z`,
    });
  });

  // Extra audit interaction for Noah Aquino
  interactions.push({
    walletAddress: noah,
    interactionType: "bounty_accepted",
    contractEscrowId: 2012,
    bountyId: "111",
    description: "Noah Aquino accepted Smart Contract Security Audit task",
    walletProvider: "xBull",
    createdAt: "2026-08-11T10:15:00Z",
  });

  return interactions;
}
