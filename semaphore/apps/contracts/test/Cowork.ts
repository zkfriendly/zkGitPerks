import { ethers, run } from "hardhat"
import { Cowork, GateKeeper, IERC20__factory, PrVerifier } from "../build/typechain"
import { setupGateKeeper } from "./utils"
import { expect } from "chai"
import { MockContract, deployMockContract } from "ethereum-waffle"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber } from "ethers"

describe("Cowork", async () => {
    let coworkContract: Cowork
    let gateKeeperContract: GateKeeper
    let token: MockContract
    const ticketPrice: BigNumber = ethers.utils.parseEther("0.1")
    let signer: SignerWithAddress

    beforeEach(async () => {
        ;[signer] = await ethers.getSigners()
        const { gateKeeper } = await setupGateKeeper()
        gateKeeperContract = gateKeeper
        token = await deployMockContract(signer, IERC20__factory.abi)

        const CoworkFactory = await ethers.getContractFactory("Cowork")
        coworkContract = await CoworkFactory.deploy(gateKeeperContract.address, token.address, ticketPrice)
    })

    it("should have proper setup", async () => {
        expect(coworkContract.address).to.be.properAddress
        expect(await coworkContract.gateKeeper()).to.equal(gateKeeperContract.address)
        expect(await coworkContract.token()).to.equal(token.address)
        expect(await coworkContract.ticketPrice()).to.equal(ticketPrice)
    })
})
