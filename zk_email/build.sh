#!/bin/bash
echo "Generating circuit inputs..."
mkdir -p artifacts # Ensure the artifacts directory exists
npx ts-node scripts/inputs.ts

echo "Compiling circuit..."
circom -l node_modules -l ../libs circuits/pr_verifier.circom -o artifacts --r1cs --wasm --sym --c
