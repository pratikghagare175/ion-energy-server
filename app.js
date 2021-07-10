const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
require("./db/connection");
const fileRoute = require("./routes/routes");
const cors = require("cors");

const app = express();
app.use(cors());

const port = process.env.PORT || 3010;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.listen(port, () => {
  console.log(`Server Running on port ${port}`);
});

app.use(fileRoute);
