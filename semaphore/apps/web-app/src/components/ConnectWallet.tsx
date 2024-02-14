import { useEffect } from "react"
import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import { providers } from "ethers"
import { Button, HStack, Text } from "@chakra-ui/react"
import { SupportedNetwork } from "@semaphore-protocol/data"
import Link from "next/link"

const injectedConnector = new InjectedConnector({})

export default function ConnectWallet() {
    const { activate, active, deactivate, library, account } = useWeb3React<providers.Web3Provider>()

    useEffect(() => {
        ;(async () => {
            if (await injectedConnector.isAuthorized()) {
                await activate(injectedConnector)
                console.log("User authorized")
            } else {
                console.log("User not authorized")
            }
        })()
    }, [activate])

    function shortenAddress(address: string) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    function getExplorerLink(network: SupportedNetwork, address: string) {
        switch (network) {
            case "goerli":
            case "sepolia":
                return `https://${network}.etherscan.io/address/${address}`
            case "arbitrum-goerli":
                return `https://goerli.arbiscan.io/address/${address}`
            default:
                return ""
        }
    }

    return (
        <>
            {!active ? (
                <Button variant="outline" onClick={() => activate(injectedConnector)}>
                    Connect Metamask
                </Button>
            ) : (
                <HStack align="center" justify="right" p="2">
                    <Link href={getExplorerLink(SupportedNetwork.SEPOLIA, account!)}>
                        <Text fontSize="sm" color="gray.500" cursor="pointer">
                            {shortenAddress(account!)}
                        </Text>
                    </Link>
                    <Button variant="outline" onClick={() => deactivate()}>
                        Disconnect
                    </Button>
                </HStack>
            )}
        </>
    )
}
