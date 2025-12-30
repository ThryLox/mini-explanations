# Cybersecurity Academy

## 🚀 Overview
**Cybersecurity Academy** is an interactive educational platform designed to teach modern security protocols (OAuth 2.1, OIDC) through hands-on simulations. Unlike passive tutorials, this app provides a **full simulation environment** where you act as the Client, Auth Server, and Resource Server to see exactly how tokens are issued and verified.

## 🌟 Features

### 🔐 OAuth 2.1 Lab (Authorization Code Flow)
- **Interactive Timeline**: Step-by-step wizard guiding you through PKCE generation, Authorization Request, and Token Exchange.
- **PKCE Visualizer**: See how `code_verifier` and `code_challenge` protect the flow.
- **Network Monitor**: Real-time log of every network request and response.
- **Simulated Attacks**: (Coming Soon) Try to intercept the code without the verifier!

### 🆔 OpenID Connect Lab (Identity)
- **Identity Layer**: Understand the difference between *Access* (OAuth) and *Identity* (OIDC).
- **ID Token Inspector**: Decode JWTs in the browser and visualize the header, payload, and signature.
- **UserInfo Endpoint**: Call a standardized endpoint to verify user identity.

### 🛡️ Resource Server Simulation
- **Protected Photos API**: Use your Access Token to fetch data.
- **Token Introspection**: See how servers validate tokens before granting access.

### 🛡️ JWT Security Lab
- **Deep Dive**: Learn how JSON Web Tokens are structured and signed.
- **Attack Simulation**: Crack weak secrets using brute-force and forge admin tokens.
- **Vulnerability**: "none" algorithm and weak signature bypass.

### 💉 XSS Mastery (Web Vulnerabilities)
- **Visualizer**: See how malicious scripts get injected into the DOM.
- **Vulnerable Chat App**: Real-time lab to practice Reflected and Stored XSS.
- **Defense**: Comparing `innerHTML` vs safe text rendering.

### 👾 SQL Injection (Login Bypass)
- **Query Builder**: Watch SQL queries being constructed in real-time as you type.
- **Authentication Bypass**: Use `admin' --` or `OR 1=1` to login without a password.
- **Prepared Statements**: Visual comparison of insecure vs secure query construction.

## 🛠️ Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS + Custom "Premium" Glassmorphism UI
- **Cryptography**: Web Crypto API (for PKCE & SHA-256)
- **State Management**: React Hooks (Zustand-free for simplicity)

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- npm / pnpm / yarn

### Installation
1. Navigate to the directory:
   ```bash
   cd cyber-academy
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure
- `/src/app/modules`: Educational content pages
- `/src/app/api`: Simulated endpoints (Auth Server, Resource Server)
- `/src/components`: UI components

## 🤝 Contributing
Built for **Mini Explanations**. Feel free to submit PRs for new modules (XSS, SQLi, etc)!
