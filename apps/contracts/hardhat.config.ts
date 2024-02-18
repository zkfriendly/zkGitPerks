import "@nomicfoundation/hardhat-chai-matchers"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "@semaphore-protocol/hardhat"
import "@typechain/hardhat"
import { config as dotenvConfig } from "dotenv"
import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/config"
import { NetworksUserConfig } from "hardhat/types"
import { resolve } from "path"
import "solidity-coverage"
import { config } from "./package.json"
import "./tasks/deploy"

dotenvConfig({ path: resolve(__dirname, "../../.env") })
dotenvConfig({ path: ".env" })

function getNetworks(): NetworksUserConfig {
    if (!process.env.INFURA_API_KEY || !process.env.ETHEREUM_PRIVATE_KEY) {
        return {}
    }

    const accounts = [`0x${process.env.ETHEREUM_PRIVATE_KEY}`, `0x${process.env.DEPLOYER_PRIVATE_KEY}`]
    const infuraApiKey = process.env.INFURA_API_KEY
    const alchemyApiKey = process.env.ALCHEMY_API_KEY

    return {
        goerli: {
            url: `https://goerli.infura.io/v3/${infuraApiKey}`,
            chainId: 5,
            accounts
        },
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
            chainId: 11155111,
            accounts
        },
        mumbai: {
            url: `https://polygon-mumbai.infura.io/v3/${infuraApiKey}`,
            chainId: 80001,
            accounts
        },
        "optimism-goerli": {
            url: `https://optimism-goerli.infura.io/v3/${infuraApiKey}`,
            chainId: 420,
            accounts
        },
        "arbitrum-goerli": {
            url: "https://goerli-rollup.arbitrum.io/rpc",
            chainId: 421613,
            accounts
        },
        arbitrum: {
            url: "https://arb1.arbitrum.io/rpc",
            chainId: 42161,
            accounts
        }
    }
}

const accounts = [`0x${process.env.DEPLOYER_PRIVATE_KEY}`]
const alchemyApiKey = process.env.ALCHEMY_API_KEY

const hardhatConfig: HardhatUserConfig = {
    solidity: config.solidity,
    paths: {
        sources: config.paths.contracts,
        tests: config.paths.tests,
        cache: config.paths.cache,
        artifacts: config.paths.build.contracts
    },
    networks: {
        hardhat: {
            chainId: 1337
        },
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
            chainId: 11155111,
            accounts
        },
        scrollSepolia: {
            url: "https://sepolia-rpc.scroll.io/" || "",
            accounts
        },
        ...getNetworks()
    },
    gasReporter: {
        currency: "USD",
        enabled: process.env.REPORT_GAS === "true",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },
    typechain: {
        outDir: config.paths.build.typechain,
        target: "ethers-v5"
    },
    etherscan: {
        apiKey: {
            scrollSepolia: 'abc',
        },
        customChains: [
            {
            network: 'scrollSepolia',
            chainId: 534351,
            urls: {
                apiURL: 'https://sepolia-blockscout.scroll.io/api',
                browserURL: 'https://sepolia-blockscout.scroll.io/',
                
            },
            },
        ],
    },
}

export default hardhatConfig
