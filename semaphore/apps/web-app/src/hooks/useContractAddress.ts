import { useMemo } from "react"
import { useNetwork } from "wagmi"
import { AddressMap } from "../types"
import { chains } from "../constants/chains"

export function useContractAddress(addressMap: AddressMap) {
    const { chain } = useNetwork()
    return useMemo(() => addressMap[chain?.id ?? chains[0].id], [addressMap, chain])
}
