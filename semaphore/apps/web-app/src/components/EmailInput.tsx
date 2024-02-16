import { Text, Textarea } from "@chakra-ui/react"
import React from "react"
import DragAndDropTextBox from "../components/DragAndDropTextBox"

export default function EmailInput({
    emailFull,
    setEmailFull
}: {
    emailFull: string
    setEmailFull: React.Dispatch<React.SetStateAction<string>>
}) {
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
        </>
    )
}
