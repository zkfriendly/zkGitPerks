import { ethers } from "hardhat"
import { Cowork, CoworkVerifier, GateKeeper, IERC20__factory } from "../build/typechain"
import { setupGateKeeper } from "./utils"
import { expect } from "chai"
import { MockContract, deployMockContract } from "ethereum-waffle"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber } from "ethers"
import { Identity } from "@semaphore-protocol/identity"
import prProof from "./sample_proof/pr_proof.json"
import coworkProof from "./sample_proof/cowork_proof.json"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"
import { config } from "../package.json"

describe("Cowork", async () => {
    let coworkContract: Cowork
    let gateKeeperContract: GateKeeper
    let coworkVerifier: CoworkVerifier
    let token: MockContract
    const ticketPrice: BigNumber = ethers.utils.parseEther("0.1")
    let signer: SignerWithAddress
    const user = new Identity(
        "0xf7c78877048e423e22cafb473dc6e1324ea9a9c2463ad7d7d58ca5ec98e94dfd751ab265e92acac16040d46a7ccfabd4f322ffe1bc9dc93144ed81735f04dc801c"
    )
    let gp: Group

    const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
    const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

    async function joinContributors(proof: any, commitment: bigint) {
        await gateKeeperContract.joinContributors(proof)
        gp.addMember(commitment)
    }

    beforeEach(async () => {
        ;[signer] = await ethers.getSigners()
        const { gateKeeper } = await setupGateKeeper()
        gateKeeperContract = gateKeeper
        token = await deployMockContract(signer, IERC20__factory.abi)
        const CoworkVerifierFactory = await ethers.getContractFactory("CoworkVerifier")
        coworkVerifier = (await CoworkVerifierFactory.deploy()) as CoworkVerifier

        const CoworkFactory = await ethers.getContractFactory("Cowork")
        coworkContract = await CoworkFactory.deploy(
            gateKeeperContract.address,
            token.address,
            ticketPrice,
            coworkVerifier.address
        )

        const gpId = await gateKeeperContract.CONTRIBUTORS_GROUP_ID()
        //@ts-ignore
        gp = new Group(gpId)
    })

    it("should have proper setup", async () => {
        expect(coworkContract.address).to.be.properAddress
        expect(await coworkContract.gateKeeper()).to.equal(gateKeeperContract.address)
        expect(await coworkContract.token()).to.equal(token.address)
        expect(await coworkContract.ticketPrice()).to.equal(ticketPrice)
    })

    it("should be able to claim with valid proof", async () => {
        await joinContributors(prProof.calldata, user.commitment)
        const rawSignal = ethers.utils.keccak256(coworkContract.address)
        const scope = await coworkContract.getScope()
        const commitmentProof = await generateProof(user, gp, scope, rawSignal, {
            wasmFilePath,
            zkeyFilePath
        })
        const gateKeeperProof = {
            merkleTreeRoot: commitmentProof.merkleTreeRoot,
            nullifierHash: commitmentProof.nullifierHash,
            proof: commitmentProof.proof
        }
        await token.mock.transfer.withArgs(signer.address, ticketPrice).returns(true)
        //@ts-ignore
        await coworkContract.connect(signer).claim(gateKeeperProof, coworkProof.calldata)
    })
})
