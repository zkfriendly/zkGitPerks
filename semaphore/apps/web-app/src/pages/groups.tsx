import { Button, Divider, Heading, HStack, Stack, Text, VStack } from "@chakra-ui/react"
import { Identity } from "@semaphore-protocol/identity"
import { useCallback, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { prepareWriteContract, waitForTransaction, writeContract } from "@wagmi/core"
import { useContractAddress } from "../hooks/useContractAddress"
import { GATEKEEPER_CONTRACT_ADDRESS_MAP } from "../constants/addresses"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import IconRefreshLine from "../icons/IconRefreshLine"
import { getPrProofInputs } from "../lib/input"
import { PR_CIRCUIT_ID } from "../constants"
import { gateKeeperABI } from "../abis/types/generated"
import { TransactionState, ZkProofStatus } from "../types"
import useZkEmail from "../hooks/useZkEmail"
import EmailInput from "../components/EmailInput"
import { PageBodyContainer } from "./index"

export default function GroupsPage() {
    const navigate = useNavigate()
    const { setLogs } = useContext(LogsContext)
    const { _users, refreshUsers } = useContext(SemaphoreContext)
    const [_identity, setIdentity] = useState<Identity>()
    const gateKeeperAddress = useContractAddress(GATEKEEPER_CONTRACT_ADDRESS_MAP)
    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (!identityString) {
            navigate("/")
            return
        }
        setIdentity(new Identity(identityString))
    }, [])

    useEffect(() => {
        if (_users && _users.length > 0) {
            setLogs(`${_users.length} user${_users.length > 1 ? "s" : ""} retrieved from the group 🤙🏽`)
        }
    }, [_users])
    const userHasJoined = useCallback(
        (identity: Identity) => _users?.includes(identity.commitment.toString()),
        [_users]
    )

    const [emailFull, setEmailFull] = useState("")

    const { generateProof, processedProof, status } = useZkEmail<readonly [bigint, bigint, bigint, bigint, bigint]>({
        circuitId: PR_CIRCUIT_ID,
        getProofInputs: getPrProofInputs,
        identity: _identity!
    })

    const [txState, setTxState] = useState(TransactionState.INITIAL)
    const joinContributors = useCallback(async () => {
        if (txState !== TransactionState.INITIAL || !gateKeeperAddress || !processedProof) return
        try {
            setTxState(TransactionState.PREPARING_TRANSACTION)
            const { request } = await prepareWriteContract({
                address: gateKeeperAddress,
                abi: gateKeeperABI,
                functionName: "joinContributors",
                args: [processedProof]
            })
            setTxState(TransactionState.AWAITING_USER_APPROVAL)
            const { hash } = await writeContract(request)
            setTxState(TransactionState.AWAITING_TRANSACTION)
            await waitForTransaction({
                hash
            })
            alert("transaction completed!")
        } catch (e) {
            console.log(e)
            alert(`Error: ${String(e)}`)
        }
        setTxState(TransactionState.INITIAL)
    }, [txState, gateKeeperAddress, processedProof])

    return (
        <>
            <Heading as="h2" size="xl" mb={3}>
                Contributors Club 💻
            </Heading>
            <PageBodyContainer>
                <Stack spacing={2}>
                    <Text color="primary.500" lineHeight="2rem" fontSize="lg">
                        But first you need to prove your a contributor. upload an email you received that shows your PR
                        was merged into main. 📧
                    </Text>
                </Stack>
                <Divider pt="5" borderColor="gray.500" />
                <HStack py="5" justify="space-between">
                    <Text fontWeight="bold" fontSize="lg">
                        Total Contributors ({_users ? _users.length : "..."})
                    </Text>
                    <Button leftIcon={<IconRefreshLine />} variant="link" color="text.700" onClick={refreshUsers}>
                        Refresh
                    </Button>
                </HStack>
                <EmailInput emailFull={emailFull} setEmailFull={setEmailFull} />
                <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        mb={6}
                        fontWeight="bold"
                        justifyContent="left"
                        px="4"
                        disabled={
                            status === ZkProofStatus.GENERATING || txState === TransactionState.AWAITING_TRANSACTION
                        }
                        onClick={() => {
                            if (processedProof) {
                                if (txState === TransactionState.INITIAL) {
                                    joinContributors()
                                }
                            } else if (status === ZkProofStatus.INITIAL) {
                                generateProof(emailFull)
                            }
                        }}
                    >
                        {status === ZkProofStatus.INITIAL && "Generate Proof"}
                        {status === ZkProofStatus.GENERATING && "Preparing ZK proof..."}
                        {status === ZkProofStatus.READY &&
                            txState === TransactionState.INITIAL &&
                            "Proof ready! click to join"}
                        {txState === TransactionState.AWAITING_USER_APPROVAL && "Confirm transaction"}
                        {txState === TransactionState.AWAITING_TRANSACTION && "Waiting for transaction"}
                    </Button>
                </div>
                {_users && _users.length > 0 && (
                    <VStack spacing="2" align="left" maxHeight="300px" overflowY="auto">
                        {_users.map((user, i) => (
                            <HStack key={i} borderRadius="5px" p="3" borderWidth={1} whiteSpace="nowrap">
                                <Text textOverflow="ellipsis" overflow="hidden">
                                    {user}
                                </Text>
                            </HStack>
                        ))}
                    </VStack>
                )}
            </PageBodyContainer>

            <Divider borderColor="gray" marginTop="0 !important" />
            <Stepper
                step={2}
                onPrevClick={() => navigate("/")}
                onNextClick={_identity && userHasJoined(_identity) ? () => navigate("/proofs") : undefined}
            />
        </>
    )
}
