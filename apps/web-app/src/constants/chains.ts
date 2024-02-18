import { scrollSepolia } from "wagmi/chains"

export const chains = [scrollSepolia]

export function isSupportedChain(chainId: number | null | undefined) {
    // return !!chainId && !!SupportedChainId[chainId];
    return Boolean(chainId && chains.find((chain) => chain.id === chainId))
}
