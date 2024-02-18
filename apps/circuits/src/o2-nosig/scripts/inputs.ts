import { generateCircuitInputs } from "@zk-email/helpers";
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim";
import fs from "fs";
import path from "path";

const artifacts_dir = path.join(__dirname, "../../../artifacts/o2");

if (!fs.existsSync(artifacts_dir)) {
  fs.mkdirSync(artifacts_dir, { recursive: true });
}

export async function getInputs(rawEmail: string, owner: string) {
  const STRING_PRESELECTOR = "Rechnungsbetrag:";
  const TOTAL_CHARGE_SELECTOR = "Rechnungsbetrag:";
  const MAX_HEADER_PADDED_BYTES = 2048;
  const MAX_BODY_PADDED_BYTES = 32896;

  console.log("Verifying DKIM signature...");

  const dkimResult = await verifyDKIMSignature(
    Buffer.from(rawEmail),
    "mailservices-sc.de"
  );

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

  const body = emailVerifierInputs.in_body_padded!.map((x) => Number(x));
  const selectorBuffer = Buffer.from(TOTAL_CHARGE_SELECTOR);
  const toIndex =
    Buffer.from(body).indexOf(selectorBuffer) + selectorBuffer.length;

  const inputJson = {
    ...emailVerifierInputs,
    to_index: toIndex.toString(),
    owner,
  };

  console.log("Inputs generated successfully!");

  return inputJson;
}

(async function generateInputs() {
  const rawEmail = fs.readFileSync(
    path.join(__dirname, "../../../emls/o2bill.eml"),
    "utf8"
  );
  const owner =
    "13255821893820536903335282929376140649646180444238593676033702344407594536519";
  const inputJson = await getInputs(rawEmail, owner);

  // input json path in artifacts
  const inputJsonPath = path.join(artifacts_dir, "input.json");

  fs.writeFileSync(inputJsonPath, JSON.stringify(inputJson));
})();
