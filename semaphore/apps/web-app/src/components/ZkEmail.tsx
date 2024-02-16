import { useContext, useState } from "react"
import { Button, Text, Textarea } from "@chakra-ui/react"
import { Identity } from "@semaphore-protocol/identity"
import axios from "axios"
import DragAndDropTextBox from "../components/DragAndDropTextBox"
import IconAddCircleFill from "../icons/IconAddCircleFill"
import LogsContext from "../context/LogsContext"

type ZkEmailProps = {
    identity: Identity
    circuitId: string
    getProofInputs: (emailFull: string, owner: string) => any
    onProofGenerated: (proof: any) => void
}

export function ZkEmail({ identity, circuitId, getProofInputs, onProofGenerated }: ZkEmailProps) {
    const [emailFull, setEmailFull] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const { setLogs } = useContext(LogsContext)

    const generateProof = async () => {
        setLoading(true)
        const proofInputs = await getProofInputs(emailFull, identity!.commitment.toString())
        console.log(proofInputs)
        // @ts-ignore
        const endponit = import.meta.env.VITE_SINDRI_API_URL
        // @ts-ignore
        const apiKey = import.meta.env.VITE_SINDRI_API_KEY

        const headers = {
            Accept: "application/json",
            Authorization: `Bearer ${apiKey}`
        }

        const data = {
            proof_input: JSON.stringify(await getProofInputs(emailFull, identity.commitment.toString())),
            perform_verify: true
        }

        axios
            .post(`${endponit}/circuit/${circuitId}/prove`, data, {
                headers
            })
            .then((res) => {
                setLogs(`Proof is being generated... 🤖 this could take a few minuts.`)

                const interval = setInterval(() => {
                    axios
                        .get(`${endponit}/proof/${res.data.proof_id}/detail`, {
                            headers: headers,
                            params: {
                                include_proof_input: false,
                                include_public: true,
                                include_verification_key: true,
                                include_proof: true
                            }
                        })
                        .then((res) => {
                            if (res.data.status === "Ready") {
                                setLogs(`Proof is ready! 🎉`)
                                clearInterval(interval)
                                onProofGenerated(res.data)
                            } else if (res.data.status === "Failed") {
                                setLogs(`Proof generation failed. 😭`)
                                clearInterval(interval)
                            }
                            setLoading(false)
                        })
                        .catch((err) => {
                            setLogs(`Error generating proof: ${err}`)
                            setLoading(false)
                        })
                }, 10000)
            })
            .catch((err) => {
                setLogs(`Error generating proof: ${err}`)
                setLoading(false)
            })
    }

    const onFileDrop = async (file: File) => {
        if (file.name.endsWith(".eml")) {
            const content = await file.text()
            setEmailFull(content)
        } else {
            alert("Only .eml files are allowed.")
        }
    }

    return (
        <>
            <DragAndDropTextBox onFileDrop={onFileDrop} />
            <Text>or copy paste full PR email with headers</Text>
            <Textarea value={emailFull} onChange={(e) => setEmailFull(e.target.value)}></Textarea>
            <Button
                w="100%"
                fontWeight="bold"
                justifyContent="left"
                colorScheme="primary"
                px="4"
                onClick={generateProof}
                isDisabled={loading || !identity || !emailFull}
                leftIcon={<IconAddCircleFill />}
            >
                Generate zk proof
            </Button>
        </>
    )
}
