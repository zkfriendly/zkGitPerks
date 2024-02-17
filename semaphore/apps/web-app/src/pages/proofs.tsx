import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    Divider,
    Heading,
    Highlight,
    HStack,
    Image,
    Stack,
    StackDivider,
    Text,
    useBoolean,
    VStack
} from "@chakra-ui/react"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { BigNumber, utils } from "ethers"
import { useCallback, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { GROUP_ID } from "../constants"
import Feedback from "../../contract-artifacts/Feedback.json"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import IconAddCircleFill from "../icons/IconAddCircleFill"
import IconRefreshLine from "../icons/IconRefreshLine"
import useRepositoryName from "../hooks/useRepositoryName"
import { PerkCard } from "../components/PerkCard"
import { getPrProofInputs } from "../lib/input"

export default function ProofsPage() {
    const navigate = useNavigate()
    const { setLogs } = useContext(LogsContext)
    const { _users, _feedback, refreshFeedback, addFeedback } = useContext(SemaphoreContext)
    const [_loading, setLoading] = useBoolean()
    const [_identity, setIdentity] = useState<Identity>()
    const repositoryName = useRepositoryName()

    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (!identityString) {
            navigate("/")
            return
        }

        setIdentity(new Identity(identityString))
    }, [])

    useEffect(() => {
        if (_feedback.length > 0) {
            setLogs(`${_feedback.length} feedback retrieved from the group 🤙🏽`)
        }
    }, [_feedback])

    const sendFeedback = useCallback(async () => {
        if (!_identity) {
            return
        }

        const feedback = prompt("Please enter your feedback:")

        if (feedback && _users) {
            setLoading.on()

            setLogs(`Posting your anonymous feedback...`)

            try {
                const group = new Group(GROUP_ID, 20, _users)

                const signal = BigNumber.from(utils.formatBytes32String(feedback)).toString()

                const { proof, merkleTreeRoot, nullifierHash } = await generateProof(_identity, group, GROUP_ID, signal)

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
                            functionName: "sendFeedback",
                            functionParameters: [signal, merkleTreeRoot, nullifierHash, proof]
                        })
                    })
                } else {
                    response = await fetch("api/feedback", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            feedback: signal,
                            merkleTreeRoot,
                            nullifierHash,
                            proof
                        })
                    })
                }

                if (response.status === 200) {
                    addFeedback(feedback)

                    setLogs(`Your feedback was posted 🎉`)
                } else {
                    setLogs("Some error occurred, please try again!")
                }
            } catch (error) {
                console.error(error)

                setLogs("Some error occurred, please try again!")
            } finally {
                setLoading.off()
            }
        }
    }, [_identity])

    return (
        <>
            <Heading as="h2" size="xl">
                You can choose from all the available perks 🎁
            </Heading>

            <Text pt="2" fontSize="md">
                You can now choose from all the available perks and enjoy the benefits of being a contributor to the{" "}
                {repositoryName && (
                    <a href={`https://github.com/${repositoryName}`} target="_blank" style={{ color: "#0072f0" }}>
                        <Highlight
                            query={[repositoryName]}
                            styles={{ px: "2", py: "1", rounded: "full", bg: "teal.100" }}
                        >
                            {repositoryName}
                        </Highlight>
                    </a>
                )}{" "}
                project.
            </Text>

            <Divider pt="5" borderColor="gray.500" />

            <Accordion allowToggle defaultIndex={0}>
                <PerkCard
                    title="TUM Blockchain Conference"
                    description="Get a free ticket to the TUM Blockchain Conference"
                    image="https://assets-global.website-files.com/631ad94cbdadc40fe03d6458/64a1e89791a37d7a89e28e71_mega-creator%20(14).svg"
                    details="This is a one-time offer of $ 120 which you can claim by providing your ticket purchase receipt."
                    circuitId="0"
                    identity={_identity!}
                    getProofInputs={getPrProofInputs}
                />
            </Accordion>

            <HStack py="5" justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    Feedback signals ({_feedback.length})
                </Text>
                <Button leftIcon={<IconRefreshLine />} variant="link" color="text.700" onClick={refreshFeedback}>
                    Refresh
                </Button>
            </HStack>

            <VStack divider={<StackDivider borderColor="gray.200" />} spacing={4} align="stretch"></VStack>

            <Box pb="5">
                <Button
                    w="100%"
                    fontWeight="bold"
                    justifyContent="left"
                    colorScheme="primary"
                    px="4"
                    onClick={sendFeedback}
                    isDisabled={_loading}
                    leftIcon={<IconAddCircleFill />}
                >
                    Send Feedback
                </Button>
            </Box>

            {_feedback.length > 0 && (
                <VStack spacing="3" align="left">
                    {_feedback.map((f, i) => (
                        <HStack key={i} p="3" borderWidth={1}>
                            <Text>{f}</Text>
                        </HStack>
                    ))}
                </VStack>
            )}

            <Divider pt="6" borderColor="gray" />

            <Stepper step={3} onPrevClick={() => navigate("/groups")} />
        </>
    )
}
