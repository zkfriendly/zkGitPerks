import { SemaphoreEthers } from "@semaphore-protocol/data"
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
        const semaphore = new SemaphoreEthers(ethereumNetwork, {
            address: semaphoreAddress
        })
        const members = await semaphore.getGroupMembers(groupId)
        setUsers(members)
    }, [])

    const addUser = useCallback(
        (user: any) => {
            setUsers([..._users, user])
        },
        [_users]
    )

    const refreshFeedback = useCallback(async (): Promise<void> => {
        const semaphore = new SemaphoreEthers(ethereumNetwork, {
            // @ts-ignore
            address: semaphoreAddress
        })

        const proofs = await semaphore.getGroupVerifiedProofs(groupId)

        setFeedback(proofs.map(({ signal }: any) => utils.parseBytes32String(BigNumber.from(signal).toHexString())))
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
