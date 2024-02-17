import { Button, Divider, Heading, HStack, Stack, Text, VStack } from "@chakra-ui/react"
import { Identity } from "@semaphore-protocol/identity"
import { useCallback, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { prepareWriteContract, waitForTransaction, writeContract } from "@wagmi/core"
import { Group } from "@semaphore-protocol/group"
import { keccak256 } from "viem"
import { generateProof as generateSemaphoreProof } from "@semaphore-protocol/proof"
import { useContractAddress } from "../hooks/useContractAddress"
import { GATEKEEPER_CONTRACT_ADDRESS_MAP, ZKBILL_CONTRACT_ADDRESS_MAP } from "../constants/addresses"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import IconRefreshLine from "../icons/IconRefreshLine"
import { getBillProofInputs } from "../lib/input"
import { ZKBILL_CIRCUIT_ID } from "../constants"
import { useGateKeeperContributorsGroupId, useZkBillGetScope, zkBillABI } from "../abis/types/generated"
import { TransactionState, ZkProofStatus } from "../types"
import useZkEmail from "../hooks/useZkEmail"
import EmailInput from "../components/EmailInput"

export default function GroupsPage() {
    const navigate = useNavigate()
    const { setLogs } = useContext(LogsContext)
    const { _users, refreshUsers } = useContext(SemaphoreContext)
    const [_identity, setIdentity] = useState<Identity>()
    const zkBillAddress = useContractAddress(ZKBILL_CONTRACT_ADDRESS_MAP)
    const gateKeeperAddress = useContractAddress(GATEKEEPER_CONTRACT_ADDRESS_MAP)

    const { data: groupId } = useGateKeeperContributorsGroupId({
        address: gateKeeperAddress
    })

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

    const { generateProof, processedProof, status } = useZkEmail<readonly [bigint, bigint, bigint, bigint]>({
        circuitId: ZKBILL_CIRCUIT_ID,
        getProofInputs: getBillProofInputs,
        identity: _identity!
    })

    const [txState, setTxState] = useState(TransactionState.INITIAL)

    const { data: scope } = useZkBillGetScope({
        address: zkBillAddress
    })

    const submitMailProof = useCallback(async () => {
        if (
            txState !== TransactionState.INITIAL ||
            !zkBillAddress ||
            !processedProof ||
            !_identity ||
            !groupId ||
            !_users ||
            !scope
        )
            return
        try {
            setTxState(TransactionState.PREPARING_TRANSACTION)

            const group = new Group(groupId.toString(), 20, _users)
            const signal = keccak256(zkBillAddress)
            const commitmentProof = await generateSemaphoreProof(_identity, group, scope, signal)
            const gateKeeperProof = {
                merkleTreeRoot: commitmentProof.merkleTreeRoot,
                nullifierHash: commitmentProof.nullifierHash,
                proof: commitmentProof.proof
            }

            const { request } = await prepareWriteContract({
                address: zkBillAddress,
                abi: zkBillABI,
                functionName: "claim",
                args: [gateKeeperProof, processedProof]
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
    }, [txState, zkBillAddress, processedProof, _identity, groupId, _users, scope])

    return (
        <>
            <Heading as="h2" size="xl">
                Contributors Club 💻
            </Heading>
            <Stack spacing={2}>
                <Text color="primary.500">
                    But first you need to prove your a contributor. upload an email you rceived that shows your PR was
                    merged into main. 📧
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
            <Button
                w="100%"
                fontWeight="bold"
                justifyContent="left"
                px="4"
                disabled={status === ZkProofStatus.GENERATING || txState === TransactionState.AWAITING_TRANSACTION}
                onClick={() => {
                    if (processedProof) {
                        if (txState === TransactionState.INITIAL) {
                            submitMailProof()
                        }
                    } else if (status === ZkProofStatus.INITIAL) {
                        generateProof(emailFull)
                    }
                }}
            >
                {status === ZkProofStatus.INITIAL && "Generate Proof"}
                {status === ZkProofStatus.GENERATING && "Preparing ZK proof..."}
                {status === ZkProofStatus.READY && txState === TransactionState.INITIAL && "Proof ready! click to join"}
                {txState === TransactionState.AWAITING_USER_APPROVAL && "Confirm transaction"}
                {txState === TransactionState.AWAITING_TRANSACTION && "Waiting for transaction"}
            </Button>
            {_users && _users.length > 0 && (
                <VStack spacing="3" px="3" align="left" maxHeight="300px" overflowY="scroll">
                    {_users.map((user, i) => (
                        <HStack key={i} p="3" borderWidth={1} whiteSpace="nowrap">
                            <Text textOverflow="ellipsis" overflow="hidden">
                                {user}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            )}
            <Divider pt="6" borderColor="gray" />

            <Stepper step={3} onPrevClick={() => navigate("/groups")} />
        </>
    )
}
