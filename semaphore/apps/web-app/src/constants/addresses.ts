import { scrollSepolia, sepolia } from "wagmi/chains"
import { AddressMap } from "../types"

export const GATEKEEPER_CONTRACT_ADDRESS_MAP: AddressMap = {
    [sepolia.id]: "0xc48490eED0b79011258bCA9c3fB248D718B0371e",
    [scrollSepolia.id]: "0x267ce9b841cE44e96f46D840A19850af480A81E3"
}

export const SEMAPHORE_CONTRACT_ADDRESS_MAP: AddressMap = {
    [sepolia.id]: "0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131",
    [scrollSepolia.id]: "0xf4C4821434c0B54Dd0c45953A8fF38f6D15c2166"
}
