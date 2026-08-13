# Frontend Production Deployment

## Recommended target

Deploy the Vite frontend to **Vercel** from the public GitHub repository. Configure the Vercel project Root Directory as `frontend`. The application is a client-rendered Vite SPA, produces static files in `frontend/dist`, and does not require a server runtime.

`frontend/vercel.json` declares the Vite framework, production build command, output directory, and SPA fallback. Vercel officially supports Vite projects and requires an `index.html` rewrite when SPA deep links must resolve correctly.

## Vercel project settings

| Setting | Value |
|---|---|
| Git repository | `JmGarcia30/studystake_bounties` |
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Install Command | `npm install` (automatic) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Production Branch | Select the repository's protected release/default branch |
| Node.js | 20 or later |

Do not set the project root to the repository root. The root `package-lock.json` does not describe the frontend application; the deployable package and lockfile are under `frontend/`.

## Production environment variables

Add these in Vercel Project Settings > Environment Variables. Apply the real production values to **Production**. Use deliberate test projects/values for Preview, or disable preview access to shared evidence if preview writes would contaminate production validation data.

| Variable | Required | Production value/instruction |
|---|---:|---|
| `VITE_CONTRACT_ID` | Yes | `CCRBVQZ7IRASOIAQOWYYXV4UUJ2FPAVWMLULQW5KQBILXOXXFOMRXFA3` |
| `VITE_TOKEN_ID` | Yes | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| `VITE_RPC_URL` | Yes | `https://soroban-testnet.stellar.org` |
| `VITE_HORIZON_URL` | Yes | `https://horizon-testnet.stellar.org` |
| `VITE_NETWORK_PASSPHRASE` | Yes | `Test SDF Network ; September 2015` |
| `VITE_REPUTATION_CONTRACT_ID` | Recommended | `CBFNKF5HOW5XJNH3DLTYUQADZI5C53BCDDLDYQ2PUFJE2IYAOLG7C32W` |
| `VITE_SUPABASE_URL` | Level 4 production | Public Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Level 4 production | Public Supabase anon key; never service role |
| `VITE_GA_MEASUREMENT_ID` | Level 4 production | GA4 web stream ID, for example `G-XXXXXXXXXX` |
| `VITE_SENTRY_DSN` | Level 4 production | Public Sentry browser DSN |
| `VITE_APP_ENV` | Recommended | `production` |
| `VITE_APP_RELEASE` | Recommended | Immutable Git commit SHA or release tag |

All `VITE_` values are embedded into browser assets at build time and must be treated as public. Never enter a wallet secret, Supabase service-role key, Sentry auth token, or private API credential. Changing a Vercel environment value requires a new deployment.

## Address verification

The current testnet pair is recorded in `.deployments/testnet-latest.json`:

- Bounties: `CCRBVQZ7IRASOIAQOWYYXV4UUJ2FPAVWMLULQW5KQBILXOXXFOMRXFA3`
- Reputation: `CBFNKF5HOW5XJNH3DLTYUQADZI5C53BCDDLDYQ2PUFJE2IYAOLG7C32W`
- Native-XLM SAC: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

The older `CCEBMZKEH4GBRZVYDDGMSXWCHTL57ZIG6YRVZWRHTU4BP6QZVWQPXI7I` address is historical Level 2 evidence and must not be configured as the current production bounty contract.

## Deployment procedure

1. Push the reviewed Phase 5 commit to the public GitHub repository.
2. In Vercel, select Add New > Project and import the repository.
3. Set Root Directory to `frontend`; confirm Vite, `npm run build`, and `dist` are detected.
4. Enter every production environment variable above. Copy values directly; avoid trailing spaces.
5. Deploy first as a Preview if it uses isolated/test evidence configuration.
6. Verify the Preview build and browser startup, then promote or deploy the approved branch to Production.
7. Attach the final custom domain if available and verify HTTPS.
8. Run `docs/PRODUCTION_SMOKE_TEST.md` against the production URL.
9. Record the URL, deployment date, commit/release, provider project, and screenshots in `docs/LEVEL4_SUBMISSION.md`.

## Rollback

If smoke testing finds a critical regression, use Vercel deployment history to promote the last known-good production deployment. Restore matching environment variables if configuration changed, redeploy, and rerun the smoke test. Do not redeploy or mutate the Soroban contracts as part of a frontend rollback.