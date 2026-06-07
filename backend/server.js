const express = require("express");
const cors = require("cors");
require("dotenv").config();

const customerRoutes =
require("./routes/customerroutes");
const matchRoutes =
require("./routes/matchRoutes");
const actionRoutes =
require("./routes/actionRoutes");


const app = express();

app.use(cors());
app.use(express.json());
  
app.use(
  "/api/customers",
  customerRoutes
);

app.use(
  "/api/matches",
  matchRoutes
);
app.use(
 "/api/actions",
 actionRoutes
);


app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});

module.exports = app;
