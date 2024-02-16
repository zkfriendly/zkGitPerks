import { ethers, run } from "hardhat"

export async function setupGateKeeper() {
    const { semaphore } = await run("deploy:semaphore", {
        logs: false
    })

    const Factory = await ethers.getContractFactory("PrVerifier")
    const prVerifier = await Factory.deploy()

    const GateKeeperFactory = await ethers.getContractFactory("GateKeeper")
    const gateKeeper = await GateKeeperFactory.deploy(
        semaphore.address,
        prVerifier.address,
        "0x0000000000000000000000006f614465766974616e2f796c646e656972666b7a",
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    )
    await gateKeeper.deployed()

    return { gateKeeper, semaphore, prVerifier }
}
