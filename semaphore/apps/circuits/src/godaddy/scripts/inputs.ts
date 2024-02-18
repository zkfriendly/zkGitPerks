import { generateCircuitInputs } from "@zk-email/helpers";
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim";
import fs from "fs";
import path from "path";

const artifacts_dir = path.join(__dirname, "../../../artifacts/godaddy");

if (!fs.existsSync(artifacts_dir)) {
  fs.mkdirSync(artifacts_dir, { recursive: true });
}

export async function getInputs(rawEmail: string, owner: string) {
  const STRING_PRESELECTOR = ".XYZ Domain Registration";
  const MAX_HEADER_PADDED_BYTES = 2048;
  const MAX_BODY_PADDED_BYTES = 51200;

  console.log("Verifying DKIM signature...");

  const dkimResult = await verifyDKIMSignature(Buffer.from(rawEmail));

  const emailVerifierInputs = generateCircuitInputs({
    rsaSignature: dkimResult.signature,
    rsaPublicKey: dkimResult.publicKey,
    body: dkimResult.body,
    bodyHash: dkimResult.bodyHash,
    message: dkimResult.message,
    shaPrecomputeSelector: STRING_PRESELECTOR,
    maxMessageLength: MAX_HEADER_PADDED_BYTES,
    maxBodyLength: MAX_BODY_PADDED_BYTES,
  });

  const inputJson = {
    ...emailVerifierInputs,
    to_index: 0,
    owner,
  };

  console.log("Inputs generated successfully!");

  return inputJson;
}

(async function generateInputs() {
  const rawEmail = fs.readFileSync(
    path.join(__dirname, "../../../emls/domain.eml"),
    "utf8"
  );
  const owner =
    "13255821893820536903335282929376140649646180444238593676033702344407594536519";
  const inputJson = await getInputs(rawEmail, owner);

  // input json path in artifacts
  const inputJsonPath = path.join(artifacts_dir, "input.json");

  fs.writeFileSync(inputJsonPath, JSON.stringify(inputJson));
})();
