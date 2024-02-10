#!/bin/bash
echo "Generating circuit inputs..."
mkdir -p artifacts # Ensure the artifacts directory exists
npx ts-node scripts/inputs.ts

echo "Compiling circuit..."
circom -l node_modules -l circuits circuits/pr_verifier.circom -o artifacts --r1cs --wasm --sym --c

echo "Generating witness..."
node artifacts/pr_verifier_js/generate_witness.js artifacts/pr_verifier_js/pr_verifier.wasm artifacts/input.json artifacts/witness.wtns
