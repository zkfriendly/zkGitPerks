import { useCallback, useEffect, useState } from "react"
import { SemaphoreSubgraph } from "@semaphore-protocol/data"
import { SemaphoreContextType } from "../context/SemaphoreContext"

export default function useSemaphore({ groupId }: { groupId: bigint | undefined }): SemaphoreContextType {
    const [_users, setUsers] = useState<string[] | null>(null)
    const [_feedback, setFeedback] = useState<string[]>([])

    const refreshUsers = useCallback(async (): Promise<void> => {
        if (!groupId) return
        const semaphore = new SemaphoreSubgraph("https://api.studio.thegraph.com/query/65978/semaphore/version/latest")
        const gp = await semaphore.getGroup(groupId.toString(), { members: true })
        console.log({ gp })

        if (gp?.members) {
            setUsers(gp.members)
        }
    }, [groupId])

    const addUser = useCallback((user: string) => {
        setUsers((prevValue) => (prevValue ? [...prevValue, user] : [user]))
    }, [])

    const refreshFeedback = useCallback(async (): Promise<void> => {
        // const semaphore = new SemaphoreSubgraph(ethereumNetwork, {
        //     // @ts-ignore
        //     address: semaphoreAddress
        // })
        //
        // const proofs = await semaphore.getGroupVerifiedProofs(groupId)
        //
        // setFeedback(proofs.map(({ signal }: any) => utils.parseBytes32String(BigNumber.from(signal).toHexString())))
    }, [])

    const addFeedback = useCallback(
        (feedback: string) => {
            setFeedback([..._feedback, feedback])
        },
        [_feedback]
    )

    useEffect(() => {
        refreshUsers()
    }, [refreshUsers])

    return {
        _users,
        _feedback,
        refreshUsers,
        addUser,
        refreshFeedback,
        addFeedback
    }
}
