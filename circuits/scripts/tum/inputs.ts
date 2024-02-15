import { generateCircuitInputs } from "@zk-email/helpers";
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim";
import fs from "fs";
import path from "path";

const artifacts_dir = path.join(__dirname, "../../artifacts/tum");

if (!fs.existsSync(artifacts_dir)) {
  fs.mkdirSync(artifacts_dir, { recursive: true });
}

export async function getInputs(rawEmail: string, owner: string) {
  const MAX_HEADER_PADDED_BYTES = 2048;

  const dkimResult = await verifyDKIMSignature(Buffer.from(rawEmail));

  const emailVerifierInputs = generateCircuitInputs({
    rsaSignature: dkimResult.signature,
    rsaPublicKey: dkimResult.publicKey,
    body: dkimResult.body,
    bodyHash: dkimResult.bodyHash,
    message: dkimResult.message,
    shaPrecomputeSelector: "",
    maxMessageLength: MAX_HEADER_PADDED_BYTES,
    maxBodyLength: 187392,
    ignoreBodyHashCheck: true,
  });

  const inputJson = {
    ...emailVerifierInputs,
    owner,
  };

  return inputJson;
}

(async function generateInputs() {
  const rawEmail = fs.readFileSync(
    path.join(__dirname, "../../emls/tum.eml"),
    "utf8"
  );
  const owner =
    "13255821893820536903335282929376140649646180444238593676033702344407594536519";
  const inputJson = await getInputs(rawEmail, owner);

  // input json path in artifacts
  const inputJsonPath = path.join(artifacts_dir, "input.json");

  fs.writeFileSync(inputJsonPath, JSON.stringify(inputJson));
})();
