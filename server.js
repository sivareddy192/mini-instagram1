require("dotenv").config();
const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");

const flash = require("connect-flash");
const flash = require("connect-flash");   
const PORT = process.env.PORT || 3000;

const connectDB = require("./config/db");
const authRoute = require("./route/authRoute");
const postRoute = require("./route/postRoute");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(methodOverride("_method"));

app.use(session({
  secret: "miniinstagram",
  resave: false,
  saveUninitialized: false
}));

app.use(
  session({
    secret: "miniinstagramsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.use(flash());
app.use(flash());


app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

app.set("view engine", "ejs");

app.use(authRoute);
app.use(postRoute);

app.get("/", (req, res) => res.render("index"));
app.get("/login", (req, res) => res.render("login"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
