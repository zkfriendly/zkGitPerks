import hre, { ethers, network } from "hardhat"
async function deployPrVerifier() {
    const PrVerifierFactory = await ethers.getContractFactory("PrVerifier")
    const prVerifier = await PrVerifierFactory.deploy()

    await prVerifier.deployed()

    console.info(`PrVerifier contract has been deployed to: ${prVerifier.address}`)

    // wait 1 minute for the gatekeeper to be deployed
    await new Promise((resolve) => setTimeout(resolve, 60000))

    // don't verify if network is hardhat
    if (network.name !== "hardhat") {
        await hre.run("verify:verify", {
            address: prVerifier.address,
            constructorArguments: []
        })
    }

    return prVerifier
}

async function deployGateKeeper(semaphoreAddress: string, prVerifierAddress: string) {
    const GateKeeperFactory = await ethers.getContractFactory("GateKeeper")

    const args = [
        semaphoreAddress,
        prVerifierAddress,
        "0x0000000000000000000000006f614465766974616e2f796c646e656972666b7a",
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    ]

    //@ts-ignore
    const gateKeeper = await GateKeeperFactory.deploy(...args)

    await gateKeeper.deployed()

    console.info(`GateKeeper contract has been deployed to: ${gateKeeper.address}`)

    // wait 1 minute for the gatekeeper to be deployed
    await new Promise((resolve) => setTimeout(resolve, 60000))

    // don't verify if network is hardhat
    if (network.name !== "hardhat") {
        await hre.run("verify:verify", {
            address: gateKeeper.address,
            constructorArguments: args
        })
    }
}

async function deploy() {
    // const prVerifier = await deployPrVerifier()
    await deployGateKeeper("0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131", "0x9Df93523d1F1961F0c4e493dd948432bAE7a4127")
}

deploy()
    .then(() => process.exit(0))
    .catch(console.log)
