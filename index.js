require("dotenv").config();

const express = require("express");
const passport = require("passport");
const path =require("path")
require("./src/modules/auth/passport");

const cors = require("cors");
const fileUpload = require('express-fileupload');

const connectDB = require("./src/config/db");

const app = express();
const port =5000;

connectDB();

app.use(passport.initialize());

app.use(cors({
    origin:["http://localhost:8080","https://sheharludhiana.com","www.sheharludhiana.com"],
    credentials: true
}));
app.use(fileUpload());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));

app.use("/api", require("./routes/main.routes"));

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});