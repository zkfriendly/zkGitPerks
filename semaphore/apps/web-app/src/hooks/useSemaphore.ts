import { SemaphoreEthers, SemaphoreSubgraph } from "@semaphore-protocol/data"
import { BigNumber, utils } from "ethers"
import { useCallback, useState } from "react"
import { SemaphoreContextType } from "../context/SemaphoreContext"
import { useContractAddress } from "./useContractAddress"
import { SEMAPHORE_CONTRACT_ADDRESS_MAP } from "../constants/addresses"

const ethereumNetwork =
    // @ts-ignore
    import.meta.env.VITE_DEFAULT_NETWORK === "localhost"
        ? "http://localhost:8545"
        : // @ts-ignore
          import.meta.env.VITE_DEFAULT_NETWORK

export default function useSemaphore({ groupId }: { groupId: string }): SemaphoreContextType {
    const semaphoreAddress = useContractAddress(SEMAPHORE_CONTRACT_ADDRESS_MAP)
    const [_users, setUsers] = useState<any[]>([])
    const [_feedback, setFeedback] = useState<string[]>([])

    const refreshUsers = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreSubgraph("https://api.studio.thegraph.com/query/65978/semaphore/version/latest")
        const gp = await semaphore.getGroup(groupId, { members: true })
        const members = gp.members
        console.log(gp.members)
        // setUsers(members)
    }, [])

    const addUser = useCallback(
        (user: any) => {
            setUsers([..._users, user])
        },
        [_users]
    )

    const refreshFeedback = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreSubgraph("https://api.studio.thegraph.com/query/65978/semaphore/version/latest")

        // const proofs = await semaphore.getGroupVerifiedProofs(groupId)

        // setFeedback(proofs.map(({ signal }: any) => utils.parseBytes32String(BigNumber.from(signal).toHexString())))
    }, [])

    const addFeedback = useCallback(
        (feedback: string) => {
            setFeedback([..._feedback, feedback])
        },
        [_feedback]
    )

    return {
        _users,
        _feedback,
        refreshUsers,
        addUser,
        refreshFeedback,
        addFeedback
    }
}
