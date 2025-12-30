# SQL Injection (SQLi)

**SQL Injection** occurs when untrusted user input is directly concatenated into a database query string. This allows an attacker to manipulate the query structure and execute arbitrary SQL commands.

## The Mechanic
Imagine a login query like this:

```sql
SELECT * FROM users WHERE username = '$username' AND password = '$password';
```

If the user enters `admin` as the username, it works as expected.
But if the attacker enters `admin' --`:

```sql
SELECT * FROM users WHERE username = 'admin' --' AND password = '...';
```

1.  The `'` closes the username string.
2.  The `--` comments out the rest of the query (the password check).
3.  The database executes: `SELECT * FROM users WHERE username = 'admin'`.
4.  **Result**: Logged in as admin without a password!

## Authentication Bypass (Tautology)
Another common attack is using a "truthy" statement:

Input: `' OR '1'='1`

Query becomes:
```sql
SELECT * FROM users WHERE username = '' OR '1'='1';
```

Since `'1'='1'` is always true, the database returns **all rows** (usually logging you in as the first user, which is often Admin).

## Defense: Prepared Statements
Never concatenate strings. Use **Parameterized Queries** (Prepared Statements).

**Vulnerable:**
```javascript
const query = "SELECT * FROM users WHERE id = " + input;
```

**Secure:**
```javascript
const query = "SELECT * FROM users WHERE id = ?";
db.execute(query, [input]);
```

The database treats the input strictly as data, never as executable code.
