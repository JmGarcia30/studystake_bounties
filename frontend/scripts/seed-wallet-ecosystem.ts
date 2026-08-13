import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { seedWalletEcosystem } from "../src/services/seedService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
}

async function run() {
  loadEnv();

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Error: Supabase URL and key must be defined in environment or frontend/.env");
    process.exit(1);
  }

  console.log("--------------------------------------------------");
  console.log("StudyStake — Supabase Wallet Ecosystem Demo Seed");
  console.log("Target Database:", url);
  console.log("--------------------------------------------------");

  const client = createClient(url, key);

  try {
    const result = await seedWalletEcosystem(client);
    console.log("SUCCESS: Wallet ecosystem seed completed!");
    console.log(`- Seeded Demo Users:          ${result.usersCount}`);
    console.log(`- Seeded Demo Bounties:       ${result.bountiesCount}`);
    console.log(`- Seeded Wallet Interactions: ${result.interactionsCount}`);
    console.log("--------------------------------------------------");
  } catch (err: any) {
    console.error("ERROR: Seed failed:", err?.message || err);
    process.exit(1);
  }
}

run();
