# Supabase persistence

The frontend uses Supabase only when both `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` are configured in `frontend/.env.local`. These are
public browser values. Never put a Supabase service-role key in a Vite variable.
If either value is blank or still a placeholder, `LocalBountyRepository` is used.

## Expected tables and columns

Row Level Security must allow the anonymous client only the reads and inserts
required by the MVP. Keep update/delete policies closed unless a later phase
adds verified ownership rules.

- `bounties`: `id`, `title`, `category`, `reward_xlm`,
  `creator_wallet_address`, `creator_display_name`,
  `contributor_wallet_address`, `contributor_display_name`, `description`,
  `difficulty`, `status`, `contract_escrow_id`, `funding_transaction_hash`,
  `created_at`, `submissions_count`.
- `proof_submissions`: `id`, `bounty_id`, `contributor_wallet_address`,
  `contributor_display_name`, `proof_url`, `notes`, `submitted_at`,
  `review_status`, `review_transaction_hash`.
- `wallet_interactions`: `wallet_address`, `interaction_type`,
  `transaction_hash`, `contract_escrow_id`, `metadata`. The database may add
  its own identity and timestamp defaults.
- `user_feedback`: `wallet_address`, `rating`, `feedback`. The database may add
  its own identity and timestamp defaults.

`bounties.id` is the frontend metadata identifier. `contract_escrow_id` is the
separate Soroban bounty ID and may be null until funding succeeds.

## Runtime behavior

`SupabaseBountyRepository` reads, filters, looks up, and upserts bounty metadata,
and inserts/reads proof submissions. `communityService` exposes explicit writes
for wallet interaction evidence and user feedback. Database errors include the
operation, Supabase error code when available, and the original message so UI
callers can display actionable failures.
