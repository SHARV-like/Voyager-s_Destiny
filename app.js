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
const  session = require("express-session");
const flash = require("connect-flash");

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
    saveUninitialized : true,
    cookie:{
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.update = req.flash("update");
    res.locals.del = req.flash("del");
    next();
})
// ================= ROUTES =================

// Root
app.get("/", (req, res) => {
    res.send("Hi I am root");
});

// LISTINGS
app.use("/listings", listingRouter);

// REVIEWS
app.use("/listings/:id/reviews", postRouter);


// ================= 404 HANDLER =================
app.use((req, res, next) => {
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
