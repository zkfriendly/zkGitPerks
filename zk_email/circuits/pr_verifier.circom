pragma circom 2.1.5;

include "@zk-email/circuits/email-verifier.circom";
include "./pr_merged_regex.circom";
include "./subject_repo_regex.circom";

template PrVerifier(max_header_bytes, max_body_bytes, n, k, pack_size) {
    signal input in_padded[max_header_bytes];
    signal input pubkey[k];
    signal input signature[k];
    signal input in_len_padded_bytes;
    signal input precomputed_sha[32];
    signal input body_hash_idx;
    signal input in_body_padded[max_body_bytes];
    signal input in_body_len_padded_bytes;
    signal input pr_index;
    signal input owner;
    signal output pubkey_hash;


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

    // verify repo
    component SR = SubjectRepoRegex(max_header_bytes);
    SR.msg <== in_padded;
    log(SR.out);
    SR.out === 1;

    // verify pr merged into main branch
    component PR = PrMergedRegex(max_body_bytes);
    PR.msg <== in_body_padded;
    log(PR.out);
    PR.out === 1;

    }

component main = PrVerifier(2048, 3072, 121, 17, 31);