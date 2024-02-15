#!/bin/bash

echo "Generating circuit inputs..."
mkdir -p artifacts # Ensure the artifacts directory exists
mkdir -p artifacts/${1}
npx ts-node scripts/${1}/inputs.ts

echo "Compiling circuit..."
circom -l circuits circuits/${1}/circuit.circom -o artifacts/${1} --r1cs --wasm --sym --c

echo "Generating witness..."
node artifacts/${1}/circuit_js/generate_witness.js artifacts/${1}/circuit_js/circuit.wasm artifacts/${1}/input.json artifacts/${1}/witness.wtns

# requires trusted setup to be completed
export NODE_OPTIONS=--max_old_space_size=40960

echo "Generating zkey..."
snarkjs groth16 setup artifacts/${1}/circuit.r1cs ptau/pot22_final.ptau artifacts/${1}/verifier_0.zkey

echo "Contributing to phase 2..."
echo "rnd" | snarkjs zkey contribute artifacts/${1}/verifier_0.zkey artifacts/${1}/verifier_1.zkey --name="1st Contributor Name" -v

echo "Exporting verification key..."
snarkjs zkey export verificationkey artifacts/${1}/verifier_1.zkey artifacts/${1}/verification_key.json

echo "Generating proof..."
snarkjs groth16 prove artifacts/${1}/verifier_1.zkey artifacts/${1}/witness.wtns artifacts/${1}/proof.json artifacts/${1}/public.json

echo "Verifying proof..."
snarkjs groth16 verify artifacts/${1}/verification_key.json artifacts/${1}/public.json artifacts/${1}/proof.json