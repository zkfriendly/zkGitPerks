import {
    AbsoluteCenter,
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
    Image,
    Stack,
    Text,
    VStack
} from "@chakra-ui/react"
import AppButton from "./AppButton"
import EmailInput from "./EmailInput"
import { useState } from "react"
import useZkEmail from "../hooks/useZkEmail"
import { Identity } from "@semaphore-protocol/identity"

// perk cards props

export interface PerkCardProps {
    title: string
    description: string
    details: string
    image: string
    circuitId: string
    identity: Identity
    getProofInputs: (email: string, commitment: string) => Promise<any>
}

export function PerkCard({ title, description, image, details, circuitId, getProofInputs, identity }: PerkCardProps) {
    const [emailFull, setEmailFull] = useState("")
    const { generateProof, processedProof, status } = useZkEmail({
        circuitId,
        getProofInputs,
        identity
    })
    return (
        <>
            <AccordionItem>
                <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                        <Heading size="md">{title}</Heading>
                    </Box>
                    <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                    <Card direction={{ base: "row" }} overflow="hidden" variant="outline">
                        <Image objectFit="cover" maxW={{ base: "100%", sm: "200px" }} src={image} alt={title} />

                        <CardBody>
                            <Text py="2">{description}</Text>
                            <Text py="2">{details}</Text>
                            <Box position="relative" padding="10">
                                <Divider />
                                <AbsoluteCenter bg="white" px="4">
                                    claim
                                </AbsoluteCenter>
                            </Box>
                            <VStack align="stretch">
                                <EmailInput emailFull={emailFull} setEmailFull={setEmailFull} />
                                <AppButton>Claim</AppButton>
                            </VStack>
                        </CardBody>

                        <CardFooter></CardFooter>
                    </Card>
                </AccordionPanel>
            </AccordionItem>
        </>
    )
}
