import { SupportedNetwork } from "@semaphore-protocol/data"
import { generateCircuitInputs } from "@zk-email/helpers"
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim"
import { rawEmailToBuffer } from "@zk-email/helpers/dist/input-helpers"

enum RevealType {
    HEADER = "header",
    BODY = "body"
}

export async function getPrProofInputs(emailFull: string, owner: string) {
    return getProofInputs(emailFull, "Merged #", "to:", RevealType.HEADER, 2048, 3072, owner)
}

export async function getBillProofInputs(emailFull: string, owner: string) {
    return getProofInputs(emailFull, "Your payment of $ ", "Your payment of $ ", RevealType.BODY, 512, 2048, owner)
}

export async function getHerokuProofInputs(emailFull: string, owner: string) {
    return getProofInputs(emailFull, "TOTAL CHARGE: $ ", "TOTAL CHARGE: $ ", RevealType.BODY, 2048, 13 * 1024, owner)
}

export async function getProofInputs(
    emailFull: string,
    preSelector: string,
    revealSelector: string,
    revealType: RevealType,
    maxMessageLength: number,
    maxBodyLength: number,
    owner: string
) {
    const emailBuffer = rawEmailToBuffer(emailFull)
    const dkimResult = await verifyDKIMSignature(emailBuffer)
    const emailVerifierInputs = generateCircuitInputs({
        rsaSignature: dkimResult.signature,
        rsaPublicKey: dkimResult.publicKey,
        body: dkimResult.body,
        bodyHash: dkimResult.bodyHash,
        message: dkimResult.message,
        shaPrecomputeSelector: preSelector,
        maxMessageLength,
        maxBodyLength
    })

    let toIndex

    if (revealType === RevealType.HEADER) {
        const header = emailVerifierInputs.in_padded.map((x) => Number(x))
        const selectorBuffer = Buffer.from(revealSelector)
        toIndex = Buffer.from(header).indexOf(selectorBuffer) + selectorBuffer.length
    } else {
        const body = emailVerifierInputs.in_body_padded!.map((x) => Number(x))
        const selectorBuffer = Buffer.from(revealSelector)
        toIndex = Buffer.from(body).indexOf(selectorBuffer) + selectorBuffer.length
    }

    return {
        ...emailVerifierInputs,
        to_index: toIndex.toString(),
        owner
    }
}

export function generateProof(proof_input: any, circuit_id: string) {
    // @ts-ignore
    const endponit = import.meta.env.VITE_SINDRIA_API_URL
    // @ts-ignore
    const api_key = import.meta.env.VITE_SINDRIA_API_KEY

    const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${api_key}`
    }
    const data = {
        proof_input,
        perform_verify: true
    }

    fetch(`${endponit}/circuits/${circuit_id}/prove`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res)
        })
        .catch((err) => {
            console.error(err)
        })
}
