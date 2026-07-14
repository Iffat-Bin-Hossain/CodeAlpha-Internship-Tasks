const express = require("express");
const cors = require("cors");

const publicRoutes = require("./routes/publicRoutes");
const privateRoutes = require("./routes/privateRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {

    res.send("Social Platform API Running");

});

// Public API

app.use("/api/auth", publicRoutes);

// Authenticated routes
app.use("/api", privateRoutes);

module.exports = app;