import {
    Button,
    Divider,
    Heading,
    HStack,
    Stack,
    Text,
    VStack,
    Image,
    ButtonGroup,
    Highlight,
    Box,
    AbsoluteCenter
} from "@chakra-ui/react"
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
import { Card, CardBody, CardFooter } from "@chakra-ui/card"

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

    const [emailFull, setEmailFull] = useState("")

    const [txState, setTxState] = useState(TransactionState.INITIAL)

    const { data: scope } = useZkBillGetScope({
        address: zkBillAddress
    })

    const { generateProof, processedProof, status } = useZkEmail<readonly [bigint, bigint, bigint, bigint]>({
        circuitId: ZKBILL_CIRCUIT_ID,
        getProofInputs: getBillProofInputs,
        identity: _identity!
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
                Available Perks 🎁
            </Heading>
            <Stack spacing={2}>
                <Text color="primary.500">You can choose from all the available perks and benefits here.</Text>
            </Stack>
            <Divider pt="5" borderColor="gray.500" />
            <VStack py="5" justify="space-between">
                <Card maxW="l">
                    <CardBody>
                        <Image
                            src="https://www.heroku.com/packs/media/pricing-app/images/heroku-grows-with-you-77626ea1bd07f9212d6906219381c956.png"
                            alt=""
                            borderRadius="lg"
                            height={200}
                            width={800}
                            objectFit="cover"
                        />
                        <Stack mt="6" spacing="3">
                            <Heading size="lg">Heroku Bill</Heading>
                            <Text>
                                <Heading size="md" lineHeight="tall">
                                    <Highlight
                                        query={["$ 100", "once a month"]}
                                        styles={{ px: "2", py: "1", rounded: "full", bg: "teal.100" }}
                                    >
                                        You can receive a reimbursement of upto $ 100 each time for your Heroku bills
                                        once a month by providing the invoice you receive each month.
                                    </Highlight>
                                </Heading>
                            </Text>
                        </Stack>
                    </CardBody>
                    <Box position="relative" padding="5">
                        <Divider />
                        <AbsoluteCenter px="4">Claim</AbsoluteCenter>
                    </Box>{" "}
                    <CardFooter>
                        <VStack>
                            <EmailInput emailFull={emailFull} setEmailFull={setEmailFull} />
                            <Button
                                width={800}
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
                                {status === ZkProofStatus.READY &&
                                    txState === TransactionState.INITIAL &&
                                    "Proof ready! click to claim"}
                                {txState === TransactionState.AWAITING_USER_APPROVAL && "Confirm transaction"}
                                {txState === TransactionState.AWAITING_TRANSACTION && "Waiting for transaction"}
                            </Button>
                        </VStack>
                    </CardFooter>
                </Card>
                <Divider orientation="horizontal" />
                <Card maxW="l">
                    <CardBody>
                        <Image
                            src="https://blog.ethereum.org/_ipx/w_1080,q_75/https%3A%2F%2Fstorage.googleapis.com%2Fethereum-hackmd%2Fupload_0ecdfe00edfb60b6c52af4cbdd81e461.jpg?url=https%3A%2F%2Fstorage.googleapis.com%2Fethereum-hackmd%2Fupload_0ecdfe00edfb60b6c52af4cbdd81e461.jpg&w=1080&q=75"
                            alt="Green double couch with wooden legs"
                            borderRadius="lg"
                            height={200}
                            width={800}
                            objectFit="cover"
                        />
                        <Stack mt="6" spacing="3">
                            <Heading size="lg">Devconnect Cowork Space</Heading>
                            <Text>
                                <Heading size="md" lineHeight="tall">
                                    <Highlight
                                        query={["one-time", "$ 15"]}
                                        styles={{ px: "2", py: "1", rounded: "full", bg: "teal.100" }}
                                    >
                                        This is a one-time offer of $ 15 reimbursement for Devconnect coworking space,
                                        which you can claim by providing the email you received for your purchase.
                                    </Highlight>
                                </Heading>
                            </Text>
                        </Stack>
                    </CardBody>
                    <Box position="relative" padding="5">
                        <Divider />
                        <AbsoluteCenter px="4">Claim</AbsoluteCenter>
                    </Box>{" "}
                    <CardFooter>
                        <EmailInput />
                    </CardFooter>
                </Card>
                <Card maxW="l">
                    <CardBody>
                        <Image
                            src="https://assets-global.website-files.com/631ad94cbdadc424bb3d6461/643c07ccaa88cbaad44212cf_TUM%20Blockchain%20Conference.png"
                            alt=""
                            borderRadius="lg"
                            height={200}
                            width={800}
                            objectFit="cover"
                        />
                        <Stack mt="6" spacing="3">
                            <Heading size="lg">TUM Blockchain Conference</Heading>
                            <Text>
                                <Heading size="md" lineHeight="tall">
                                    <Highlight
                                        query={["one-time", "$ 120"]}
                                        styles={{ px: "2", py: "1", rounded: "full", bg: "teal.100" }}
                                    >
                                        This is a one-time offer of $ 120 reimbursement for TUM Blockchain Conference
                                        ticket, which you can claim by providing the email you received for your
                                        purchase.
                                    </Highlight>
                                </Heading>
                            </Text>
                        </Stack>
                    </CardBody>
                    <Box position="relative" padding="5">
                        <Divider />
                        <AbsoluteCenter px="4">Claim</AbsoluteCenter>
                    </Box>{" "}
                    <CardFooter>
                        <EmailInput />
                    </CardFooter>
                </Card>
                <Divider orientation="horizontal" />
            </VStack>

            <Divider pt="6" borderColor="gray" />

            <Stepper step={3} onPrevClick={() => navigate("/groups")} />
        </>
    )
}
