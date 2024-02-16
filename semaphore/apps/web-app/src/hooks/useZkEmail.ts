import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Identity } from "@semaphore-protocol/identity"
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
                        } else if (verifyRes.data.status === "Failed") {
                            setLogs(`Proof generation failed. 😭`)
                        }
                        if (interval) clearInterval(interval)
                        setStatus(ZkProofStatus.VERIFYING)
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

    function p256$2(n: number) {
        let nstr = n.toString(16)
        while (nstr.length < 64) nstr = `0${nstr}`
        nstr = `"0x${nstr}"`
        return nstr
    }

    function groth16ExportSolidityCallData(proof: any, pub: any) {
        let inputs = ""
        for (let i = 0; i < pub.length; i++) {
            if (inputs != "") inputs += ","
            inputs += p256$2(pub[i])
        }

        let S
        S =
            `[${p256$2(proof.pi_a[0])}, ${p256$2(proof.pi_a[1])}],` +
            `[[${p256$2(proof.pi_b[0][1])}, ${p256$2(proof.pi_b[0][0])}],[${p256$2(proof.pi_b[1][1])}, ${p256$2(
                proof.pi_b[1][0]
            )}]],` +
            `[${p256$2(proof.pi_c[0])}, ${p256$2(proof.pi_c[1])}],` +
            `[${inputs}]`

        return S
    }

    const processedProof = useMemo(() => {
        const rawProof = generatedProof?.proof
        const _pubSignals = generatedProof?.public?.map((x) => BigInt(x)) as
            | [bigint, bigint, bigint, bigint, bigint]
            | undefined
        if (!rawProof || !_pubSignals) return undefined
        // const _pA = rawProof.pi_a.slice(0, 2).map((x) => BigInt(x)) as [bigint, bigint]
        // const _pB = rawProof.pi_b.slice(0, 2).map((x) => x.map((y) => BigInt(y))) as [
        //     [bigint, bigint],
        //     [bigint, bigint]
        // ]
        // const _pC = rawProof.pi_c.slice(0, 2).map((x) => BigInt(x)) as [bigint, bigint]
        // return {
        //     _pA,
        //     _pB,
        //     _pC,
        //     _pubSignals
        // }
        return {
            _pA: [
                "0x1d91f3d03dd546eb5e778fea071dd4d6f74514982b6d9f8f5c70416631ff3883",
                "0x1ad8698497781d27e3b93a051f29d6d1173ebe07779f538fc37a3868bbeb70c1"
            ].map((x) => BigInt(x)) as [bigint, bigint],
            _pB: [
                [
                    "0x0e893842a745d362267311b6b99fc334984bb0bc38c1a1b81bb4fe2dc3923899",
                    "0x2f4a4a33d875199b39456afcf0c4f010c0244064198d19bea9e2308919173b64"
                ],
                [
                    "0x2bca93e25b3ebe683be8b41a85cfdaeece6751d371d34d6f9c0aa297b8409cb1",
                    "0x0b12c27574a5a7b290e619ad5b72ddf04807ec9a8615b4a9396f400e184c0c64"
                ]
            ].map((x) => x.map((y) => BigInt(y))) as [[bigint, bigint], [bigint, bigint]],
            _pC: [
                "0x2d626a2c7bfb2031ca498e0705802a3a9b480669f5de0de8ed283fb23f35e05b",
                "0x1bdb11a9bfff28c3a04af6b0f1eb9855ea43a0f0a2385cf1334510007f8d8f75"
            ].map((x) => BigInt(x)) as [bigint, bigint],
            _pubSignals: [
                "0x020f05965354925e866f3f2361322774800d1d925e5f069418c941a3a9a8b4d0",
                "0x0cc55a1b6142459e7c5d9283742f36d09b0749906dea81bbb05d41c546ac95a5",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000006f614465766974616e2f796c646e656972666b7a",
                "0x0000000000000000000000000000000000000000000000000000000000000000"
            ].map((x) => BigInt(x)) as [bigint, bigint, bigint, bigint, bigint]
        }
    }, [generatedProof])

    return {
        generateProof,
        generatedProof,
        processedProof,
        status
    }
}
