"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDKIMSignature = void 0;
const node_forge_1 = require("node-forge");
const dkim_verifier_1 = require("./dkim-verifier");
const tools_1 = require("./tools");
async function verifyDKIMSignature(email, domain = "", tryRevertARCChanges = true) {
    let dkimResult = await tryVerifyDKIM(email, domain);
    if (dkimResult.status.result !== "pass" && tryRevertARCChanges) {
        console.info("DKIM verification failed. Trying to verify after reverting forwarder changes...");
        const modified = await revertForwarderChanges(email.toString());
        dkimResult = await tryVerifyDKIM(modified, domain);
    }
    if (dkimResult.status.result !== "pass") {
        throw new Error(`DKIM signature verification failed for domain ${dkimResult.signingDomain}`);
    }
    const { publicKey, signature, status, body, bodyHash } = dkimResult;
    const pubKeyData = node_forge_1.pki.publicKeyFromPem(publicKey.toString());
    return {
        signature: BigInt("0x" + Buffer.from(signature, "base64").toString("hex")),
        message: status.signature_header,
        body: body,
        bodyHash: bodyHash,
        signingDomain: dkimResult.signingDomain,
        publicKey: BigInt(pubKeyData.n.toString()),
        selector: dkimResult.selector,
        algo: dkimResult.algo,
        format: dkimResult.format,
        modulusLength: dkimResult.modulusLength,
    };
}
exports.verifyDKIMSignature = verifyDKIMSignature;
async function tryVerifyDKIM(email, domain = "") {
    let dkimVerifier = new dkim_verifier_1.DkimVerifier({});
    await (0, tools_1.writeToStream)(dkimVerifier, email);
    let domainToVerifyDKIM = domain;
    if (!domainToVerifyDKIM) {
        if (dkimVerifier.headerFrom.length > 1) {
            throw new Error("Multiple From header in email and domain for verification not specified");
        }
        domainToVerifyDKIM = dkimVerifier.headerFrom[0].split("@")[1];
    }
    const dkimResult = dkimVerifier.results.find((d) => d.signingDomain === domainToVerifyDKIM);
    if (!dkimResult) {
        throw new Error(`DKIM signature not found for domain ${domainToVerifyDKIM}`);
    }
    if (dkimVerifier.headers) {
        Object.defineProperty(dkimResult, "headers", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: dkimVerifier.headers,
        });
    }
    return dkimResult;
}
function getHeaderValue(email, header) {
    const headerStartIndex = email.indexOf(`${header}: `) + header.length + 2;
    const headerEndIndex = email.indexOf('\n', headerStartIndex);
    const headerValue = email.substring(headerStartIndex, headerEndIndex);
    return headerValue;
}
function setHeaderValue(email, header, value) {
    return email.replace(getHeaderValue(email, header), value);
}
async function revertForwarderChanges(email) {
    // Google sets their own Message-ID and put the original one in X-Google-Original-Message-ID when forwarding
    const googleReplacedMessageId = getHeaderValue(email, "X-Google-Original-Message-ID");
    if (googleReplacedMessageId) {
        console.info("Setting X-Google-Original-Message-ID to Message-ID header...");
        email = setHeaderValue(email, "Message-ID", googleReplacedMessageId);
    }
    return email;
}
// export dkim functions
__exportStar(require("./dkim-verifier"), exports);
__exportStar(require("./message-parser"), exports);
__exportStar(require("./parse-dkim-headers"), exports);
__exportStar(require("./tools"), exports);
