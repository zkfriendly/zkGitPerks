import { useMemo } from "react"
import { useGateKeeperRepository } from "../abis/types/generated"
import { GATEKEEPER_CONTRACT_ADDRESS_MAP } from "../constants/addresses"
import { useContractAddress } from "./useContractAddress"

export default function useRepositoryName() {
    const gateKeeperAddress = useContractAddress(GATEKEEPER_CONTRACT_ADDRESS_MAP)

    const { data: repositoryNameChunks } = useGateKeeperRepository({
        address: gateKeeperAddress
    })

    return useMemo(() => {
        if (!repositoryNameChunks) return undefined
        let name = ""
        repositoryNameChunks.forEach((nameChunk) => {
            let chunk = BigInt(nameChunk)
            const buffer = new ArrayBuffer(256)
            const dataView = new DataView(buffer)

            for (let i = 0; i < 256; i++) {
                dataView.setUint8(i, Number(chunk & BigInt(0xff)))
                chunk >>= BigInt(8)
            }

            const uint8Array = new Uint8Array(buffer)
            const decoder = new TextDecoder()
            const text = decoder.decode(uint8Array)
            name += text.indexOf("\0") !== -1 ? text.slice(0, text.indexOf("\0")) : text
        })
        return name
    }, [repositoryNameChunks])
}
