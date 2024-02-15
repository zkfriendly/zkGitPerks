import {
    Button,
    Divider,
    Heading,
    Highlight,
    HStack,
    Stack,
    Text,
    Textarea,
    useBoolean,
    VStack
} from "@chakra-ui/react"
import { Identity } from "@semaphore-protocol/identity"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useContractAddress } from "../hooks/useContractAddress"
import { GATEKEEPER_CONTRACT_ADDRESS_MAP } from "../constants/addresses"
import Feedback from "../../contract-artifacts/Feedback.json"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import IconRefreshLine from "../icons/IconRefreshLine"
import DragAndDropTextBox from "../components/DragAndDropTextBox"
import IconAddCircleFill from "../icons/IconAddCircleFill"
import { useGateKeeperRepository } from "../abis/types/generated"

export default function GroupsPage() {
    const navigate = useNavigate()
    const { setLogs } = useContext(LogsContext)
    const { _users, refreshUsers, addUser } = useContext(SemaphoreContext)
    const [_loading, setLoading] = useBoolean()
    const [_identity, setIdentity] = useState<Identity>()
    const [emailFull, setEmailFull] = useState<string>("")
    const gateKeeperAddress = useContractAddress(GATEKEEPER_CONTRACT_ADDRESS_MAP)

    const { data: repositoryNameChunks } = useGateKeeperRepository({
        address: gateKeeperAddress
    })

    const repositoryName = useMemo(() => {
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

    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (!identityString) {
            navigate("/")
            return
        }

        setIdentity(new Identity(identityString))
    }, [])

    useEffect(() => {
        if (_users.length > 0) {
            setLogs(`${_users.length} user${_users.length > 1 ? "s" : ""} retrieved from the group 🤙🏽`)
        }
    }, [_users])

    const joinGroup = useCallback(async () => {
        if (!_identity) {
            return
        }

        setLoading.on()
        setLogs(`Joining the Feedback group...`)

        let response: any

        // @ts-ignore
        if (import.meta.env.VITE_OPENZEPPELIN_AUTOTASK_WEBHOOK) {
            // @ts-ignore
            response = await fetch(import.meta.env.VITE_OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    abi: Feedback.abi,
                    // @ts-ignore
                    address: import.meta.env.VITE_FEEDBACK_CONTRACT_ADDRESS,
                    functionName: "joinGroup",
                    functionParameters: [_identity.commitment.toString()]
                })
            })
        } else {
            response = await fetch("api/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identityCommitment: _identity.commitment.toString()
                })
            })
        }

        if (response.status === 200) {
            addUser(_identity.commitment.toString())

            setLogs(`You joined the Feedback group event 🎉 Share your feedback anonymously!`)
        } else {
            setLogs("Some error occurred, please try again!")
        }

        setLoading.off()
    }, [_identity])

    const userHasJoined = useCallback((identity: Identity) => _users.includes(identity.commitment.toString()), [_users])

    const onFileDrop = async (file: File) => {
        if (file.name.endsWith(".eml")) {
            const content = await file.text()
            setEmailFull(content)
        } else {
            alert("Only .eml files are allowed.")
        }
    }

    const generateEmailProof = useCallback(async () => {
        setLoading.on()

        setLoading.off()
    }, [])

    return (
        <>
            <Heading as="h2" size="xl">
                Contributors Club 💻
            </Heading>
            <Stack spacing={2}>
                <Text color="green.900">
                    Join the{" "}
                    {repositoryName && (
                        <a href={`https://github.com/${repositoryName}`} target="_blank" style={{ color: "#0072f0" }}>
                            {repositoryName}
                        </a>
                    )}{" "}
                    contributors club to enjoy all the available perks and benefits. You can{" "}
                    <Highlight query={["anonymously"]} styles={{ px: "2", py: "1", rounded: "full", bg: "teal.100" }}>
                        anonymously
                    </Highlight>
                    claim reimbursements on event tickets, travel expenses, and much more. 💰
                </Text>
                <Text color="blue.500">
                    But first you need to prove your a contributor. upload an email you rceived that shows your PR was
                    merged into main. 📧
                </Text>
            </Stack>
            <Divider pt="5" borderColor="gray.500" />
            <HStack py="5" justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    Total Contributors ({_users.length})
                </Text>
                <Button leftIcon={<IconRefreshLine />} variant="link" color="text.700" onClick={refreshUsers}>
                    Refresh
                </Button>
            </HStack>
            <DragAndDropTextBox onFileDrop={onFileDrop} />
            <Text>or copy paste full PR email with headers</Text>
            <Textarea value={emailFull} onChange={(e) => setEmailFull(e.target.value)}></Textarea>

            <Button
                w="100%"
                fontWeight="bold"
                justifyContent="left"
                colorScheme="primary"
                px="4"
                onClick={generateEmailProof}
                isDisabled={_loading || !_identity || userHasJoined(_identity) || !emailFull}
                leftIcon={<IconAddCircleFill />}
            >
                Generate zk proof
            </Button>
            {_users.length > 0 && (
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
            <Stepper
                step={2}
                onPrevClick={() => navigate("/")}
                onNextClick={_identity && userHasJoined(_identity) ? () => navigate("/proofs") : undefined}
            />
        </>
    )
}
