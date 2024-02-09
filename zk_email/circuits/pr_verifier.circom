include "@zk-email/circuits/email-verifier.circom";
include "./pr_merged_regex.circom";

template PrVerifier(max_header_bytes, max_body_bytes, n, k, pack_size) {
    signal input in_padded[max_header_bytes];
    signal input pubkey[k];
    signal input signature[k];
    signal input in_len_padded_bytes;
}

component main = PrVerifier(2*1024,3 *1024, 121, 17, 31);