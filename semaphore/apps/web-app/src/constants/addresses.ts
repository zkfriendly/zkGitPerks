import { scrollSepolia, sepolia } from "wagmi/chains"
import { AddressMap } from "../types"

export const GATEKEEPER_CONTRACT_ADDRESS_MAP: AddressMap = {
    [scrollSepolia.id]: "0x267ce9b841ce44e96f46d840a19850af480a81e3"
}

export const ZKBILL_CONTRACT_ADDRESS_MAP: AddressMap = {
    [scrollSepolia.id]: "0x9B3c6558dAC55547533c13850F2e1E083888CAfb"
}

export const SEMAPHORE_CONTRACT_ADDRESS_MAP: AddressMap = {
    [sepolia.id]: "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131",
    [scrollSepolia.id]: "0xf4c4821434c0b54dd0c45953a8ff38f6d15c2166"
}
