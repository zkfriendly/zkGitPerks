import { generateCircuitInputs } from "@zk-email/helpers"
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim"
import { rawEmailToBuffer } from "@zk-email/helpers/dist/input-helpers"

// async function getProofInputs(emailFull: string, owner: string) {
//     const STRING_PRESELECTOR = "Merged #"
//     const TO_SELECTOR = "to:"
//     const MAX_HEADER_PADDED_BYTES = 2048
//     const MAX_BODY_PADDED_BYTES = 3072

//     const emailBuffer = rawEmailToBuffer(emailFull) // Cleaned email as buffer

//     const dkimResult = await verifyDKIMSignature(emailBuffer)

//     const emailVerifierInputs = generateCircuitInputs({
//         rsaSignature: dkimResult.signature,
//         rsaPublicKey: dkimResult.publicKey,
//         body: dkimResult.body,
//         bodyHash: dkimResult.bodyHash,
//         message: dkimResult.message,
//         shaPrecomputeSelector: STRING_PRESELECTOR,
//         maxMessageLength: MAX_HEADER_PADDED_BYTES,
//         maxBodyLength: MAX_BODY_PADDED_BYTES
//     })

//     // const header = emailVerifierInputs.in_padded.map((x) => Number(x))
//     // const selectorBuffer = Buffer.from(TO_SELECTOR)
//     // const toIndex = Buffer.from(header).indexOf(selectorBuffer) + selectorBuffer.length

//     // const inputJson = {
//     //     ...emailVerifierInputs,
//     //     to_index: toIndex.toString(),
//     //     owner
//     // }

//     return {}
// }

// export default getProofInputs
