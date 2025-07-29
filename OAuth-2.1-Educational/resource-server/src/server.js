import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const PORT = 5000;
const AUTH_SERVER_INTROSPECT = "http://localhost:4000/introspect";

// -------------------- Helpers --------------------

// Call Auth Server to validate the opaque token
async function introspect(token) {
    try {
        const resp = await fetch(AUTH_SERVER_INTROSPECT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token })
        });
        if (!resp.ok) return { active: false };
        return await resp.json();
    } catch (err) {
        console.error("Introspection Error:", err);
        return { active: false };
    }
}

// Check if token has the required scope
function hasScope(tokenScope, required) {
    const scopes = String(tokenScope || "").split(/\s+/).filter(Boolean);
    return scopes.includes(required);
}

// -------------------- Middleware --------------------

function requireBearer(requiredScope) {
    return async (req, res, next) => {
        const h = req.header("authorization") || "";
        // Expect header: "Authorization: Bearer <token>"
        const m = h.match(/^Bearer\s+(.+)$/i);
        if (!m) return res.status(401).json({ error: "missing_token", message: "Bearer token required" });

        const token = m[1];

        // Validate token with Auth Server
        const data = await introspect(token);

        // Active check
        if (!data.active) return res.status(401).json({ error: "invalid_token", message: "Token is expired or invalid" });

        // Scope check
        if (requiredScope && !hasScope(data.scope, requiredScope)) {
            return res.status(403).json({ error: "insufficient_scope", required: requiredScope, granted: data.scope });
        }

        // Attach token data to request
        req.auth = data;
        next();
    };
}

// -------------------- Routes --------------------

// Protected endpoint
app.get("/api/photos", requireBearer("read:photos"), (req, res) => {
    res.json({
        status: "success",
        viewer: req.auth.sub, // User ID from token
        photos: [
            { id: "p1", title: "Sunset over the Ocean", url: "https://via.placeholder.com/150/FF6347/FFFFFF?text=Sunset" },
            { id: "p2", title: "City Lights at Night", url: "https://via.placeholder.com/150/4682B4/FFFFFF?text=City" },
            { id: "p3", title: "Mountain Peak", url: "https://via.placeholder.com/150/2E8B57/FFFFFF?text=Mountain" }
        ],
        scope_granted: req.auth.scope
    });
});

app.get("/", (req, res) => {
    res.send(`
    <h1>Resource Server</h1>
    <p>Status: 🟢 Running on port ${PORT}</p>
    <p>Endpoints:</p>
    <ul>
      <li><code>GET /api/photos</code> (Requires Bearer token with 'read:photos' scope)</li>
    </ul>
  `);
});

app.listen(PORT, () => console.log(`Resource Server listening on http://localhost:${PORT}`));
