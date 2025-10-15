import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import crypto from "crypto";
import jwt from "jsonwebtoken"; // NEW: For signing ID Tokens

const app = express();
const PORT = 4000;
const OIDC_SECRET = "educational-oidc-secret-key-change-me"; // Symmetric key for HS256

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    name: "oidc_auth_session",
    secret: "auth-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
}));

// In-Memory Storage
const USERS = {
    "alice": { password: "password", name: "Alice Wonderland", email: "alice@example.com", sub: "1001" }
};
const CLIENTS = {
    "oidc-client": { secret: "client-secret", redirect_uri: "http://localhost:3000/callback" }
};
const CODES = new Map(); // code -> { client_id, redirect_uri, user, scope, nonce, code_challenge }

// -------------------- Helpers --------------------
function base64url(buf) {
    return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function sha256(input) {
    return crypto.createHash("sha256").update(input).digest();
}
function generateCode() {
    return base64url(crypto.randomBytes(16));
}
function page(title, body) {
    return `<html><head><title>${title}</title><style>body{font-family:sans-serif;padding:20px;max-width:600px;margin:auto;background:#f4f4f4}.card{background:white;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}</style></head><body><div class="card"><h1>${title}</h1>${body}</div></body></html>`;
}

// -------------------- OIDC Helpers --------------------
function generateIdToken(user, client_id, nonce) {
    // ID Token Claims (Payload)
    const payload = {
        iss: "http://localhost:4000", // Issuer
        sub: user.sub,             // Subject (User ID)
        aud: client_id,            // Audience (Client)
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expiration (1 hour)
        iat: Math.floor(Date.now() / 1000), // Issued At
        nonce: nonce,              // Nonce to prevent replay (bound to client session)

        // Profile claims (if scope includes profile/email)
        name: user.name,
        email: user.email
    };

    // Sign with HS256 (Symmetric) for simplicity
    return jwt.sign(payload, OIDC_SECRET, { algorithm: "HS256" });
}

// -------------------- Routes --------------------

app.get("/", (req, res) => res.send("OIDC Auth Server Running on Port 4000"));

// 1. Authorization Endpoint
app.get("/authorize", (req, res) => {
    const { response_type, client_id, redirect_uri, scope, state, code_challenge, code_challenge_method, nonce } = req.query;

    if (!CLIENTS[client_id]) return res.status(400).send("Unknown Client");
    if (CLIENTS[client_id].redirect_uri !== redirect_uri) return res.status(400).send("Mismatch Redirect URI");

    // Require Login
    if (!req.session.user) {
        const returnTo = req.url;
        return res.redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }

    // Show Consent
    res.send(page("OIDC Consent", `
        <p>User: <b>${req.session.user.name}</b></p>
        <p>Client: <b>${client_id}</b></p>
        <p>Scopes requested: <code>${scope}</code></p>
        ${scope.includes("openid") ? "<p>⚠️ <b>Application wants to verify your identity (OpenID).</b></p>" : ""}
        
        <form action="/approve" method="post">
            <input type="hidden" name="client_id" value="${client_id}">
            <input type="hidden" name="redirect_uri" value="${redirect_uri}">
            <input type="hidden" name="scope" value="${scope}">
            <input type="hidden" name="state" value="${state}">
            <input type="hidden" name="code_challenge" value="${code_challenge}">
            <input type="hidden" name="nonce" value="${nonce}">
            <button type="submit">Approve & Sign In</button>
        </form>
    `));
});

// Login Page
app.get("/login", (req, res) => {
    res.send(page("Login", `
        <form method="post" action="/login">
            <input type="hidden" name="returnTo" value="${req.query.returnTo}">
            <input name="username" value="alice" placeholder="username"><br><br>
            <input name="password" type="password" value="password" placeholder="password"><br><br>
            <button>Login</button>
        </form>
    `));
});

app.post("/login", (req, res) => {
    const { username, password, returnTo } = req.body;
    if (USERS[username] && USERS[username].password === password) {
        req.session.user = USERS[username];
        res.redirect(returnTo || "/");
    } else {
        res.send("Invalid credentials");
    }
});

// Approve Consent
app.post("/approve", (req, res) => {
    const { client_id, redirect_uri, scope, state, code_challenge, nonce } = req.body;
    const code = generateCode();

    CODES.set(code, {
        client_id, redirect_uri, scope, state,
        code_challenge,
        user: req.session.user,
        nonce: nonce // Store nonce to put in ID Token later
    });

    const url = new URL(redirect_uri);
    url.searchParams.set("code", code);
    url.searchParams.set("state", state);
    res.redirect(url.toString());
});

// 2. Token Endpoint
app.post("/token", (req, res) => {
    const { grant_type, code, redirect_uri, client_id, code_verifier } = req.body;

    const data = CODES.get(code);
    if (!data) return res.status(400).json({ error: "invalid_grant" });

    // Validate PKCE
    const hash = base64url(sha256(code_verifier));
    if (hash !== data.code_challenge) return res.status(400).json({ error: "invalid_pkce" });

    CODES.delete(code); // One-time use

    // Generate Access Token (Opaque)
    const access_token = "access_" + generateCode();

    const response = {
        access_token,
        token_type: "Bearer",
        expires_in: 3600,
        scope: data.scope
    };

    // OIDC Magic: Generate ID Token if scope includes 'openid'
    if (data.scope.includes("openid")) {
        response.id_token = generateIdToken(data.user, client_id, data.nonce);
    }

    res.json(response);
});

// 3. UserInfo Endpoint (OIDC Standard)
// Clients can use Access Token to get user details here
app.get("/userinfo", (req, res) => {
    // In a real app, validate Access Token. Here we just mock response for simplicity
    // or we could store access_token -> user mapping.
    // For this educational demo, we'll assume valid access token means "alice"

    // Check Authorization Header
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "missing_token" });

    // Mock: Returns Alice data
    res.json(USERS["alice"]);
});

app.listen(PORT, () => console.log(`OIDC Auth Server listening on port ${PORT}`));
