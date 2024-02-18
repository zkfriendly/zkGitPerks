import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter } from "react-router-dom"
import { createConfig, WagmiConfig } from "wagmi"
import { createPublicClient, http } from "viem"
import { scrollSepolia } from "wagmi/chains"
import { darkTheme, getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import App from "./App"
import "./App.css"
import "@rainbow-me/rainbowkit/styles.css"

// @ts-ignore
const WALLETCONNECT_PROJECT_ID: string | undefined = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!WALLETCONNECT_PROJECT_ID) {
    throw Error("VITE_WALLETCONNECT_PROJECT_ID env not provided")
}

const { connectors } = getDefaultWallets({
    appName: "Git Perks",
    chains: [scrollSepolia],
    projectId: WALLETCONNECT_PROJECT_ID
})

const config = createConfig({
    autoConnect: true,
    publicClient: createPublicClient({
        chain: scrollSepolia,
        transport: http()
    }),
    connectors
})

ReactDOM.render(
    <React.StrictMode>
        <WagmiConfig config={config}>
            <RainbowKitProvider chains={[scrollSepolia]} theme={darkTheme()}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </RainbowKitProvider>
        </WagmiConfig>
    </React.StrictMode>,
    document.getElementById("root")
)
