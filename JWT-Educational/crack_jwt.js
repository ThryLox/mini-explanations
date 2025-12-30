const crypto = require('crypto');

// Generate a target token dynamically to ensure valid signature
const secretToCrack = "iloveyou";
const header = { alg: "HS256", typ: "JWT" };
const payload = { sub: "123", name: "Alice", admin: false };

const headerB64 = base64UrlEncode(JSON.stringify(header));
const payloadB64 = base64UrlEncode(JSON.stringify(payload));
const targetToken = headerB64 + "." + payloadB64 + "." + sign(headerB64, payloadB64, secretToCrack);

console.log("📝 Generated Target Token:", targetToken);

// A small wordlist of common passwords
const wordlist = [
    "123456",
    "password",
    "12345678",
    "qwerty",
    "123456789",
    "12345",
    "iloveyou", // <--- The correct secret
    "princess",
    "admin",
    "secret"
];

// --- HELPER FUNCTIONS ---

function base64UrlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function sign(header, payload, secret) {
    const data = header + "." + payload;
    const signature = crypto.createHmac('sha256', secret)
        .update(data)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return signature;
}

function crackJWT(token) {
    console.log("🔨 Starting JWT Cracker...");
    console.log(`🎯 Target: ${token.substring(0, 20)}...`);

    const [headerB64, payloadB64, signatureB64] = token.split('.');

    if (!headerB64 || !payloadB64 || !signatureB64) {
        console.error("❌ Invalid JWT format");
        return;
    }

    const startTime = Date.now();
    let attempts = 0;

    for (const secret of wordlist) {
        attempts++;
        // process.stdout.write(`\rTrying: ${secret.padEnd(20)}`);

        const calculatedSig = sign(headerB64, payloadB64, secret);

        if (calculatedSig === signatureB64) {
            const timeTaken = Date.now() - startTime;
            console.log(`\n\n✅ SECRET FOUND: "${secret}"`);
            console.log(`Stats: ${attempts} attempts in ${timeTaken}ms`);
            return;
        }
    }

    console.log("\n\n❌ Secret not found in wordlist.");
}

// --- EXECUTE ---
crackJWT(targetToken);
