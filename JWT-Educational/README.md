# JWT Security & Cracking

## 🛡️ What is a JWT?
JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. It is widely used for **Authentication** (who you are) and **Authorization** (what you can do).

### Structure
A JWT consists of three parts separated by dots (`.`):
`xxxxx.yyyyy.zzzzz`

1.  **Header**: Algorithm & Token Type.
    ```json
    {
      "alg": "HS256",
      "typ": "JWT"
    }
    ```
2.  **Payload**: Data (Claims).
    ```json
    {
      "sub": "1234567890",
      "name": "John Doe",
      "admin": false
    }
    ```
3.  **Signature**: Verifies the token hasn't been tampered with.
    ```
    HMACSHA256(
      base64UrlEncode(header) + "." +
      base64UrlEncode(payload),
      secret
    )
    ```

---

## ⚠️ Common Vulnerabilities

### 1. Weak Secrets (Brute Force)
If the signing secret is weak (e.g., "secret", "123456", "password"), an attacker can brute-force it offline. Once they have the secret, they can sign their own tokens (e.g., set `"admin": true`).

### 2. The "None" Algorithm
Some libraries allow the `alg` header to be set to `none`. If the backend accepts this, an attacker can strip the signature and modify the payload freely.

### 3. Key Confusion (HMAC vs RSA)
If the server expects an RSA public key but the attacker forces HMAC (`HS256`), the server might try to verify the signature using its *public key* as the HMAC secret. Since the public key is known, the attacker can forge tokens.

---

## 🔓 Proof of Concept: JWT Cracker
Included in this repo is `crack_jwt.js`. It demonstrates how to brute-force a JWT signed with a weak secret.

### Usage
1.  Install dependencies (if any, or use standard node crypto).
2.  Run the script:
    ```bash
    node crack_jwt.js
    ```

### How it works
1.  Takes a target JWT.
2.  Parses the Header and Payload.
3.  Iterates through a wordlist of common passwords.
4.  Re-calculates the signature for each password.
5.  If the calculated signature matches the original, the secret is found!
