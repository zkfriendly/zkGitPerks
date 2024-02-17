import { sepolia } from "wagmi/chains"
import { AddressMap } from "../types"

export const GATEKEEPER_CONTRACT_ADDRESS_MAP: AddressMap = {
    [sepolia.id]: "0xc48490eED0b79011258bCA9c3fB248D718B0371e"
}

export const SEMAPHORE_CONTRACT_ADDRESS_MAP: AddressMap = {
    [sepolia.id]: "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131"
}
