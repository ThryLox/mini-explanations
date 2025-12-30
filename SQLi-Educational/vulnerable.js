// vulnerable.js
// A simple demonstration of how SQL keys can be broken by string concatenation.

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("--- SQL Injection Simulator ---");
console.log("Mock Database Query: SELECT * FROM users WHERE username = '$input' AND password = 'password123'");
console.log("Goal: Comment out the password check using '--'");

rl.question('\nEnter Username: ', (input) => {

    // VULNERABLE: Direct concatenation
    const query = `SELECT * FROM users WHERE username = '${input}' AND password = 'password123'`;

    console.log("\n[Server] Generated SQL:");
    console.log("---------------------------------------------------");
    console.log(query);
    console.log("---------------------------------------------------");

    if (query.includes("' --")) {
        console.log("✅ SUCCESS! You commented out the password check.");
        console.log("   The DB would execute: SELECT * FROM users WHERE username = '...'");
    } else if (query.includes("OR '1'='1'")) {
        console.log("✅ SUCCESS! You injected a Tautology.");
        console.log("   The DB would return ALL rows.");
    } else {
        console.log("❌ FAILED. The query still checks for the password.");
    }

    rl.close();
});
