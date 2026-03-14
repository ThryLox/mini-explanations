import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

// Standard API - doesn't care much about Identity, just Access
app.get("/api/orders", (req, res) => {
    // In real app, validate token with Auth Server
    res.json({ orders: ["Order #1", "Order #2"] });
});

app.listen(PORT, () => console.log(`Resource Server running on port ${PORT}`));
