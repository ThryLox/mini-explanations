import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    name: "client_session",
    secret: "client-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
  })
);

const PORT = 3000;

// Configuration
const AUTH_SERVER_AUTHORIZE = "http://localhost:4000/authorize";
const AUTH_SERVER_TOKEN = "http://localhost:4000/token";
const RESOURCE_SERVER_PHOTOS = "http://localhost:5000/api/photos";

const CLIENT_ID = "demo-client";
const REDIRECT_URI = "http://localhost:3000/callback";
const SCOPE = "read:photos";

// -------------------- PKCE + Crypto helpers --------------------
function base64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest();
}

function genRandomString(bytes = 32) {
  return base64url(crypto.randomBytes(bytes));
}

// -------------------- HTML Helper --------------------
function page(title, body) {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>${title}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; background: #fafafa; color: #333; }
        h1 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
        .card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; border: 1px solid #eaeaea; }
        a { color: #3498db; text-decoration: none; font-weight: 500; }
        a:hover { text-decoration: underline; }
        button { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; transition: background 0.2s; }
        button:hover { background: #2980b9; }
        pre { background: #2ecc71; color: white; padding: 15px; border-radius: 5px; overflow-x: auto; font-weight: bold; }
        code { background: #eee; padding: 2px 5px; border-radius: 3px; font-family: 'Courier New', monospace; box-shadow: inset 0 0 2px rgba(0,0,0,0.1); }
        .token-box { word-break: break-all; background: #f8f9fa; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; font-family: monospace; font-size: 13px; color: #e83e8c; }
        .step { margin-bottom: 25px; border-left: 4px solid #3498db; padding-left: 15px; background: #f0f7fb; padding: 15px; border-radius: 0 4px 4px 0; }
        .step h3 { margin-top: 0; color: #2c3e50; }
        .highlight { background: #fffacd; padding: 2px 5px; border-radius: 3px; border: 1px solid #efe4b0; }
      </style>
    </head>
    <body>
      ${body}
    </body>
  </html>`;
}

// -------------------- Routes --------------------

// Step 0: Dashboard
app.get("/", (req, res) => {
  const token = req.session.access_token;

  if (!token) {
    res.send(page("Client App - Dashboard", `
      <div class="card">
        <h1>Welcome to the Client App</h1>
        <p>This is a demo client application (Port ${PORT}).</p>
        <p><b>Goal:</b> Retrieve your private photos from the Resource Server (Port 5000).</p>
        <p><b>Problem:</b> We don't have permission (Access Token).</p>
        <div style="margin-top: 20px; text-align: center;">
          <a href="/login-step1"><button style="font-size: 1.2em;">Start OAuth Flow &rarr;</button></a>
        </div>
      </div>
    `));
  } else {
    res.send(page("Client App - Connected", `
      <div class="card">
        <h1>✅ Authenticated</h1>
        <p>We have a valid Access Token!</p>
        
        <div class="step">
          <h3>Current Access Token</h3>
          <div class="token-box">${token}</div>
        </div>

        <div class="step">
          <h3>Next Step: Use the Token</h3>
          <p>We can now use this token in the <code>Authorization: Bearer &lt;token&gt;</code> header to fetch data.</p>
          <div style="text-align: center; margin-top: 15px;">
            <a href="/photos"><button>📸 Fetch Photos from Resource Server</button></a>
          </div>
          <br/>
          <div style="text-align: right;">
            <a href="/logout" style="color:red; font-size: 0.9em;">Logout (Clear Session)</a>
          </div>
        </div>
      </div>
    `));
  }
});

// Step 1: Preparation
app.get("/login-step1", (req, res) => {
  const code_verifier = genRandomString(32);
  const code_challenge = base64url(sha256(code_verifier));
  const state = genRandomString(16);

  req.session.oauth = { state, code_verifier };

  const u = new URL(AUTH_SERVER_AUTHORIZE);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", CLIENT_ID);
  u.searchParams.set("redirect_uri", REDIRECT_URI);
  u.searchParams.set("scope", SCOPE);
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", code_challenge);
  u.searchParams.set("code_challenge_method", "S256");

  res.send(page("Step 1: Preparation", `
    <div class="card">
      <h1>Step 1: Client Preparations</h1>
      <p>Before contacting the Auth Server, the Client generates some security parameters.</p>
      
      <div class="step">
        <h3>🔐 PKCE (Proof Key for Code Exchange)</h3>
        <p>To prevent code interception attacks, we generate a secret verifier and its hash.</p>
        <p><b>Code Verifier (Secret):</b> <br/><code style="word-break:break-all">${code_verifier}</code></p>
        <p><b>Code Challenge (Public Hash):</b> <br/><code style="word-break:break-all">${code_challenge}</code></p>
        <p><i>We will send the Challenge now, and the Verifier later to prove we are the same client.</i></p>
      </div>

      <div class="step">
        <h3>🛡️ CSRF Protection</h3>
        <p><b>State:</b> <code>${state}</code><br/>(A random string to ensure the user executing the flow is the one who started it)</p>
      </div>

      <div class="step">
        <h3>🔗 Next: Redirect to Auth Server</h3>
        <p>We will construct the Authorize URL with these parameters:</p>
        <pre style="font-size: 0.8em; overflow-x: auto;">${u.toString()}</pre>
        <div style="text-align: center; margin-top: 20px;">
           <a href="${u.toString()}"><button>Go to Auth Server (Port 4000) &rarr;</button></a>
        </div>
      </div>
    </div>
  `));
});

// Step 2: Callback
app.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).send(page("OAuth Error", `<div class="card"><h2>Error</h2><p>${error}</p><a href="/">Home</a></div>`));
  }

  const saved = req.session.oauth;
  if (!saved || !saved.state) return res.status(400).send("Session expired/missing");
  if (state !== saved.state) return res.status(400).send("State mismatch (CSRF warning)");

  // Save code temporarily
  req.session.temp_code = code;

  res.send(page("Step 2: Received Code", `
    <div class="card">
      <h1>Step 2: Callback Received</h1>
      <p>The User approved access! The Auth Server redirected back to us with a code.</p>
      
      <div class="step">
        <h3>🎟️ Authorization Code</h3>
        <div class="token-box">${code}</div>
        <p><i>This is NOT a token yet. It's a temporary, one-time ticket.</i></p>
      </div>

      <div class="step">
        <h3>🛡️ State Validation</h3>
        <p>Received: <code>${state}</code> <span style="color:green; font-weight:bold;">✔ Matches session</span></p>
      </div>

      <div class="step">
        <h3>🔄 Next: Exchange Code for Token</h3>
        <p>The Client calls the Auth Server's <code>/token</code> endpoint directly (back-channel) to swap this code for a real Access Token.</p>
        <p>We will also send the <b>Code Verifier</b> so the Auth Server can check it against the Challenge we sent in Step 1.</p>
        <div style="text-align: center; margin-top: 20px;">
           <a href="/exchange-step3"><button>Exchange Code for Token &rarr;</button></a>
        </div>
      </div>
    </div>
  `));
});

// Step 3: Token Exchange
app.get("/exchange-step3", async (req, res) => {
  const code = req.session.temp_code;
  const saved = req.session.oauth;

  if (!code || !saved) return res.redirect("/");

  try {
    const params = new URLSearchParams();
    params.set("grant_type", "authorization_code");
    params.set("code", code);
    params.set("redirect_uri", REDIRECT_URI);
    params.set("client_id", CLIENT_ID);
    params.set("code_verifier", saved.code_verifier);

    const tokenResp = await fetch(AUTH_SERVER_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });
    const data = await tokenResp.json();

    if (!tokenResp.ok) {
      return res.send(page("Error", `<div class="card"><h1>Exchange Failed</h1><pre>${JSON.stringify(data, null, 2)}</pre></div>`));
    }

    req.session.access_token = data.access_token;
    req.session.oauth = null;
    req.session.temp_code = null;

    res.send(page("Step 3: Token Obtained", `
      <div class="card">
        <h1>Step 3: Success!</h1>
        <p>The Auth Server verified our specific code and verifier, and issued a token.</p>
        
        <div class="step">
          <h3>🔑 Access Token</h3>
          <div class="token-box">${data.access_token}</div>
        </div>

        <div class="step">
          <h3>📦 Full Response</h3>
          <pre style="background:#222; color:#cfc;">${JSON.stringify(data, null, 2)}</pre>
        </div>

        <div style="text-align: center; margin-top: 20px;">
           <a href="/"><button>Return to Dashboard &rarr;</button></a>
        </div>
      </div>
    `));

  } catch (err) {
    res.send(page("Error", `<p>Internal error: ${err.message}</p>`));
  }
});

// 4. Call Resource Server
app.get("/photos", async (req, res) => {
  const token = req.session.access_token;
  if (!token) return res.redirect("/");

  try {
    const resp = await fetch(RESOURCE_SERVER_PHOTOS, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resp.json();

    res.send(page("Photo API Result", `
      <div class="card">
        <h1>📸 Photos from Resource Server</h1>
        <p>Status: <code>${resp.status}</code></p>
        <p>The Resource Server received our token, validated it (via introspection), and returned data.</p>
        
        ${resp.ok ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-top:20px;">
            ${data.photos ? data.photos.map(p => `
              <div style="border:1px solid #ddd; border-radius:4px; overflow:hidden; background:white;">
                <img src="${p.url}" style="width:100%; height:100px; object-fit:cover;">
                <div style="padding:5px; font-size:12px; font-weight:bold; text-align:center;">${p.title}</div>
              </div>
            `).join("") : "No photos found"}
          </div>
        ` : `<pre>${JSON.stringify(data, null, 2)}</pre>`}
        
        <p style="margin-top:20px;"><a href="/">&larr; Back</a></p>
      </div>
    `));
  } catch (err) {
    res.send(page("Error", `<p>${err.message}</p>`));
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

app.listen(PORT, () => console.log(`Client listening on http://localhost:${PORT}`));
