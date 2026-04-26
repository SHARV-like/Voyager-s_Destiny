const express = require("express");
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
// const Review = require("./models/review.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
// const { render } = require("ejs");
// const { listingSchema, reviewSchema } = require("./schema.js");
const app = express();
const listingRouter = require("./Routes/listings.js")
const postRouter = require("./Routes/reviews.js")
const userRouter = require("./Routes/users.js");
const  session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// ================= SETUP =================
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// ================= DATABASE =================
main()
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/voyagersdestiny");
}

// ================= MIDDLEWARES ============
app.use(session({
    secret : "my_secret_key",
    resave : false,
    saveUninitialized : false,
    cookie:{
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
}));

app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.update = req.flash("update");
    res.locals.del = req.flash("del");
    next();
})
// ================= ROUTES =================

// Prevent browser favicon request from triggering 404 error
app.get('/favicon.ico', (req, res) => res.status(204));

// Root
app.get("/", (req, res) => {
    res.send("Hi I am root");
});

app.get("/register", async (req,res) =>{
    let fakeUser = new User({
        email : "email@gmail.com",
        username : "Sharv"
    })

    let newUser = await User.register(fakeUser, "mypassword");
    res.send(newUser);

})
// LISTINGS
app.use("/listings", listingRouter);

// REVIEWS
app.use("/listings/:id/reviews", postRouter);

// USERS
app.use("/", userRouter);


// ================= 404 HANDLER =================
app.use("*", (req, res, next) => {
    console.log(req.url);
    next(new ExpressError(404, "Page Not Found"));
});

// ================= ERROR MIDDLEWARE =================
app.use((err, req, res, next) => {
    console.error(err.stack);
    let { status = 500, message = "Internal Server Error" } = err;
    res.status(status).render("error.ejs", { message });
});

// ================= SERVER =================
app.listen(8080, () => {
    console.log("Server running on port 8080");
});
