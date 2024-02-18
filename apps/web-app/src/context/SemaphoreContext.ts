import React from "react"

export type SemaphoreContextType = {
    _users: string[] | null
    refreshUsers: () => Promise<void>
    addUser: (user: string) => void
}

export default React.createContext<SemaphoreContextType>({
    _users: [],
    refreshUsers: () => Promise.resolve(),
    addUser: () => {},
})
