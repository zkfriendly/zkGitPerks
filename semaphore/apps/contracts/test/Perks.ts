import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { formatBytes32String } from "ethers/lib/utils"
import { run } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { Feedback, GateKeeper, Semaphore, PrVerifier, IERC20__factory, Perks } from "../build/typechain"
import valid_proof_1 from "./sample_proof/valid_proof_1.json"
import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { config } from "../package.json"

describe("Perks", () => {
    let perks: Perks

    let user1: SignerWithAddress
    let user2: SignerWithAddress

    beforeEach(async () => {
        ;[user1, user2] = await ethers.getSigners()

        // deploy StringUtils library
        const PackedUtilsFactory = await ethers.getContractFactory("PackedUtils")
        const packedUtils = await PackedUtilsFactory.deploy()
        await packedUtils.deployed()

        const PerksFactory = await ethers.getContractFactory("Perks", {
            libraries: {
                PackedUtils: packedUtils.address
            }
        })
        perks = await PerksFactory.deploy()
    })

    it("should have proper gate keeper settings", async () => {
        expect(perks.address).to.be.properAddress
    })

    it("should be able to parse", async () => {
        const value = await perks.totalCharged(3224882)
        console.log(value)
    })
})
