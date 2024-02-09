import { bytesToBigInt, fromHex } from "@zk-email/helpers";
import { generateCircuitInputs } from "@zk-email/helpers";
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim";
import fs from "fs";
import path from "path";

export async function generatePrMergedIntoMainCircuitInputs(
  rawEmail: string,
  address: string
) {
  const STRING_PRESELECTOR = "Merged #";
  const MAX_HEADER_PADDED_BYTES = 1024;
  const MAX_BODY_PADDED_BYTES = 1536;

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
  const usernameIndex =
    Buffer.from(bodyRemaining).indexOf(selectorBuffer) + selectorBuffer.length;

  const inputJson = {
    ...emailVerifierInputs,
    twitter_username_idx: usernameIndex.toString(),
    address,
  };
  return inputJson;
}

(async function generateInputs() {
  const rawEmail = fs.readFileSync(
    path.join(__dirname, "./emls/rawEmail.eml"),
    "utf8"
  );
  const address = bytesToBigInt(
    fromHex("0x743844f742168e0ace16E747745686bCC247146B")
  ).toString();
  const inputJson = await generatePrMergedIntoMainCircuitInputs(
    rawEmail,
    address
  );

  fs.writeFileSync("./input.json", JSON.stringify(inputJson));
})();
