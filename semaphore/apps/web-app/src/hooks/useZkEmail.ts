import { useCallback, useContext, useEffect, useState } from "react"
import axios from "axios"
import { Identity } from "@semaphore-protocol/identity"
// @ts-ignore
import * as snarkjs from "snarkjs"
import LogsContext from "../context/LogsContext"
import { ProofObject, ZkProofStatus } from "../types"

type ZkEmailProps = {
    identity: Identity
    circuitId: string
    getProofInputs: (emailFull: string, owner: string) => any
}

// @ts-ignore
const endponit: string = import.meta.env.VITE_SINDRI_API_URL
// @ts-ignore
const apiKey: string = import.meta.env.VITE_SINDRI_API_KEY

const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`
}
export default function useZkEmail({ identity, circuitId, getProofInputs }: ZkEmailProps) {
    const [status, setStatus] = useState(ZkProofStatus.INITIAL)
    const { setLogs } = useContext(LogsContext)

    const [generatedProof, setGeneratedProof] = useState<ProofObject>()

    const generateProof = useCallback(
        async (emailFull: string) => {
            if (!emailFull || status !== ZkProofStatus.INITIAL) return
            setStatus(ZkProofStatus.GENERATING)

            const data = {
                proof_input: JSON.stringify(await getProofInputs(emailFull, identity.commitment.toString())),
                perform_verify: true
            }

            axios
                .post(`${endponit}/circuit/${circuitId}/prove`, data, {
                    headers
                })
                .then((res) => {
                    console.log(res.data)
                    setGeneratedProof(res.data)
                    setLogs(`Proof is being generated... 🤖 this could take a few minuts.`)
                })
                .catch((err) => {
                    setLogs(`Error generating proof: ${err}`)
                    setStatus(ZkProofStatus.INITIAL)
                })
        },
        [status, identity]
    )

    useEffect(() => {
        let interval: NodeJS.Timer | null = null
        if (generatedProof?.status === "Queued") {
            interval = setInterval(() => {
                axios
                    .get(`${endponit}/proof/${generatedProof.proof_id}/detail`, {
                        headers,
                        params: {
                            include_proof_input: false,
                            include_public: true,
                            include_verification_key: true,
                            include_proof: true
                        }
                    })
                    .then((verifyRes) => {
                        if (verifyRes.data.status === "Ready") {
                            console.log(verifyRes.data)
                            setLogs(`Proof is ready! 🎉`)
                            setGeneratedProof(verifyRes.data)
                            setStatus(ZkProofStatus.READY)
                        } else if (verifyRes.data.status === "Failed") {
                            setLogs(`Proof generation failed. 😭`)
                        }
                        if (interval) clearInterval(interval)
                    })
                    .catch((err) => {
                        setLogs(`Error generating proof: ${err}`)
                        setStatus(ZkProofStatus.INITIAL)
                    })
            }, 10000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [generatedProof])

    const [processedProof, setProcessedProof] = useState<
        | {
              _pA: readonly [bigint, bigint]
              _pB: readonly [readonly [bigint, bigint], readonly [bigint, bigint]]
              _pC: readonly [bigint, bigint]
              _pubSignals: readonly [bigint, bigint, bigint, bigint, bigint]
          }
        | undefined
    >(undefined)

    useEffect(() => {
        const rawProof = generatedProof?.proof
        const _pubSignals = generatedProof?.public
        if (rawProof && _pubSignals) {
            snarkjs.groth16.exportSolidityCallData(rawProof, _pubSignals).then((calldataStr: any) => {
                const calldata = JSON.parse(`[${calldataStr}]`)
                setProcessedProof({
                    _pA: calldata[0].map((x: string) => BigInt(x)) as [bigint, bigint],
                    _pB: calldata[1].map((x: string[]) => x.map((y) => BigInt(y))) as [
                        [bigint, bigint],
                        [bigint, bigint]
                    ],
                    _pC: calldata[2].map((x: string) => BigInt(x)) as [bigint, bigint],
                    _pubSignals: calldata[3].map((x: string) => BigInt(x)) as [bigint, bigint, bigint, bigint, bigint]
                })
            })
        }
    }, [generatedProof])

    return {
        generateProof,
        generatedProof,
        processedProof,
        status
    }
}
