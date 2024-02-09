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

  const bodyRemaining = emailVerifierInputs.in_body_padded!.map((c) =>
    Number(c)
  );
  const selectorBuffer = Buffer.from(STRING_PRESELECTOR);
  const prIndex =
    Buffer.from(bodyRemaining).indexOf(selectorBuffer) + selectorBuffer.length;

  const inputJson = {
    ...emailVerifierInputs,
    pr_index: prIndex.toString(),
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
