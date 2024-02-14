#!/bin/bash

echo "Generating circuit inputs..."
mkdir -p artifacts # Ensure the artifacts directory exists
npx ts-node scripts/inputs.ts

# echo "Compiling circuit..."
# circom -l circuits circuits/circuit.circom -o artifacts --r1cs --wasm --sym --c

echo "Generating witness..."
node artifacts/circuit_js/generate_witness.js artifacts/circuit_js/circuit.wasm artifacts/input.json artifacts/witness.wtns

# # requires trusted setup to be completed
# export NODE_OPTIONS=--max_old_space_size=40960

# echo "Generating zkey..."
# snarkjs groth16 setup artifacts/circuit.r1cs ptau/pot22_final.ptau artifacts/gitdao_verifier_0.zkey

# echo "Contributing to phase 2..."
# echo "rnd" | snarkjs zkey contribute artifacts/gitdao_verifier_0.zkey artifacts/gitdao_verifier_1.zkey --name="1st Contributor Name" -v

# echo "Exporting verification key..."
# snarkjs zkey export verificationkey artifacts/gitdao_verifier_1.zkey artifacts/verification_key.json

echo "Generating proof..."
snarkjs groth16 prove artifacts/gitdao_verifier_1.zkey artifacts/witness.wtns artifacts/proof.json artifacts/public.json

echo "Verifying proof..."
snarkjs groth16 verify artifacts/verification_key.json artifacts/public.json artifacts/proof.json