require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbConfig = require("./config/db");
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3300;

dbConfig()

app.post('/api/register')

app.listen(port, () => {
  console.log("server running at port", port);
});
