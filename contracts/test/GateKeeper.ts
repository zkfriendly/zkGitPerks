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
} from "../build/typechain";
import valid_proof_1 from "./sample_proof/valid_proof_1.json";
import valid_proof_2 from "./sample_proof/valid_proof_2.json";

import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("GateKeeper", () => {
  let gateKeeper: GateKeeper;
  let prVerifier: Groth16Verifier;
  let semaphoreContract: Semaphore;
  const users: Identity[] = [];

  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async () => {
    [user1, user2] = await ethers.getSigners();

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
      semaphore.address,
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

  it("should be able to join with valid proof", async () => {
    //@ts-ignore
    await gateKeeper.joinContributors(...valid_proof_1.calldata);
  });

  it("should not be able to use one email more than once", async () => {
    //@ts-ignore
    await gateKeeper.joinContributors(...valid_proof_1.calldata);

    await expect(
      //@ts-ignore
      gateKeeper.joinContributors(...valid_proof_1.calldata)
    ).to.be.revertedWithCustomError(gateKeeper, "EmailAlreadyRegistered");
  });

  it("should allow multiple users to join", async () => {
    //@ts-ignore
    await gateKeeper.joinContributors(...valid_proof_1.calldata);
    //@ts-ignore
    await gateKeeper.joinContributors(...valid_proof_2.calldata);
  });

  it("should allow users to join by donating", async () => {
    // await semaphoreContract.joinDonationGroup(;
  });
});
