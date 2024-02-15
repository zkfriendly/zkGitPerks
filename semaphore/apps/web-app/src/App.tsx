import { BrowserRouter, Route, Routes } from "react-router-dom"
import React, { useEffect, useState } from "react"
import { Web3ReactProvider } from "@web3-react/core"
import { providers } from "ethers"
import { ChakraProvider, Container, HStack, Stack } from "@chakra-ui/react"
import useSemaphore from "./hooks/useSemaphore"
import ConnectWallet from "./components/ConnectWallet"
import SemaphoreContext from "./context/SemaphoreContext"
import LogsContext from "./context/LogsContext"
import theme from "./styles/index"
import IdentitiesPage from "./pages"
import ProofsPage from "./pages/proofs"
import GroupsPage from "./pages/groups"
import { GROUP_ID } from "./constants"

export default function App() {
    const semaphore = useSemaphore({ groupId: GROUP_ID })
    const [_logs, setLogs] = useState<string>("")

    useEffect(() => {
        semaphore.refreshUsers()
        semaphore.refreshFeedback()
    }, [])

    return (
        <BrowserRouter>
            <Web3ReactProvider getLibrary={(provider) => new providers.Web3Provider(provider)}>
                <ChakraProvider theme={theme}>
                    <HStack align="center" justify="right" p="2">
                        <ConnectWallet />
                    </HStack>

                    <Container maxW="lg" flex="1" display="flex" alignItems="center">
                        <Stack py="8" display="flex" width="100%">
                            <SemaphoreContext.Provider value={semaphore}>
                                <LogsContext.Provider
                                    value={{
                                        _logs,
                                        setLogs
                                    }}
                                >
                                    <Routes>
                                        <Route path="/" element={<IdentitiesPage />} />
                                        <Route path="/proofs" element={<ProofsPage />} />
                                        <Route path="/groups" element={<GroupsPage />} />
                                        <Route element={<>Not found</>} />
                                    </Routes>
                                </LogsContext.Provider>
                            </SemaphoreContext.Provider>
                        </Stack>
                    </Container>
                </ChakraProvider>
            </Web3ReactProvider>
        </BrowserRouter>
    )
}
