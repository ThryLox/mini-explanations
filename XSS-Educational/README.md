# XSS (Cross-Site Scripting)

**Cross-Site Scripting (XSS)** is a vulnerability where an attacker injects malicious scripts (JavaScript, VBScript, etc.) into web pages viewed by other users.

It happens when an application includes untrusted data in a web page without proper validation or escaping.

## Types of XSS

### 1. Reflected XSS (Non-Persistent)
The payload is part of the request (e.g., URL parameters) and is "reflected" back to the user in the response.
- **Vector**: Phishing links.
- **Example**: `http://site.com/search?q=<script>alert(1)</script>`

### 2. Stored XSS (Persistent)
The payload is stored in the database (e.g., comment section) and executed every time a victim views the page.
- **Vector**: Forums, Chat Apps, Profile Fields.
- **Example**: User posts a comment: `Great post! <script>stealCookies()</script>`

### 3. DOM-Based XSS
The vulnerability is in the client-side code rather than the server-side code. The attack payload is executed as a result of modifying the DOM "environment" in the victim's browser.
- **Vector**: JavaScript frameworks using untrusted data sources (e.g., `location.hash`).

---

## Defense: Escaping vs Sanitization

- **Escaping**: Converting special characters into HTML entities (e.g., `<` becomes `&lt;`). This prevents the browser from interpreting the data as code.
- **Sanitization**: Removing unsafe tags/attributes while allowing safe HTML (e.g., allowing `<b>` but removing `<script>`).

**React/Next.js**: By default, React escapes all variables rendered in JSX (`{variable}`). To be vulnerable, you must explicitly use `dangerouslySetInnerHTML`.
