import { Box, Button, Divider, Heading, HStack, Link, ListItem, OrderedList, Stack, Text } from "@chakra-ui/react"
import { Identity } from "@semaphore-protocol/identity"
import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useState } from "react"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import IconAddCircleFill from "../icons/IconAddCircleFill"
import IconRefreshLine from "../icons/IconRefreshLine"
import { providers } from "ethers"
import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"

const injectedConnector = new InjectedConnector({})

export default function IdentitiesPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const [_identity, setIdentity] = useState<Identity>()
    const { active, library, account } = useWeb3React<providers.Web3Provider>()

    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (identityString) {
            const identity = new Identity(identityString)

            setIdentity(identity)

            setLogs("Your Semaphore identity was retrieved from the browser cache 👌🏽")
        } else {
            setLogs("Create your Semaphore identity 👆🏽")
        }
    }, [])

    const createIdentity = useCallback(async () => {
        if (active) {
            const signer = library!.getSigner(account!)
            const message = `Sign this message to generate your Semaphore identity.`
            const identity = new Identity(await signer.signMessage(message))

            setIdentity(identity)

            localStorage.setItem("identity", identity.toString())

            setLogs("Your new Semaphore identity was just created 🎉")
        } else {
            setLogs("Connect your wallet to create a Semaphore identity 👆🏽")
        }
    }, [active])

    return (
        <>
            <Heading as="h2" size="xl">
                Welcom to Git Perks! 🎉
            </Heading>

            <Text pt="2" fontSize="md">
                Users interact with the protocol using a Semaphore{" "}
                <Link href="https://semaphore.pse.dev/docs/guides/identities" color="primary.500" isExternal>
                    identity
                </Link>{" "}
                (similar to Ethereum accounts). It contains three values:
            </Text>
            <OrderedList pl="20px" pt="5px" spacing="3">
                <ListItem>Trapdoor: private, known only by user</ListItem>
                <ListItem>Nullifier: private, known only by user</ListItem>
                <ListItem>Commitment: public</ListItem>
            </OrderedList>

            <Divider pt="5" borderColor="gray.500" />

            <Stack pt="5" justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    Identity Generated Based on Your Wallet
                </Text>
                <Text fontSize="sm" color="green.900">
                    You don't need to write down or remember your identity. It's stored in your wallet.
                </Text>
            </Stack>

            {_identity ? (
                <Box py="6" whiteSpace="nowrap">
                    <Box p="5" borderWidth={1} borderColor="gray.500" borderRadius="4px">
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Trapdoor: {_identity.trapdoor.toString()}
                        </Text>
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Nullifier: {_identity.nullifier.toString()}
                        </Text>
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Commitment: {_identity.commitment.toString()}
                        </Text>
                    </Box>
                </Box>
            ) : (
                <Box py="6">
                    <Button
                        w="100%"
                        fontWeight="bold"
                        justifyContent="left"
                        colorScheme="primary"
                        px="4"
                        disabled={!active}
                        onClick={createIdentity}
                        leftIcon={<IconAddCircleFill />}
                    >
                        {active ? "Create identity" : "Connect Metamask"}
                    </Button>
                </Box>
            )}

            <Divider pt="3" borderColor="gray" />

            <Stepper step={1} onNextClick={_identity && (() => router.push("/groups"))} />
        </>
    )
}
