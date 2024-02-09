import { bytesToBigInt, fromHex } from "@zk-email/helpers";
import { generateCircuitInputs } from "@zk-email/helpers";
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim";
import fs from "fs";
import path from "path";

const artifacts_dir = path.join(__dirname, "../artifacts");

function stringFromArray(data: number[]) {
  var count = data.length;
  var str = "";

  for (var index = 0; index < count; index += 1)
    str += String.fromCharCode(data[index]);

  return str;
}

export async function generatePrMergedIntoMainCircuitInputs(
  rawEmail: string,
  owner: string
) {
  const STRING_PRESELECTOR = "Merged #";
  const TO_SELECTOR = "to:";
  const MAX_HEADER_PADDED_BYTES = 2048;
  const MAX_BODY_PADDED_BYTES = 3072;

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

  const header = emailVerifierInputs.in_padded.map((x) => Number(x));
  const selectorBuffer = Buffer.from(TO_SELECTOR);
  const toIndex =
    Buffer.from(header).indexOf(selectorBuffer) + selectorBuffer.length;

  const inputJson = {
    ...emailVerifierInputs,
    to_index: toIndex.toString(),
    owner,
  };

  return inputJson;
}

(async function generateInputs() {
  const rawEmail = fs.readFileSync(
    path.join(__dirname, "../emls/pr.eml"),
    "utf8"
  );
  const address = bytesToBigInt(
    fromHex("0x743844f742168e0ace16E747745686bCC247146B")
  ).toString();
  const inputJson = await generatePrMergedIntoMainCircuitInputs(
    rawEmail,
    address
  );

  // input json path in artifacts
  const inputJsonPath = path.join(artifacts_dir, "input.json");

  fs.writeFileSync(inputJsonPath, JSON.stringify(inputJson));
})();
