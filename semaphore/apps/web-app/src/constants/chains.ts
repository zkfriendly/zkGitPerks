import { sepolia } from "wagmi/chains"

export const chains = [sepolia]

export function isSupportedChain(chainId: number | null | undefined) {
    // return !!chainId && !!SupportedChainId[chainId];
    return Boolean(chainId && chains.find((chain) => chain.id === chainId))
}
