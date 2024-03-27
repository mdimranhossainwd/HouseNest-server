const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("House-Property Running on 5000 ---->");
});

app.listen(port, () => {
  console.log(`House-Property Currently Running on :----> ${port}`);
});
