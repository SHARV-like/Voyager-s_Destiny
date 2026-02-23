const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const { render } = require("ejs");
const { listingSchema } = require("./schema.js");
const app = express();

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

// ================= ROUTES =================

// Root
app.get("/", (req, res) => {
    res.send("Hi I am root");
});

const validateSchema = ((req, res,next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
})

// INDEX
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index", { allListings });
}));

// NEW
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// SHOW
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show.ejs", { listing });
}));

// CREATE
app.post("/listings", validateSchema, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body);
    console.log(req.body)
    await newListing.save();
    res.redirect("/listings");
}));

// EDIT FORM
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit.ejs", { listing });
}));

// UPDATE
app.put("/listings/:id",validateSchema, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, price, location, country } = req.body;
    // image already normalized by middleware to object
    const image = req.body.image;

    await Listing.findByIdAndUpdate(id, {
        title,
        description,
        price,
        location,
        image,
        country
    });

    res.redirect(`/listings/${id}`);
}));

// DELETE
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// ================= 404 HANDLER =================
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// ================= ERROR MIDDLEWARE =================
app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong" } = err;
    res.status(status).render("error.ejs", { message });
    // res.status(status).send(message);
});

// ================= SERVER =================
app.listen(8080, () => {
    console.log("Server running on port 8080");
});
