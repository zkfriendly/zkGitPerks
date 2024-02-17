import hre, { ethers, network, run } from "hardhat"

const gateKeeperAddress = "0x267ce9b841cE44e96f46D840A19850af480A81E3"
const tokenAddress = "0x7984E363c38b590bB4CA35aEd5133Ef2c6619C40"
const packedUtils = "0x14CCd8b3ea6EC2dbF70043DFb32914f3E30aC4D5"

async function deployVerifier(factoryName: string) {
    const VerifierFactory = await ethers.getContractFactory(factoryName)
    const verifier = await VerifierFactory.deploy()
    await verifier.deployed()
    console.info(`${factoryName} contract has been deployed to: ${verifier.address}`)
    return verifier
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

async function deployZkBill() {
    // const verifier = await deployVerifier("ZkBillVerifier")
    const verifierAddress = "0x17798d86AFdAbc1010A95E2ae6DbaD187c89b55E"
    const PackedUtilsFactory = await ethers.getContractFactory("PackedUtils")
    const packedUtils = await PackedUtilsFactory.deploy()
    await packedUtils.deployed()
    console.info(`PackedUtils contract has been deployed to: ${packedUtils.address}`)
    const ZkBillFactory = await ethers.getContractFactory("ZkBill", {
        libraries: {
            PackedUtils: packedUtils.address
        }
    })
    const zkBill = await ZkBillFactory.deploy(
        gateKeeperAddress,
        tokenAddress,
        ethers.utils.parseEther("100"),
        verifierAddress
    )

    await zkBill.deployed()

    console.info(`ZkBill contract has been deployed to: ${zkBill.address}`)
}

async function deployHerokuBill() {
    const verifier = await deployVerifier("HerokuVerifier")
    const verifierAddress = verifier.address
    const ZkBillFactory = await ethers.getContractFactory("ZkBill", {
        libraries: {
            PackedUtils: packedUtils
        }
    })
    const zkBill = await ZkBillFactory.deploy(
        gateKeeperAddress,
        tokenAddress,
        ethers.utils.parseEther("80"),
        verifierAddress
    )

    await zkBill.deployed()

    console.info(`HerokuBill contract has been deployed to: ${zkBill.address}`)
}

deployHerokuBill()
    .then(() => process.exit(0))
    .catch(console.log)
