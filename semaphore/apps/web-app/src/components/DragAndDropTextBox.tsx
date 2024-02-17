import React from "react"
import { useDragAndDrop } from "../hooks/useDragAndDrop"
import styled from "styled-components"

type Props = {
    onFileDrop: (file: File) => void
}

const DragAndDropTextBoxWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px dashed #ccc;
    border-radius: 6px;
    padding: 20px;
`

const DragAndDropTextBox: React.FC<Props> = ({ onFileDrop }) => {
    const { dragging, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleDragEnd } = useDragAndDrop()

    return (
        <DragAndDropTextBoxWrapper
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={(e: any) => handleDrop(e, onFileDrop)}
        >
            {dragging ? <div>Drop here</div> : <div> drop .eml file here</div>}
        </DragAndDropTextBoxWrapper>
    )
}

export default DragAndDropTextBox
