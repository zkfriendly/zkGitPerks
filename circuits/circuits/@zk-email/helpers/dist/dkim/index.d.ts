/// <reference types="node" />
import { getSigningHeaderLines, parseDkimHeaders, parseHeaders } from "./tools";
export interface DKIMVerificationResult {
    publicKey: bigint;
    signature: bigint;
    message: Buffer;
    body: Buffer;
    bodyHash: string;
    signingDomain: string;
    selector: string;
    algo: string;
    format: string;
    modulusLength: number;
}
export declare function verifyDKIMSignature(email: Buffer | string, domain?: string, tryRevertARCChanges?: boolean): Promise<DKIMVerificationResult>;
export type SignatureType = 'DKIM' | 'ARC' | 'AS';
export type ParsedHeaders = ReturnType<typeof parseHeaders>;
export type Parsed = ParsedHeaders['parsed'][0];
export type ParseDkimHeaders = ReturnType<typeof parseDkimHeaders>;
export type SigningHeaderLines = ReturnType<typeof getSigningHeaderLines>;
export interface Options {
    signatureHeaderLine: string;
    signingDomain?: string;
    selector?: string;
    algorithm?: string;
    canonicalization: string;
    bodyHash?: string;
    signTime?: string | number | Date;
    signature?: string;
    instance: string | boolean;
    bodyHashedBytes?: string;
}
export * from "./dkim-verifier";
export * from "./message-parser";
export * from "./parse-dkim-headers";
export * from "./tools";
