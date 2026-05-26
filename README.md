# StudyStake Bounties
A decentralized micro-task board built on Stellar Soroban for student peer-tutoring.

## Problem & Solution
**Problem:** A computer science student wants to earn income by peer-tutoring but lacks a way to guarantee payment for micro-transactions ($1–$5) without losing profit to payment gateway fees.
**Solution:** A Soroban smart contract acts as a trustless escrow vault. The buyer locks USDC, which is instantly released to the tutor's wallet only when the work is confirmed complete.

## Timeline
Bootcamp friendly: Can be deployed and integrated with a frontend in 2-3 days.

## Stellar Features Used
* Micropayments
* Soroban smart contracts
* USDC transfers

## Vision and Purpose
To empower low-income students to safely participate in the micro-gig economy without predatory fees or fear of digital theft.

## Prerequisites
* Rust installed
* Target `wasm32-unknown-unknown` installed
* Stellar CLI (`stellar-cli` v20+)

## How to Build
```bash
soroban contract build