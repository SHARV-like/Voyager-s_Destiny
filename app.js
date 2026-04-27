// ======================================================
// IMPORTS
// ======================================================

// Core framework for building server and routes
const express = require("express");

// MongoDB ODM for database operations
const mongoose = require("mongoose");

// Helps manage file/folder paths safely
const path = require("path");

// Allows HTML forms to send PUT, PATCH, DELETE requests
const methodOverride = require("method-override");

// Adds layout support for EJS templates
const ejsMate = require("ejs-mate");

// Custom error class for better error handling
const ExpressError = require("./utils/expressError.js");

// Main Express app instance
const app = express();


// ======================================================
// ROUTERS
// ======================================================

// Listings routes → CRUD operations for listings
const listingRouter = require("./Routes/listings.js");

// Reviews routes → create/delete reviews for listings
const postRouter = require("./Routes/reviews.js");

// User routes → signup, login, logout, authentication
const userRouter = require("./Routes/users.js");


// ======================================================
// AUTHENTICATION + SESSION PACKAGES
// ======================================================

// Session middleware → stores session data
const session = require("express-session");

// Flash messages → temporary success/error alerts
const flash = require("connect-flash");

// User model used by Passport authentication
const User = require("./models/user.js");

// Passport → authentication middleware
const passport = require("passport");

// Local strategy → username/password login system
const LocalStrategy = require("passport-local");


// ======================================================
// VIEW ENGINE + TEMPLATE SETUP
// ======================================================

// Set views folder path
app.set("views", path.join(__dirname, "views"));

// Set EJS as view engine
app.set("view engine", "ejs");

// Enable layout support using ejs-mate
app.engine("ejs", ejsMate);


// ======================================================
// GENERAL MIDDLEWARES
// ======================================================

// Parse incoming JSON data
app.use(express.json());

// Parse form data from req.body
app.use(express.urlencoded({ extended: true }));

// Enables PUT, PATCH, DELETE requests using forms
// Example: ?_method=PUT
app.use(methodOverride("_method"));

// Serve static files like CSS, JS, images
app.use(express.static(path.join(__dirname, "public")));


// ======================================================
// DATABASE CONNECTION
// ======================================================

// Connect MongoDB database using Mongoose

main()
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(
        "mongodb://127.0.0.1:27017/voyagersdestiny"
    );
}


// ======================================================
// SESSION CONFIGURATION
// ======================================================

// Sessions store temporary user data like:
// login state, flash messages, etc.

app.use(
    session({
        secret: "my_secret_key",
        // Used to sign and protect session ID

        resave: false,
        // Prevents saving unchanged sessions again

        saveUninitialized: false,
        // Prevents storing empty sessions

        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            // Session valid for 7 days

            httpOnly: true
            // Prevents JavaScript access for security
        }
    })
);


// ======================================================
// FLASH MESSAGE SETUP
// ======================================================

// Enables req.flash()
app.use(flash());


// ======================================================
// PASSPORT AUTHENTICATION SETUP
// ======================================================

// LocalStrategy uses username + password login

passport.use(
    new LocalStrategy(
        User.authenticate()
    )
);

// Store user ID in session
passport.serializeUser(
    User.serializeUser()
);

// Retrieve full user from stored session ID
passport.deserializeUser(
    User.deserializeUser()
);

// Initialize Passport middleware
app.use(passport.initialize());

// Enable Passport session support
app.use(passport.session());


// ======================================================
// GLOBAL RESPONSE LOCALS
// ======================================================

// Makes flash messages available in all EJS files
// without manually passing them in every route

app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.update = req.flash("update");
    res.locals.del = req.flash("del");

    next();
});


// ======================================================
// BASIC ROUTES
// ======================================================

// Prevent browser favicon request from causing 404 error
app.get("/favicon.ico", (req, res) => {
    res.sendStatus(204);
});


// Root route → test route
app.get("/", (req, res) => {
    res.send("Hi I am root");
});


// ======================================================
// TEMP REGISTER TEST ROUTE
// ======================================================

// Temporary route for testing user registration
// Later replace with proper signup form route

app.get("/register", async (req, res) => {
    let fakeUser = new User({
        email: "email@gmail.com",
        username: "Sharv"
    });

    let newUser = await User.register(
        fakeUser,
        "mypassword"
    );

    res.send(newUser);
});


// ======================================================
// MAIN ROUTES
// ======================================================

// Listings routes
app.use("/listings", listingRouter);

// Reviews routes (nested inside listings)
app.use("/listings/:id/reviews", postRouter);

// User routes
app.use("/", userRouter);


// ======================================================
// 404 HANDLER (MUST BE LAST ROUTE)
// ======================================================

// If no route matches, this middleware runs

app.use((req, res, next) => {
    console.log(req.url);

    next(
        new ExpressError(
            404,
            "Page Not Found"
        )
    );
});


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

// Handles all thrown errors centrally

app.use((err, req, res, next) => {
    console.error(err.stack);

    let {
        status = 500,
        message = "Internal Server Error"
    } = err;

    res.status(status).render(
        "error.ejs",
        { message }
    );
});


// ======================================================
// SERVER START
// ======================================================

// Start Express server on port 8080

app.listen(8080, () => {
    console.log(
        "Server running on port 8080"
    );
});