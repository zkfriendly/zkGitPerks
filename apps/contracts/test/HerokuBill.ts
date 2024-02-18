import { ethers } from "hardhat"
import { GateKeeper, HerokuVerifier, IERC20__factory, ZkBill, ZkBillVerifier } from "../build/typechain"
import { setupGateKeeper } from "./utils"
import { expect } from "chai"
import { MockContract, deployMockContract } from "ethereum-waffle"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber } from "ethers"
import { Identity } from "@semaphore-protocol/identity"
import prProof from "./sample_proof/pr_proof.json"
import herokuProof from "./sample_proof/herokubill_proof.json"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"
import { config } from "../package.json"

describe("HerokuBill", async () => {
    let mainContract: ZkBill
    let gateKeeperContract: GateKeeper
    let verifier: HerokuVerifier
    let token: MockContract
    const maxRefund: BigNumber = ethers.utils.parseEther("110")
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
        const VerifierFactory = await ethers.getContractFactory("HerokuVerifier")
        verifier = (await VerifierFactory.deploy()) as HerokuVerifier
        const libFactory = await ethers.getContractFactory("PackedUtils")
        const lib = await libFactory.deploy()

        const MainFactory = await ethers.getContractFactory("ZkBill", {
            libraries: {
                PackedUtils: lib.address
            }
        })
        mainContract = await MainFactory.deploy(gateKeeperContract.address, token.address, maxRefund, verifier.address)

        const gpId = await gateKeeperContract.CONTRIBUTORS_GROUP_ID()
        //@ts-ignore
        gp = new Group(gpId)
    })

    it("should have proper setup", async () => {
        expect(mainContract.address).to.be.properAddress
        expect(await mainContract.gateKeeper()).to.equal(gateKeeperContract.address)
        expect(await mainContract.token()).to.equal(token.address)
        expect(await mainContract.maxRefund()).to.equal(maxRefund)
    })

    it("should be able to claim with valid proof", async () => {
        await joinContributors(prProof.calldata, user.commitment)
        const rawSignal = ethers.utils.keccak256(mainContract.address)
        const scope = await mainContract.getScope()
        const commitmentProof = await generateProof(user, gp, scope, rawSignal, {
            wasmFilePath,
            zkeyFilePath
        })
        const gateKeeperProof = {
            merkleTreeRoot: commitmentProof.merkleTreeRoot,
            nullifierHash: commitmentProof.nullifierHash,
            proof: commitmentProof.proof
        }
        await token.mock.transfer.withArgs(signer.address, ethers.utils.parseEther("110")).returns(true)
        await token.mock.decimals.returns(18)
        //@ts-ignore
        await mainContract.connect(signer).claim(gateKeeperProof, herokuProof.calldata)
    })
})
