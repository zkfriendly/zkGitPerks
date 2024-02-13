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
import valid_proof from "./sample_proof/valid_proof.json";

import { ethers } from "hardhat";

describe("GateKeeper", () => {
  let gateKeeper: GateKeeper;
  let prVerifier: Groth16Verifier;
  let semaphoreContract: Semaphore;
  const users: Identity[] = [];

  beforeEach(async () => {
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
      prVerifier.address
    );
    semaphoreContract = semaphore;

    users.push(new Identity());
    users.push(new Identity());
  });

  it("should have proper gate keeper settings", async () => {
    expect(gateKeeper.address).to.be.properAddress;
    expect(await gateKeeper.semaphore()).to.be.properAddress;
    expect(await gateKeeper.semaphore()).to.equal(semaphoreContract.address);
  });

  it("should be able to join with valid proof", async () => {
    //@ts-ignore
    await gateKeeper.joinContributorsGroup(...valid_proof.calldata);
  });

  it("should not be able to use one email more than once", async () => {
    //@ts-ignore
    await gateKeeper.joinContributorsGroup(...valid_proof.calldata);

    await expect(
      //@ts-ignore
      gateKeeper.joinContributorsGroup(...valid_proof.calldata)
    ).to.be.revertedWithCustomError(gateKeeper, "EmailAlreadyRegistered");
  });
});
