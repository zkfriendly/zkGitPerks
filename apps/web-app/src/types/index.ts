import { Address, Chain } from "viem"

export type AddressMap = {
    [key: Chain["id"]]: Address
}

export enum TransactionState {
    INITIAL,
    PREPARING_TRANSACTION,
    AWAITING_USER_APPROVAL,
    AWAITING_TRANSACTION
}

export enum ZkProofStatus {
    INITIAL,
    GENERATING,
    READY
}

export type ProofObject = {
    proof_id: string
    circuit_name: string
    circuit_id: string
    circuit_type: string
    date_created: string
    perform_verify: boolean
    status: "Queued" | "Ready" | "Failed"
    team: string
    compute_time: string | null
    compute_time_sec: number | null
    compute_times: {
        prove: number
        total: number
        queued: number
        clean_up: number
        file_setup: number
        save_results: number
        verify_check: number
        generate_witness_c: number
    } | null
    file_size: number | null
    proof_input: any
    proof: {
        pi_a: [string, string, string]
        pi_b: [[string, string], [string, string], [string, string]]
        pi_c: [string, string, string]
        protocol: string
    } | null
    public: string[] | null
    verification_key: {
        protocol: string
        curve: string
        nPublic: number
        vk_alpha_1: string[]
        vk_beta_2: string[][]
        vk_gamma_2: string[][]
        vk_delta_2: string[][]
        vk_alphabeta_12: string[][][]
        IC: string[][]
    } | null
    error: null
}
