import {Route, Routes, useLocation} from "react-router-dom"
import styled from "styled-components";
import React, {useState} from "react"
import {Button, ChakraProvider, Container, HStack, Spinner, Stack, Text, useColorMode} from "@chakra-ui/react"
import {ConnectButton} from "@rainbow-me/rainbowkit"
import useSemaphore from "./hooks/useSemaphore"
import SemaphoreContext from "./context/SemaphoreContext"
import LogsContext from "./context/LogsContext"
import theme from "../theme"
import IdentitiesPage from "./pages"
import ProofsPage from "./pages/proofs"
import GroupsPage from "./pages/groups"
import {useContractAddress} from "./hooks/useContractAddress"
import {GATEKEEPER_CONTRACT_ADDRESS_MAP} from "./constants/addresses"
import {useGateKeeperContributorsGroupId} from "./abis/types/generated"


const PageContainerWrapper = styled.div`
    height: 100vh;
    overflow: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-bottom: 56px;
`

const PageContainer = ({children}: { children: React.ReactNode }) => (
    <PageContainerWrapper>
        {children}
    </PageContainerWrapper>
)

function ColorMode() {
    const {colorMode, toggleColorMode} = useColorMode()
    return (
        <header>
            <Button borderRadius='12px' fontSize='15px' padding='20px' onClick={toggleColorMode}>Toggle {colorMode === "light" ? "Dark" : "Light"}</Button>
        </header>
    )
}

export default function App() {
    const location = useLocation()
    const gateKeeperAddress = useContractAddress(GATEKEEPER_CONTRACT_ADDRESS_MAP)
    const {data: groupId} = useGateKeeperContributorsGroupId({
        address: gateKeeperAddress
    })
    const semaphore = useSemaphore({groupId})
    const [_logs, setLogs] = useState<string>("")

    return (
        <ChakraProvider theme={theme}>
            <PageContainer>
                <HStack align="center" justify="right" p="2">
                    <ConnectButton/>
                    <ColorMode/>
                </HStack>

                <Container maxW="800" flex="1" display="flex" paddingTop="2rem">
                    <Stack pb="8" display="flex" width="100%">
                        <SemaphoreContext.Provider value={semaphore}>
                            <LogsContext.Provider
                                value={{
                                    _logs,
                                    setLogs
                                }}
                            >
                                <Routes>
                                    <Route path="/" element={<IdentitiesPage/>}/>
                                    <Route path="/proofs" element={<ProofsPage/>}/>
                                    <Route path="/groups" element={<GroupsPage/>}/>
                                    <Route element={<>Not found</>}/>
                                </Routes>
                            </LogsContext.Provider>
                        </SemaphoreContext.Provider>
                        <HStack
                            flexBasis="56px"
                            align="center"
                            justify="center"
                            spacing="4"
                            p="4"
                            position="absolute"
                            bottom="0"
                            right={0}
                            left={0}
                            bg={"gray.700"}
                            color="white"
                        >
                            {_logs.endsWith("...") && <Spinner color="primary.400"/>}
                            <Text fontWeight="bold">{_logs || `Current step: ${location.pathname}`}</Text>
                        </HStack>
                    </Stack>
                </Container>
            </PageContainer>
        </ChakraProvider>
    )
}
