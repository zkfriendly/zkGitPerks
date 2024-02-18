import { Box, Stack, Text, Textarea, VStack } from "@chakra-ui/react"
import React from "react"
import DragAndDropTextBox from "../components/DragAndDropTextBox"

export default function EmailInput({
    emailFull,
    setEmailFull
}: {
    emailFull?: string
    setEmailFull?: React.Dispatch<React.SetStateAction<string>>
}) {
    const onFileDrop = async (file: File) => {
        if (file.name.endsWith(".eml")) {
            const content = await file.text()
            setEmailFull?.(content)
        } else {
            alert("Only .eml files are allowed.")
        }
    }

    return (
        <Stack width={750}>
            <DragAndDropTextBox onFileDrop={onFileDrop} />
            <Text my={2} textAlign={"center"}>
                or copy paste full PR email with headers bellow
            </Text>
            <Textarea
                placeholder={"Paste full PR email with headers"}
                mb={6}
                resize={"none"}
                value={emailFull}
                onChange={(e) => setEmailFull?.(e.target.value)}
            ></Textarea>
        </Stack>
    )
}
