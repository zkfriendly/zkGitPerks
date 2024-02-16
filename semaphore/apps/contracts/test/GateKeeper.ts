import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { formatBytes32String } from "ethers/lib/utils"
import { run } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { GateKeeper, Semaphore, PrVerifier, IERC20__factory } from "../build/typechain"
import valid_proof from "./sample_proof/pr_proof.json"
import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { config } from "../package.json"
import { setupGateKeeper } from "./utils"

describe("GateKeeper", () => {
    let gateKeeperContract: GateKeeper
    let prVerifierContract: PrVerifier
    let semaphoreContract: Semaphore
    const users: Identity[] = []

    let user1: SignerWithAddress
    let user2: SignerWithAddress

    beforeEach(async () => {
        ;[user1, user2] = await ethers.getSigners()

        const { gateKeeper, prVerifier, semaphore } = await setupGateKeeper()

        gateKeeperContract = gateKeeper
        prVerifierContract = prVerifier
        semaphoreContract = semaphore

        users.push(
            new Identity(
                "0xf7c78877048e423e22cafb473dc6e1324ea9a9c2463ad7d7d58ca5ec98e94dfd751ab265e92acac16040d46a7ccfabd4f322ffe1bc9dc93144ed81735f04dc801c"
            )
        )
    })

    it("should have proper gate keeper settings", async () => {
        expect(gateKeeperContract.address).to.be.properAddress
        expect(await gateKeeperContract.semaphore()).to.be.properAddress
        expect(await gateKeeperContract.semaphore()).to.equal(semaphoreContract.address)
    })

    describe("Contributors", () => {
        it("should be able to join with valid proof", async () => {
            //@ts-ignore
            await gateKeeperContract.joinContributors(valid_proof.calldata)
        })

        it("should not be able to use one email more than once", async () => {
            //@ts-ignore
            await gateKeeperContract.joinContributors(valid_proof.calldata)

            await expect(
                //@ts-ignore
                gateKeeperContract.joinContributors(valid_proof.calldata)
            ).to.be.revertedWithCustomError(gateKeeperContract, "EmailAlreadyRegistered")
        })

        describe("Signal Validation", () => {
            it("should validate contributor singal", async () => {
                const gpId = await gateKeeperContract.CONTRIBUTORS_GROUP_ID()
                //@ts-ignore
                const gp = new Group(gpId)

                //@ts-ignore
                await gateKeeperContract.joinContributors(valid_proof.calldata)
                gp.addMember(users[0].commitment)

                const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
                const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

                const signal = formatBytes32String("contributor")
                const scope = 0
                const proof = await generateProof(users[0], gp, scope, signal, {
                    wasmFilePath,
                    zkeyFilePath
                })

                //@ts-ignore
                await gateKeeperContract.validateContributorSignal([
                    signal,
                    scope,
                    proof.merkleTreeRoot,
                    proof.nullifierHash,
                    proof.proof
                ])
            })

            it("should not allow invalid contributor singal", async () => {
                const gpId = await gateKeeperContract.CONTRIBUTORS_GROUP_ID()
                //@ts-ignore
                const gp = new Group(gpId)

                //@ts-ignore
                await gateKeeperContract.joinContributors(valid_proof.calldata)
                gp.addMember(users[0].commitment)

                const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
                const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

                const signal = formatBytes32String("contributor")
                const scope = 0
                const proof = await generateProof(users[0], gp, scope, signal, {
                    wasmFilePath,
                    zkeyFilePath
                })

                await expect(
                    //@ts-ignore
                    gateKeeperContract.validateContributorSignal([
                        formatBytes32String("invalid-signal"),
                        scope,
                        proof.merkleTreeRoot,
                        proof.nullifierHash,
                        proof.proof
                    ])
                ).to.be.revertedWithCustomError(gateKeeperContract, "InvalidProof")
            })

            it("should not be able to validate a signal more than once", async () => {
                const gpId = await gateKeeperContract.CONTRIBUTORS_GROUP_ID()
                //@ts-ignore
                const gp = new Group(gpId)

                //@ts-ignore
                await gateKeeperContract.joinContributors(valid_proof.calldata)
                gp.addMember(users[0].commitment)

                const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
                const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`

                const signal = formatBytes32String("contributor")
                const scope = 0
                const proof = await generateProof(users[0], gp, scope, signal, {
                    wasmFilePath,
                    zkeyFilePath
                })

                //@ts-ignore
                await gateKeeperContract.validateContributorSignal([
                    signal,
                    scope,
                    proof.merkleTreeRoot,
                    proof.nullifierHash,
                    proof.proof
                ])

                await expect(
                    //@ts-ignore
                    gateKeeperContract.validateContributorSignal([
                        signal,
                        scope,
                        proof.merkleTreeRoot,
                        proof.nullifierHash,
                        proof.proof
                    ])
                ).to.be.revertedWithCustomError(semaphoreContract, "Semaphore__YouAreUsingTheSameNillifierTwice")
            })
        })
    })
})
