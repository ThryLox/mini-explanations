import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    session({
        name: "auth_session",
        secret: "dev-secret-change-me",
        resave: false,
        saveUninitialized: false,
        cookie: { httpOnly: true }
    })
);

const PORT = 4000;

// -------------------- In-memory storage --------------------
// Demo users
const users = new Map([
    ["alice", { id: "user-alice", username: "alice", password: "password" }]
]);

// Registered clients
const clients = new Map([
    ["demo-client", {
        client_id: "demo-client",
        redirect_uris: ["http://localhost:3000/callback"],
        require_pkce: true,
        token_endpoint_auth_method: "none" // Public client
    }]
]);

// code -> { client_id, redirect_uri, user_id, scope, code_challenge, code_challenge_method, expires_at, used }
const authCodes = new Map();

// token -> { active, user_id, scope, exp }
const accessTokens = new Map();

// -------------------- PKCE helpers --------------------
function base64url(buf) {
    return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function sha256(input) {
    return crypto.createHash("sha256").update(input).digest();
}

function verifyPkceS256(code_verifier, code_challenge) {
    const computed = base64url(sha256(code_verifier));
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(code_challenge));
}

// -------------------- HTML helpers --------------------
function page(title, body) {
    return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>${title}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6; background: #f9f9f9; color: #333; }
        h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        label { display: block; margin-bottom: 8px; font-weight: bold; }
        input { width: 100%; padding: 8px; margin-bottom: 16px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px; }
        button:hover { background: #2980b9; }
        button.deny { background: #e74c3c; }
        button.deny:hover { background: #c0392b; }
        code { background: #eee; padding: 2px 5px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>${title}</h1>
        ${body}
      </div>
    </body>
  </html>`;
}

// -------------------- Auth middleware --------------------
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect(`/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
    }
    next();
}

// -------------------- Routes --------------------

// Simple login page
app.get("/login", (req, res) => {
    const returnTo = req.query.returnTo || "/";

    res.send(
        page("Authorization Server Login", `
      <div style="background:#e8f4fd; padding:10px; border-radius:4px; margin-bottom:15px; font-size:0.9em; border:1px solid #b6e0fe;">
        <strong>Educational Note:</strong> You are now at the <b>Auth Server</b> (Port 4000). The Client sent you here because it needs you to log in.
      </div>
      <form method="post" action="/login">
        <input type="hidden" name="returnTo" value="${String(returnTo)}" />
        <label>Username (alice) <input name="username" value="alice" /></label>
        <label>Password (password) <input name="password" type="password" value="password" /></label>
        <button type="submit">Login</button>
      </form>
    `)
    );
});

// Process login
app.post("/login", (req, res) => {
    const { username, password, returnTo } = req.body;
    const u = users.get(username);

    if (!u || u.password !== password) {
        return res.status(401).send(page("Login Failed", `<p style="color:red">Invalid credentials.</p><p><a href="/login">Try again</a></p>`));
    }

    req.session.user = { id: u.id, username: u.username };
    res.redirect(returnTo || "/");
});

// OAuth authorize endpoint
// This is where the client redirects the user to start the flow
app.get("/authorize", requireLogin, (req, res) => {
    const {
        response_type,
        client_id,
        redirect_uri,
        scope = "",
        state,
        code_challenge,
        code_challenge_method
    } = req.query;

    // 1) Validate required params
    if (response_type !== "code") return res.status(400).send("unsupported_response_type: only 'code' is supported");
    if (!client_id || !redirect_uri || !state) return res.status(400).send("invalid_request: missing required parameters");

    const client = clients.get(client_id);
    if (!client) return res.status(400).send("unauthorized_client: unknown client_id");

    // 2) Exact redirect_uri match (Critical for security)
    if (!client.redirect_uris.includes(redirect_uri)) return res.status(400).send("invalid_redirect_uri: mismatch");

    // 3) PKCE required check (for public clients)
    if (client.require_pkce) {
        if (!code_challenge) return res.status(400).send("invalid_request: code_challenge is required for this client");
        if (code_challenge_method !== "S256") return res.status(400).send("invalid_request: code_challenge_method must be S256");
    }

    // Render consent screen
    const scopes = String(scope).trim().split(/\s+/).filter(Boolean);
    const scopeList = scopes.length ? `<ul>${scopes.map(s => `<li>${s}</li>`).join("")}</ul>` : "<p>(none)</p>";

    res.send(
        page("Consent Required", `
      <div style="background:#e8f4fd; padding:10px; border-radius:4px; margin-bottom:15px; font-size:0.9em; border:1px solid #b6e0fe;">
        <strong>Educational Note:</strong> This is the <b>Authorization Server</b> (Port 4000). 
        It verifies the user's identity and asks for permission to share data with the Client.
      </div>
      <p>User: <b>${req.session.user.username}</b></p>
      <p>App: <b>${client_id}</b> requests access to:</p>
      ${scopeList}
      <p>Do you approve?</p>
      <form method="post" action="/approve">
        <input type="hidden" name="client_id" value="${client_id}" />
        <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
        <input type="hidden" name="scope" value="${String(scope)}" />
        <input type="hidden" name="state" value="${state}" />
        <input type="hidden" name="code_challenge" value="${code_challenge || ""}" />
        <input type="hidden" name="code_challenge_method" value="${code_challenge_method || ""}" />
        <button type="submit" name="decision" value="approve">Approve</button>
        <button type="submit" name="decision" value="deny" class="deny">Deny</button>
      </form>
    `)
    );
});

// Process consent decision
app.post("/approve", requireLogin, (req, res) => {
    const { decision, client_id, redirect_uri, scope, state, code_challenge, code_challenge_method } = req.body;

    const client = clients.get(client_id);
    if (!client) return res.status(400).send("unauthorized_client");
    if (!client.redirect_uris.includes(redirect_uri)) return res.status(400).send("invalid_redirect_uri");

    if (decision !== "approve") {
        // Denied - redirect back with error
        const u = new URL(redirect_uri);
        u.searchParams.set("error", "access_denied");
        u.searchParams.set("state", state);
        return res.redirect(u.toString());
    }

    // Create short-lived, one-time authorization code
    const code = base64url(crypto.randomBytes(32));
    const expires_at = Date.now() + 2 * 60 * 1000; // 2 minutes

    authCodes.set(code, {
        client_id,
        redirect_uri,
        user_id: req.session.user.id,
        scope: String(scope || "").trim(),
        code_challenge: code_challenge || null,
        code_challenge_method: code_challenge_method || null,
        expires_at,
        used: false
    });

    const u = new URL(redirect_uri);
    u.searchParams.set("code", code);
    u.searchParams.set("state", state);
    res.redirect(u.toString());
});

// Token endpoint (Exchanges code -> access_token)
// Called by Client back-channel (server-to-server or background fetch)
app.post("/token", (req, res) => {
    const { grant_type, code, redirect_uri, client_id, code_verifier } = req.body;

    if (grant_type !== "authorization_code") return res.status(400).json({ error: "unsupported_grant_type" });
    if (!code || !redirect_uri || !client_id) return res.status(400).json({ error: "invalid_request" });

    const client = clients.get(client_id);
    if (!client) return res.status(400).json({ error: "unauthorized_client" });
    // Verify redirect_uri again
    if (!client.redirect_uris.includes(redirect_uri)) return res.status(400).json({ error: "invalid_redirect_uri" });

    const record = authCodes.get(code);
    if (!record) return res.status(400).json({ error: "invalid_grant" });

    // Bind code to client + redirect_uri
    if (record.client_id !== client_id || record.redirect_uri !== redirect_uri) {
        return res.status(400).json({ error: "invalid_grant" });
    }

    // Expired / used checks (Code Replay Prevention)
    if (record.used) return res.status(400).json({ error: "invalid_grant", error_description: "Code already used" });
    if (Date.now() > record.expires_at) return res.status(400).json({ error: "invalid_grant", error_description: "Code expired" });

    // PKCE validation
    if (client.require_pkce) {
        if (!code_verifier) return res.status(400).json({ error: "invalid_request", error_description: "Missing code_verifier" });
        if (record.code_challenge_method !== "S256") return res.status(400).json({ error: "invalid_grant", error_description: "Invalid code_challenge_method" });

        const ok = verifyPkceS256(String(code_verifier), String(record.code_challenge));
        if (!ok) return res.status(400).json({ error: "invalid_grant", error_description: "PKCE verification failed" });
    }

    // Mark code used (one-time use)
    record.used = true;
    authCodes.set(code, record);

    // Issue opaque access token
    const access_token = base64url(crypto.randomBytes(32));
    const expires_in = 15 * 60; // 15 minutes
    const exp = Math.floor(Date.now() / 1000) + expires_in;

    accessTokens.set(access_token, {
        active: true,
        user_id: record.user_id,
        scope: record.scope,
        exp
    });

    res.json({
        access_token,
        token_type: "Bearer",
        expires_in,
        scope: record.scope
    });
});

// Introspection endpoint (Resource Server uses this to validate tokens)
app.post("/introspect", (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ active: false });

    const t = accessTokens.get(token);
    if (!t) return res.json({ active: false });

    const now = Math.floor(Date.now() / 1000);
    if (now >= t.exp) {
        return res.json({ active: false, exp: t.exp });
    }

    res.json({
        active: true,
        sub: t.user_id,
        scope: t.scope,
        exp: t.exp,
        client_id: "demo-client" // In real world, track which client got this token
    });
});

// Status page
app.get("/", (req, res) => {
    res.send(page("Authorization Server", `
    <p>Status: 🟢 Running on port ${PORT}</p>
    <p>This server creates sessions, issues codes, and mints tokens.</p>
    <p><a href="/login" style="display:inline-block; padding:8px 16px; background:#2ecc71; color:white; text-decoration:none; border-radius:4px;">Test Login</a></p>
  `));
});

app.listen(PORT, () => console.log(`Auth Server listening on http://localhost:${PORT}`));
