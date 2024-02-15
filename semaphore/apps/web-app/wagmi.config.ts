import { defineConfig } from "@wagmi/cli"
import { react } from "@wagmi/cli/plugins"
import { Abi } from "viem"

import GateKeeperABI from "./src/abis/gateKeeper.json"

export default defineConfig({
    out: "src/abis/types/generated.ts",
    contracts: [
        {
            name: "GateKeeper",
            abi: GateKeeperABI as Abi
        }
    ],
    plugins: [react()]
})
