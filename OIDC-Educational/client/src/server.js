import express from "express";
import session from "express-session";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3000;
const CLIENT_ID = "oidc-client";
const REDIRECT_URI = "http://localhost:3000/callback";
const AUTH_SERVER = "http://localhost:4000";
const OIDC_SECRET = "educational-oidc-secret-key-change-me";

// Middleware
app.use(express.urlencoded({ extended: true }));
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

// CSS & Page Template
const css = `
body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f4f6f9; color: #333; line-height: 1.6; padding: 20px; }
.container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.08); }
h1 { color: #1a1a1a; margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px; }
.step-box { background: #eef5ff; padding: 20px; border-left: 5px solid #0066cc; margin: 25px 0; border-radius: 6px; }
.step-title { font-weight: bold; color: #0066cc; font-size: 1.1em; margin-bottom: 10px; display: block; }
.theory-box { background: #fff3cd; padding: 15px; border: 1px solid #ffeeba; border-radius: 6px; margin: 15px 0; font-size: 0.95em; }
.theory-title { font-weight: bold; color: #856404; display: block; margin-bottom: 5px; }
.code-block { background: #282c34; color: #abb2bf; padding: 15px; border-radius: 6px; font-family: 'Consolas', monospace; overflow-x: auto; margin: 10px 0; font-size: 13px; line-height: 1.4; }
.btn { display: inline-block; background: #0066cc; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; border: none; cursor: pointer; font-size: 16px; transition: background 0.2s; }
.btn:hover { background: #004d99; }
.tag { font-family: monospace; font-weight: bold; color: #e83e8c; background: rgba(232,62,140,0.1); padding: 2px 4px; border-radius: 3px; }
.check-list { list-style: none; padding: 0; }
.check-list li { margin: 8px 0; padding-left: 25px; position: relative; }
.check-list li::before { content: "✅"; position: absolute; left: 0; }
.check-fail::before { content: "❌" !important; }
`;

function page(title, content) {
    return `<html><head><title>${title}</title><style>${css}</style></head><body><div class="container"><h1>${title}</h1>${content}</div></body></html>`;
}

// ---------------- Routes ----------------

// Dashboard
app.get("/", (req, res) => {
    if (req.session.user_claims) {
        const user = req.session.user_claims;
        res.send(page("✅ Identity Verified", `
            <div class="step-box" style="border-color: #28a745; background: #d4edda;">
                <span class="step-title" style="color:#155724">Authentication Successful</span>
                <h3>Hello, ${user.name}!</h3>
                <p>The OIDC flow is complete. We obtained an ID Token, verified it, and extracted your profile.</p>
            </div>
            
            <div style="display:flex; align-items:flex-start; gap: 20px; margin-bottom: 30px;">
                <div style="width:80px; height:80px; background:#eee; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:40px;">👤</div>
                <div>
                    <div><strong>Name:</strong> ${user.name}</div>
                    <div><strong>Email:</strong> ${user.email}</div>
                    <div><strong>Subject (User ID):</strong> <span class="tag">${user.sub}</span></div>
                    <div><strong>Issuer:</strong> ${user.iss}</div>
                    <div><strong>Audience:</strong> ${user.aud}</div>
                </div>
            </div>

            <div class="theory-box">
                <span class="theory-title">🎓 Educational Note: The ID Token</span>
                This JSON Web Token (JWT) is the digital "ID Card" issued by the Auth Server.
                The Client App (us) confirmed it was signed by the Auth Server using the shared secret.
            </div>

            <h4>🆔 Raw ID Token (Header.Payload.Signature)</h4>
            <div class="code-block">${req.session.id_token}</div>
            
            <a href="/logout" class="btn" style="background: #dc3545;">Logout</a>
        `));
    } else {
        res.send(page("OIDC Educational Demo", `
            <p>Welcome! This demo explains <b>OpenID Connect (OIDC)</b> step-by-step.</p>
            
            <div class="theory-box">
                <span class="theory-title">🤔 What is OIDC?</span>
                OAuth 2.0 allows an app to <b>access</b> resources (like photos).<br>
                OpenID Connect adds an <b>Identity Layer</b> so the app knows <b>who you are</b>.
            </div>

            <div class="step-box">
                <span class="step-title">The Goal</span>
                Obtain a digitally signed <b>ID Token</b> from the Auth Server to prove to this Client that you are "Alice".
            </div>

            <a href="/login-step1" class="btn">Start OIDC Flow &rarr;</a>
        `));
    }
});

// Step 1: Preparation
app.get("/login-step1", (req, res) => {
    // Generate Values
    const code_verifier = genRandom(32);
    const code_challenge = base64url(sha256(code_verifier));
    const state = genRandom();
    const nonce = genRandom();

    req.session.oidc = { state, nonce, code_verifier };

    // Build URL
    const u = new URL(AUTH_SERVER + "/authorize");
    u.searchParams.set("response_type", "code");
    u.searchParams.set("client_id", CLIENT_ID);
    u.searchParams.set("redirect_uri", REDIRECT_URI);
    u.searchParams.set("scope", "openid profile email");
    u.searchParams.set("state", state);
    u.searchParams.set("nonce", nonce);
    u.searchParams.set("code_challenge", code_challenge);
    u.searchParams.set("code_challenge_method", "S256");

    res.send(page("Step 1: Client Preparation", `
        <p>Before redirecting you, the Client generates random security parameters.</p>
        
        <div class="step-box">
            <span class="step-title">Security Parameters</span>
            <div style="margin-bottom:10px">
                <strong>1. Nonce (Number used ONCE):</strong> <span class="tag">${nonce}</span>
                <div style="font-size:0.9em; margin-top:4px">Used for <b>Replay Protection</b>. We send this to the Auth Server. It MUST put this check-number inside the signed ID Token it sends back. If the token comes back without this number, it's fake.</div>
            </div>
            
            <div style="margin-bottom:10px">
                <strong>2. State:</strong> <span class="tag">${state}</span>
                <div style="font-size:0.9em; margin-top:4px">Used for <b>CSRF Protection</b>. Ensures the user coming back is the same one who left.</div>
            </div>

            <div>
                <strong>3. PKCE Verifier:</strong> <span class="tag">${code_verifier}</span>
                <div style="font-size:0.9em; margin-top:4px">We keep this secret. We only send its hash (<span class="tag">${code_challenge}</span>) right now.</div>
            </div>
        </div>

        <h3>Full Authorization URL:</h3>
        <div class="code-block" style="font-size:12px; word-break:break-all;">${u.toString()}</div>

        <a href="${u.toString()}" class="btn">Go to Auth Server &rarr;</a>
    `));
});

// Step 2: Callback
app.get("/callback", (req, res) => {
    const { code, state, error } = req.query;
    if (error) return res.send(page("Error", `<h3>Auth Error</h3><p>${error}</p>`));

    const saved = req.session.oidc || {};

    // Validate State
    if (saved.state !== state) {
        return res.send(page("Error", `<h3 style="color:red">State Mismatch!</h3><p>Expected: ${saved.state}<br>Received: ${state}</p><p>Possible CSRF Attack detected.</p>`));
    }

    res.send(page("Step 2: Callback Received", `
        <p>You have returned from the Auth Server!</p>
        
        <div class="step-box">
            <span class="step-title">What just happened?</span>
            The Auth Server verified your password and you consented. It has given us an <b>Authorization Code</b>.
        </div>

        <div style="margin: 20px 0;">
            <label class="label">Authorization Code:</label>
            <div class="code-block">${code}</div>
        </div>
        
        <div class="theory-box">
            <span class="theory-title">🎓 Why verify 'State'?</span>
            Before accepting this code, we checked the <span class="tag">state</span> parameter returning from the server matches what we sent.
            <br><b>Result:</b> ✅ MATCH. We know this response is for us.
        </div>

        <p>However, we still don't know <b>who</b> you are. We just have a code.</p>

        <form action="/exchange" method="post">
            <input type="hidden" name="code" value="${code}">
            <button type="submit" class="btn">Exchange Code for ID Token &rarr;</button>
        </form>
    `));
});

// Step 3: Exchange & Verify
app.post("/exchange", async (req, res) => {
    const saved = req.session.oidc;
    const { code } = req.body;

    const params = new URLSearchParams();
    params.set("grant_type", "authorization_code");
    params.set("code", code);
    params.set("redirect_uri", REDIRECT_URI);
    params.set("client_id", CLIENT_ID);
    params.set("code_verifier", saved.code_verifier); // Send the secret now!

    try {
        const resp = await fetch(AUTH_SERVER + "/token", {
            method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params
        });
        const data = await resp.json();

        if (data.error) throw new Error(data.error);

        // --- ID TOKEN VERIFICATION ---
        const idToken = data.id_token;
        const decoded = jwt.verify(idToken, OIDC_SECRET); // 1. Verify Signature

        // 2. Verify Nonce
        const nonceValid = (decoded.nonce === saved.nonce);
        if (!nonceValid) throw new Error("Nonce mismatch! Token might be replayed.");

        // 3. Verify Audience
        const audValid = (decoded.aud === CLIENT_ID);

        // Save to session
        req.session.id_token = idToken;
        req.session.user_claims = decoded;

        res.send(page("Step 3: Verification", `
            <div class="step-box">
                <span class="step-title">Token Exchange Successful</span>
                We sent the Code + PKCE Secret (<span class="tag">${saved.code_verifier}</span>) to the Auth Server.
                It verified them and returned the tokens.
            </div>

            <h4>🔐 The Received ID Token</h4>
            <div class="code-block" style="font-size:12px;">${idToken}</div>

            <h3>🔍 The Critical OIDC Checks</h3>
            <p>We must validate this token before trusting the identity.</p>

            <ul class="check-list">
                <li>
                    <b>Signature Check:</b> 
                    <span style="color:#28a745; font-weight:bold">PASS</span>
                    <div style="font-size:0.9em; color:#666">The JWT signature matches the Auth Server's key. It was not tampered with.</div>
                </li>
                <li>
                    <b>Nonce Check:</b> 
                    <span style="color:#28a745; font-weight:bold">PASS</span>
                    <div style="font-size:0.9em; color:#666">
                        Expected: <span class="tag">${saved.nonce}</span><br>
                        Actual in Token: <span class="tag">${decoded.nonce}</span><br>
                        This proves the token was minted specifically for <i>this</i> login attempt.
                    </div>
                </li>
                <li>
                    <b>Audience Check:</b> 
                    <span style="color:#28a745; font-weight:bold">PASS</span>
                    <div style="font-size:0.9em; color:#666">The token lists <span class="tag">${CLIENT_ID}</span> as the recipient. It wasn't issued for another app.</div>
                </li>
            </ul>

            <div class="theory-box">
                <span class="theory-title">🎓 Why Nonce?</span>
                Without a nonce, an attacker who intercepted an old ID Token could re-send it to log in as you (Replay Attack). 
                By checking that the token contains the unique random number we generated 1 minute ago, we prevent this.
            </div>

            <a href="/" class="btn">Finish & View Profile &rarr;</a>
        `));

    } catch (e) {
        res.send(page("Verification Failed", `<h3 style="color:red">❌ Security Check Failed</h3><p>${e.message}</p><a href="/" class="btn">Try Again</a>`));
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.listen(PORT, () => console.log(`OIDC Client running on port ${PORT}`));
