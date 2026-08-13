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

## Phase 3 Level 4 evidence

Evidence writes are best-effort and run only after the primary action succeeds. A
Supabase logging failure does not change a successful wallet, proof, payment, or
contract result. When Supabase environment values are absent, the existing local
bounty repository remains active; the Evidence tab identifies local fallback mode
and disables shared feedback submission.

The frontend writes these `wallet_interactions.interaction_type` values:

- `wallet_connected` after wallet authentication and signature verification.
- `wallet_disconnected` with the address captured before local auth state clears.
- `proof_submitted` only after the proof row is created successfully.
- `xlm_payment_sent` only after a native XLM payment returns a transaction hash.
- `escrow_created`, `bounty_accepted`, and `reward_released` only when the
  corresponding contract call returns a transaction hash.

Interaction metadata records the app area/source and available bounty, payment,
or contract context. Feedback records a rating from 1 through 5, trimmed feedback
text, and the connected wallet address when available.

### Required anon policies

Phase 3 requires anonymous/authenticated `INSERT` access to
`wallet_interactions` and `user_feedback`. It does not require browser `SELECT`,
`UPDATE`, or `DELETE` access for either table. Keep those records write-only in
the MVP and use the Supabase Table Editor or SQL Editor for evidence review.
The existing Phase 2 `SELECT`/`INSERT` policies for proof submissions and bounty
policies remain unchanged.

Use these SQL Editor queries for Level 4 totals and screenshots:

```sql
select count(*) as total_wallet_interactions,
       count(distinct wallet_address) as distinct_wallets
from public.wallet_interactions;

select interaction_type, count(*) as total
from public.wallet_interactions
group by interaction_type
order by interaction_type;

select created_at, wallet_address, interaction_type, transaction_hash,
       contract_escrow_id, metadata
from public.wallet_interactions
order by created_at desc
limit 25;

select count(*) as total_feedback,
       round(avg(rating)::numeric, 2) as average_rating
from public.user_feedback;

select created_at, wallet_address, rating, feedback
from public.user_feedback
order by created_at desc
limit 25;
```
