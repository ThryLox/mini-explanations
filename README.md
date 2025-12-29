# Mini Explanations & PoCs

Repository for security concepts, educational implementations, and Proof of Concepts (PoCs).

## 🌟 Featured: [Cybersecurity Academy](./cyber-academy)
**Interactive Learning Platform** for OAuth 2.1, OIDC, and Web Security.
👉 **[Launch App](./cyber-academy)** to start the simulation labs.

## 🛡️ Phase 1: Authentication & Identity

| Concept | Status | Implementation | Description |
|---------|--------|----------------|-------------|
| **OAuth 2.1 (PKCE)** | ✅ Done | [OAuth-2.1-Educational](./OAuth-2.1-Educational) | Authorization Code Flow with PKCE from scratch. |
| **OpenID Connect (OIDC)** | ✅ Done | [OIDC-Educational](./OIDC-Educational) | Adding Identity (ID Token) on top of OAuth 2.0. |
| **JWT Security** | ⏳ Planned | - | Deep dive into JSON Web Tokens, signatures, and weaknesses. |
| **Session Management** | ⏳ Planned | - | Secure Cookies (HttpOnly, SameSite) vs LocalStorage. |
| **RBAC vs ABAC** | ⏳ Planned | - | Implementing Role-Based and Attribute-Based Access Control. |
| **MFA / 2FA** | ⏳ Planned | - | Implementing Time-based One-Time Passwords (TOTP). |

## 🐛 Phase 2: Common Web Vulnerabilities

| Concept | Status | Implementation | Description |
|---------|--------|----------------|-------------|
| **XSS** | ⏳ Pending | - | Cross-Site Scripting. |
| **SQL Injection** | ⏳ Pending | - | SQL Injection vectors. |
| **CSRF** | ⏳ Pending | - | Cross-Site Request Forgery. |
| **SSRF** | ⏳ Pending | - | Server-Side Request Forgery. |
| **IDOR** | ⏳ Pending | - | Insecure Direct Object References. |

## 🔗 Phase 3: API Security & Logic Flaws

| Concept | Status | Implementation | Description |
|---------|--------|----------------|-------------|
| **GraphQL Injection** | ⏳ Pending | - | Introspection abuse, depth limits, and query batching attacks. |
| **Mass Assignment** | ⏳ Pending | - | Binding input fields to internal model properties (e.g., isAdmin=true). |
| **Race Conditions** | ⏳ Pending | - | Exploiting Time-of-Check vs Time-of-Use (TOCTOU) in coupons/balances. |
| **Prototype Pollution** | ⏳ Pending | - | JavaScript-specific object injection vectors. |

## 🛡️ Phase 4: Defense Engineering & Infrastructure

| Concept | Status | Implementation | Description |
|---------|--------|----------------|-------------|
| **WAF Bypass** | ⏳ Pending | - | How WAFs work and how to evade simple rulesets. |
| **Security Headers** | ⏳ Pending | - | HSTS, CSP, X-Frame-Options: What they actually do. |
| **Secrets Management** | ⏳ Pending | - | Environment variables vs Vaults (HashiCorp/AWS KMS). |
| **Logging & Monitoring** | ⏳ Pending | - | Detecting attacks via ELK/Splunk (SIEM basics for devs). |
