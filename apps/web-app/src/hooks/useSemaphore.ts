import { useCallback, useEffect, useState } from "react"
import { SemaphoreSubgraph } from "@semaphore-protocol/data"
import { SemaphoreContextType } from "../context/SemaphoreContext"

export default function useSemaphore({ groupId }: { groupId: bigint | undefined }): SemaphoreContextType {
    const [_users, setUsers] = useState<string[] | null>(null)

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


    useEffect(() => {
        refreshUsers()
    }, [refreshUsers])

    return {
        _users,
        refreshUsers,
        addUser,
    }
}
