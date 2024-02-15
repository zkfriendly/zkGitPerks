import { useState } from "react"
import DragAndDropTextBox from "../components/DragAndDropTextBox"
import { Button, Text, Textarea, VStack } from "@chakra-ui/react"
import IconAddCircleFill from "../icons/IconAddCircleFill"
import { Identity } from "@semaphore-protocol/identity"

type ZkEmailProps = {
    identity: Identity | undefined
}

export function ZkEmail({ identity }: ZkEmailProps) {
    const [emailFull, setEmailFull] = useState<string>("")
    const [loading, setLoading] = useState(false)

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
                onClick={() => {}}
                isDisabled={loading || !identity || !emailFull}
                leftIcon={<IconAddCircleFill />}
            >
                Generate zk proof
            </Button>
        </>
    )
}
