import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { formatBytes32String } from "ethers/lib/utils"
import { run } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { Feedback, GateKeeper, Semaphore } from "../build/typechain"
import { config } from "../package.json"
import { ethers } from "hardhat"

describe("GateKeeper", () => {
    let gateKeeper: GateKeeper
    let semaphoreContract: Semaphore
    const users: Identity[] = []

    before(async () => {
        const { semaphore } = await run("deploy:semaphore", {
            logs: false
        })

        const GateKeeperFactory = await ethers.getContractFactory("GateKeeper")
        gateKeeper = await GateKeeperFactory.deploy(semaphore.address)
        semaphoreContract = semaphore

        users.push(new Identity())
        users.push(new Identity())
    })

    it("should have proper gate keeper settings", async () => {
        expect(gateKeeper.address).to.be.properAddress
        expect(await gateKeeper.semaphore()).to.be.properAddress
        expect(await gateKeeper.semaphore()).to.equal(semaphoreContract.address)
    })
})
