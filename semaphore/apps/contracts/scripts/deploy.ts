import hre, { ethers, network } from "hardhat"
async function deployPrVerifier() {
    const PrVerifierFactory = await ethers.getContractFactory("PrVerifier")
    const prVerifier = await PrVerifierFactory.deploy()

    await prVerifier.deployed()

    console.info(`PrVerifier contract has been deployed to: ${prVerifier.address}`)

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
    // const gateKeeper = await GateKeeperFactory.deploy(...args)

    // await gateKeeper.deployed()

    // console.info(`GateKeeper contract has been deployed to: ${gateKeeper.address}`)

    // don't verify if network is hardhat
    if (network.name !== "hardhat") {
        await hre.run("verify:verify", {
            address: "0x5Ee0D4761627084A8DEd0f25C8D8199860B32791",
            constructorArguments: args
        })
    }
}

async function deploy() {
    // const prVerifier = await deployPrVerifier()
    await deployGateKeeper("0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131", "0x67514950B3ad14cC5bD91Af6641B84e1Acaf2820")
}

deploy()
    .then(() => process.exit(0))
    .catch(console.log)
