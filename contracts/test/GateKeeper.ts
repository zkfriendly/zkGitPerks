import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";
import { generateProof } from "@semaphore-protocol/proof";
import { expect } from "chai";
import { formatBytes32String } from "ethers/lib/utils";
import { run } from "hardhat";
// @ts-ignore: typechain folder will be generated after contracts compilation
import {
  Feedback,
  GateKeeper,
  Semaphore,
  Groth16Verifier,
  IERC20__factory,
} from "../build/typechain";
import valid_proof_1 from "./sample_proof/valid_proof_1.json";
import valid_proof_2 from "./sample_proof/valid_proof_2.json";

import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockContract, deployMockContract } from "ethereum-waffle";

describe("GateKeeper", () => {
  let gateKeeper: GateKeeper;
  let prVerifier: Groth16Verifier;
  let semaphoreContract: Semaphore;
  let token: MockContract;
  const donationAmount = ethers.utils.parseEther("1");
  const users: Identity[] = [];

  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async () => {
    [user1, user2] = await ethers.getSigners();

    //@ts-ignore
    token = await deployMockContract(user1, IERC20__factory.abi);

    const { semaphore } = await run("deploy:semaphore", {
      logs: false,
    });

    const Groth16VerifierFactory = await ethers.getContractFactory(
      "Groth16Verifier"
    );

    prVerifier = await Groth16VerifierFactory.deploy();

    const GateKeeperFactory = await ethers.getContractFactory("GateKeeper");
    gateKeeper = await GateKeeperFactory.deploy(
      semaphore.address,
      prVerifier.address,
      token.address,
      donationAmount,
      "0x0000000000000000000000006f614465766974616e2f796c646e656972666b7a",
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
    semaphoreContract = semaphore;

    users.push(new Identity("1"));
    users.push(new Identity("2"));
  });

  it("should have proper gate keeper settings", async () => {
    expect(gateKeeper.address).to.be.properAddress;
    expect(await gateKeeper.semaphore()).to.be.properAddress;
    expect(await gateKeeper.semaphore()).to.equal(semaphoreContract.address);
  });

  describe("Contributors", () => {
    it("should be able to join with valid proof", async () => {
      const before = await gateKeeper.totalContributors();
      //@ts-ignore
      await gateKeeper.joinContributors(valid_proof_1.calldata);
      const after = await gateKeeper.totalContributors();
    });

    it("should not be able to use one email more than once", async () => {
      //@ts-ignore
      await gateKeeper.joinContributors(valid_proof_1.calldata);

      await expect(
        //@ts-ignore
        gateKeeper.joinContributors(valid_proof_1.calldata)
      ).to.be.revertedWith("EmailAlreadyRegistered");
    });

    it("should allow multiple users to join", async () => {
      let before = await gateKeeper.totalContributors();
      //@ts-ignore
      await gateKeeper.joinContributors(valid_proof_1.calldata);
      let after = await gateKeeper.totalContributors();
      expect(after).to.equal(before.add(1));

      before = after;
      //@ts-ignore
      await gateKeeper.joinContributors(valid_proof_2.calldata);
      after = await gateKeeper.totalContributors();
      expect(after).to.equal(before.add(1));
    });
  });

  describe("Donators", () => {
    it("should allow users to join by donating", async () => {
      await token.mock.transferFrom
        .withArgs(user1.address, gateKeeper.address, donationAmount)
        .returns(true);
      const before = await gateKeeper.totalDonators();
      await gateKeeper.joinDonators(users[0].commitment);
      const after = await gateKeeper.totalDonators();

      expect(after).to.equal(before.add(1));
    });
  });
});
