pragma circom 2.1.5;

include "@zk-email/circuits/email-verifier.circom";
include "./total_charge_regex.circom";
include "circomlib/circuits/poseidon.circom";


template ZkBill(max_header_bytes, max_body_bytes, n, k, pack_size, max_total_charged_len) {
    signal input in_padded[max_header_bytes];
    signal input pubkey[k];
    signal input signature[k];
    signal input in_len_padded_bytes;
    signal input precomputed_sha[32];
    signal input body_hash_idx;
    signal input in_body_padded[max_body_bytes];
    signal input in_body_len_padded_bytes;
    signal input to_index;
    signal input owner;
    
    signal output owner_out; // to prevent proof front-running
    signal output sig_hash; // to prevent double spending of the same email
    signal output pubkey_hash; // to verify domain
    var total_charged_packed = count_packed(max_total_charged_len, pack_size);
    signal output total_charged[total_charged_packed]; 
    
    component EV = EmailVerifier(max_header_bytes, max_body_bytes, n, k, 0);
    EV.in_padded <== in_padded;
    EV.pubkey <== pubkey;
    EV.signature <== signature;
    EV.in_len_padded_bytes <== in_len_padded_bytes;
    EV.body_hash_idx <== body_hash_idx;
    EV.precomputed_sha <== precomputed_sha;
    EV.in_body_padded <== in_body_padded;
    EV.in_body_len_padded_bytes <== in_body_len_padded_bytes;
    
    pubkey_hash <== EV.pubkey_hash;    

   // expose repo name
    signal (regex_out, total_charged_reveal[max_body_bytes]) <== TotalChargeRegex(max_body_bytes)(in_body_padded);
    log(regex_out);
    regex_out === 1;
    total_charged <== ShiftAndPackMaskedStr(max_body_bytes, max_total_charged_len, pack_size)(total_charged_reveal, to_index);

   
    // expose signature hash
   var k2_chunked_size = k >> 1;
    if(k % 2 == 1) {
        k2_chunked_size += 1;
    }
    signal sig_hash_input[k2_chunked_size];
    for(var i = 0; i < k2_chunked_size; i++) {
        if(i==k2_chunked_size-1 && k2_chunked_size % 2 == 1) {
            sig_hash_input[i] <== signature[2*i];
        } else {
            sig_hash_input[i] <== signature[2*i] + (1<<n) * signature[2*i+1];
        }
    }

    sig_hash <== Poseidon(k2_chunked_size)(sig_hash_input);
    owner_out <== owner;
}

component main = ZkBill(512, 2048, 121, 17, 31, 10);