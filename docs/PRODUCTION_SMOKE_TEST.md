# Production Smoke Test

Run this checklist against the deployed URL after every production release. Record date, tester, browser/device, release identifier, and evidence links.

## Test record

- Production URL: `TODO`
- Vercel deployment/dashboard URL: `TODO`
- Release/commit (`VITE_APP_RELEASE`): `TODO`
- Date and tester: `TODO`
- Browser/device: `TODO`
- Stellar network: Testnet
- Result: `PASS / FAIL`

## Deployment configuration checks

- [ ] Vercel project Root Directory is `frontend`.
- [ ] Framework is Vite, build command is `npm run build`, and output directory is `dist`.
- [ ] The deployment is built from the intended public Git commit/production branch.
- [ ] All required variables in `docs/FRONTEND_DEPLOYMENT.md` are set for Production.
- [ ] Contract IDs match `.deployments/testnet-latest.json`.
- [ ] No service-role key, wallet secret, Sentry auth token, or private credential is present in a `VITE_` variable.
- [ ] The production build log has no missing-variable or TypeScript errors.
- [ ] HTTPS is valid and the page loads in a signed-out/private browser.
- [ ] Refresh the production URL and a test deep link; both resolve to the SPA rather than a 404.
- [ ] If environment variables changed, a new deployment was created afterward.
## Preconditions

- Use a funded Stellar Testnet wallet and a second valid Testnet destination address.
- Confirm production public environment variables are configured in the hosting provider.
- Keep Supabase Table Editor, GA4 Realtime/DebugView, Sentry, and Stellar Expert available in separate tabs.
- Use a small XLM amount. Never use a mainnet wallet or secret key.

## Functional checklist

### Wallet connect

- [ ] Open the production URL in a clean/private browser session.
- [ ] Connect the supported wallet and approve signature verification.
- [ ] Confirm the shortened public key and Disconnect control appear.
- [ ] Confirm one `wallet_connected` evidence row and one GA4 event.

### Testnet balance

- [ ] Confirm the UI identifies Stellar Testnet.
- [ ] Confirm the native XLM balance loads without a console error.
- [ ] Compare it with Horizon or the wallet balance.

### Bounty display

- [ ] Confirm the Supabase bounty appears with correct title, category, status, and XLM reward.
- [ ] Exercise category/search filtering.
- [ ] Confirm the marketplace remains usable after refresh.

### Proof submission

- [ ] Submit a valid proof URL and optional notes.
- [ ] Confirm the success state appears only after persistence succeeds.
- [ ] Refresh My Submissions and confirm the row appears.
- [ ] Confirm `proof_submitted` in Supabase and GA4.

### Evidence logging

- [ ] Confirm expected wallet-interaction fields: address, type, timestamp, metadata, and optional hash/escrow ID.
- [ ] Confirm failed/cancelled product actions do not create success evidence.
- [ ] Disconnect and confirm the original address is retained in `wallet_disconnected`.

### Feedback submission

- [ ] Open Level 4 Evidence.
- [ ] Confirm `evidence_page_viewed` appears in GA4.
- [ ] Verify empty feedback is rejected.
- [ ] Submit a 1–5 rating and short comment.
- [ ] Confirm loading and success states and the `user_feedback` row.
- [ ] Confirm `feedback_submitted` appears in GA4.

### Send XLM

- [ ] Enter a valid Testnet destination and small positive amount.
- [ ] Approve the transaction in the wallet.
- [ ] Confirm the success message, exact amount/destination, and real transaction hash.
- [ ] Confirm `xlm_payment_sent` in Supabase and GA4 only after success.

### Explorer link verification

- [ ] Open the transaction link in Stellar Expert Testnet.
- [ ] Confirm source, destination, amount, success status, and hash match the app.

### Escrow actions

- [ ] Run only the contract actions appropriate for the prepared demo accounts.
- [ ] Confirm successful create/accept/release actions retain existing UI and activity-feed behavior.
- [ ] Confirm corresponding Supabase and GA4 events include hashes where required.

### Mobile responsive check

- [ ] Test approximately 375 px and 768 px widths.
- [ ] Confirm navigation, marketplace cards, proof modal, feedback form, and transaction results are usable.
- [ ] Confirm no horizontal overflow hides primary actions or hashes.

### Supabase evidence check

- [ ] Run the totals and recent-row queries in `docs/SUPABASE.md`.
- [ ] Confirm distinct wallets, event totals, feedback totals, and recent rows are plausible.
- [ ] Capture screenshots without keys or sensitive dashboard details.

### Monitoring and analytics check

- [ ] Confirm GA4 Realtime shows the smoke-test session and named events.
- [ ] Confirm browser network requests reach the GA collection endpoint.
- [ ] Confirm Sentry shows the configured environment/release.
- [ ] Send a controlled Sentry test event from a non-user production validation session if approved.
- [ ] Confirm missing analytics/Sentry variables in a local build do not prevent startup.

## Sign-off

- [ ] All critical flows passed.
- [ ] Production URL, Vercel project, deployment date, and release commit are recorded in `docs/LEVEL4_SUBMISSION.md`.
- [ ] Successful deployment and signed-out homepage screenshots were captured.
- [ ] The last known-good rollback target is identifiable in deployment history.
- [ ] Rollback target (last known-good deployment) is identifiable in deployment history.
- [ ] Any failure has an issue link and owner.
- [ ] Evidence screenshots were added to the submission packet.
- Tester/sign-off: `TODO`
- Notes/issues: `TODO`
