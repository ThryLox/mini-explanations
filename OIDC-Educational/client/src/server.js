import express from "express";
import session from "express-session";
import crypto from "crypto";
import jwt from "jsonwebtoken"; // NEW: For verifying ID Tokens

const app = express();
const PORT = 3000;
const CLIENT_ID = "oidc-client";
const REDIRECT_URI = "http://localhost:3000/callback";
const AUTH_SERVER = "http://localhost:4000";
const SCOPE = "openid profile email"; // Request OpenID scope
const OIDC_SECRET = "educational-oidc-secret-key-change-me"; // Shared secret

app.use(session({
    name: "oidc_client_session",
    secret: "client-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
}));

// Helpers
function base64url(buf) { return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); }
function sha256(input) { return crypto.createHash("sha256").update(input).digest(); }
function genRandom(len = 16) { return base64url(crypto.randomBytes(len)); }
function page(title, body) {
    return `<html><head><title>${title}</title><style>body{font-family:sans-serif;padding:30px;background:#f0f2f5;color:#333}.card{background:white;padding:30px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:800px;margin:auto}.token{background:#282c34;color:#abb2bf;padding:15px;border-radius:6px;overflow-x:auto;font-family:monospace}</style></head><body><div class="card"><h1>${title}</h1>${body}</div></body></html>`;
}

// Routes
app.get("/", (req, res) => {
    if (req.session.id_token) {
        const user = req.session.user_claims;
        res.send(page("✅ Identity Verified", `
            <h3>Welcome, ${user.name}!</h3>
            <p>You have successfully logged in via OIDC.</p>
            <p><b>Email:</b> ${user.email}</p>
            <p><b>User ID (sub):</b> ${user.sub}</p>
            
            <h4>🆔 Your ID Token (JWT)</h4>
            <div class="token">${req.session.id_token}</div>
            
            <p><a href="/logout" style="color:red">Logout</a></p>
        `));
    } else {
        res.send(page("OIDC Demo Client", `
            <p>This app uses <b>OpenID Connect</b> to verify who you are.</p>
            <a href="/login"><button style="padding:10px 20px;font-size:16px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer">Log in with OIDC</button></a>
        `));
    }
});

app.get("/login", (req, res) => {
    // PKCE
    const code_verifier = genRandom(32);
    const code_challenge = base64url(sha256(code_verifier));
    // State & Nonce
    const state = genRandom();
    const nonce = genRandom(); // Nonce links the Token to this specific session

    req.session.oidc = { state, nonce, code_verifier };

    const u = new URL(AUTH_SERVER + "/authorize");
    u.searchParams.set("response_type", "code");
    u.searchParams.set("client_id", CLIENT_ID);
    u.searchParams.set("redirect_uri", REDIRECT_URI);
    u.searchParams.set("scope", SCOPE);
    u.searchParams.set("state", state);
    u.searchParams.set("nonce", nonce); // Send nonce
    u.searchParams.set("code_challenge", code_challenge);
    u.searchParams.set("code_challenge_method", "S256");

    res.redirect(u.toString());
});

app.get("/callback", async (req, res) => {
    const { code, state, error } = req.query;
    if (error) return res.send(error);

    const saved = req.session.oidc;
    if (saved.state !== state) return res.send("State mismatch");

    // Exchange Code
    const params = new URLSearchParams();
    params.set("grant_type", "authorization_code");
    params.set("code", code);
    params.set("redirect_uri", REDIRECT_URI);
    params.set("client_id", CLIENT_ID);
    params.set("code_verifier", saved.code_verifier);

    const resp = await fetch(AUTH_SERVER + "/token", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params
    });
    const data = await resp.json();

    if (data.id_token) {
        // Validate ID Token
        try {
            // 1. Verify Signature
            const decoded = jwt.verify(data.id_token, OIDC_SECRET);

            // 2. Validate Nonce (Critical for OIDC Replay Protection)
            if (decoded.nonce !== saved.nonce) throw new Error("Invalid Nonce");

            // 3. Validate Audience
            if (decoded.aud !== CLIENT_ID) throw new Error("Invalid Audience");

            req.session.id_token = data.id_token;
            req.session.user_claims = decoded;
            res.redirect("/");

        } catch (err) {
            res.send("ID Token Validation Failed: " + err.message);
        }
    } else {
        res.send("No ID Token received!");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

app.listen(PORT, () => console.log(`OIDC Client running on port ${PORT}`));
