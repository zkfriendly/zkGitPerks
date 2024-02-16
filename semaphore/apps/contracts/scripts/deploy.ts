import hre, { ethers, network, run } from "hardhat"

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
    await deployGateKeeper("0xf4C4821434c0B54Dd0c45953A8fF38f6D15c2166", "0x2D6f61a7D4Fc62169327B7B58F59Bf21c1CFd037")
}

deploy()
    .then(() => process.exit(0))
    .catch(console.log)
