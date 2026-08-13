# Level 4 Submission Evidence

Use this document as the final assembly checklist for the StudyStake Bounties Level 4 submission. Replace every `TODO` before submission and verify that shared links are publicly accessible in a signed-out browser.

## Live demo URL

- Production URL: `TODO`
- Deployment provider/project: `TODO`
- Deployment date and release: `TODO`
- Network: Stellar Testnet

## Public GitHub repository

- Repository: `TODO`
- Submission commit/tag: `TODO`
- CI run: `TODO`

## Contract deployment address

- StudyStake Bounties contract: `CCEBMZKEH4GBRZVYDDGMSXWCHTL57ZIG6YRVZWRHTU4BP6QZVWQPXI7I`
- Native-XLM testnet SAC: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- Reputation contract: record `VITE_REPUTATION_CONTRACT_ID` from the production deployment, or state that it is not configured.
- Contract explorer link: `TODO`
- Representative transaction links: `TODO`

## Supabase evidence screenshots

Store final images under `frontend/public/screenshots/level4/` or link to a public evidence folder.

- [ ] Bounties table with the production-validation bounty.
- [ ] Proof submissions table with successful tester submissions.
- [ ] Wallet interactions total and distinct-wallet count.
- [ ] Wallet interactions grouped by `interaction_type`.
- [ ] Recent interactions showing testnet transaction hashes and metadata.
- [ ] User feedback count and average rating.
- [ ] Recent feedback rows with personal data redacted where appropriate.
- Evidence folder/link: `TODO`

Use the evidence queries in `docs/SUPABASE.md`. Do not expose the Supabase service-role key or unrestricted database credentials in screenshots.

## Monitoring and analytics screenshots

- [ ] GA4 Realtime overview showing production traffic.
- [ ] GA4 Events report showing StudyStake product events.
- [ ] Sentry project/settings screen showing the production environment and release.
- [ ] Sentry Issues or test-event screen confirming ingestion.
- [ ] Hosting provider deployment status and latest successful build.
- Analytics property/link: `TODO`
- Sentry project/link: `TODO`

Expected analytics events:

- `wallet_connected`
- `proof_submitted`
- `xlm_payment_sent`
- `escrow_created`
- `bounty_accepted`
- `reward_released`
- `feedback_submitted`
- `evidence_page_viewed`

## Demo video link

- Public video URL: `TODO`
- Target length: 3–5 minutes
- [ ] Show production URL and Stellar Testnet indicator.
- [ ] Connect a funded wallet and show its balance.
- [ ] Open a bounty and submit proof.
- [ ] Show My Submissions after refresh.
- [ ] Send a small XLM payment and open the explorer link.
- [ ] Submit tester feedback.
- [ ] Show Supabase evidence and GA4/Sentry dashboards.

## 10-user testing summary

| Metric | Result |
|---|---|
| Testing period | `TODO` |
| Participants onboarded | `TODO / 10 minimum` |
| Distinct wallets observed | `TODO` |
| Successful proof submissions | `TODO` |
| Successful testnet transactions | `TODO` |
| Feedback responses | `TODO` |
| Devices/browsers represented | `TODO` |

Summarize tester recruitment, the task each tester attempted, completion rate, and any support required: `TODO`.

## Feedback summary

- Average rating: `TODO`
- Most common positive theme: `TODO`
- Most common usability issue: `TODO`
- Improvement made from feedback: `TODO`
- Deferred request and rationale: `TODO`

Use aggregate results in the public submission. Obtain consent before publishing identifiable wallet-linked comments.

## Known limitations

- The MVP targets Stellar Testnet and is not intended for mainnet funds.
- Supabase evidence tables are write-only from the anonymous browser client; reviewers use protected Supabase tooling for totals and recent records.
- Evidence logging and analytics are best-effort and do not block successful product actions.
- Analytics and monitoring are disabled when their optional environment variables are absent.
- Anonymous testnet evidence endpoints can be spammed; production ownership/rate-limiting controls are future work.
- A browser closed without using Disconnect cannot emit `wallet_disconnected`.
- Add any release-specific limitations here: `TODO`.

## Final submission checklist

- [ ] Production deployment is reachable from a signed-out browser.
- [ ] Production environment variables contain public values only.
- [ ] Contract and token addresses match the tested deployment.
- [ ] Supabase RLS is enabled and evidence inserts work.
- [ ] At least 10 real users are documented.
- [ ] Wallet interaction and feedback totals are captured.
- [ ] GA4 Realtime and Events screenshots are captured.
- [ ] Sentry ingestion/settings screenshots are captured.
- [ ] Production smoke test is complete.
- [ ] Mobile layout is checked on a physical device or responsive emulator.
- [ ] Demo video and evidence links are public.
- [ ] README instructions work from a clean clone.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass.
- [ ] Repository is public and the final commit/tag is recorded above.
