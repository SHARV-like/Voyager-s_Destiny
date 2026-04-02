const express = require("express");
const router = express.Router(); // created an istance of Express Router

const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/expressError");
const { listingSchema } = require("../schema");

// ================= SERVER SIDE VALIDATION =================
const validateListing = ((req, res,next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
})

// INDEX
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index", { allListings });
}));

// NEW
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

// SHOW
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show.ejs", { listing });
}));

// CREATE
router.post("/", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body);
    console.log(req.body)
    await newListing.save();
    req.flash("success", "Listing created successfully");
    res.redirect("/listings");
}));

// EDIT FORM
router.get("/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit.ejs", { listing });
}));

// UPDATE
router.put("/:id",validateListing, wrapAsync(async (req, res) => {
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
    req.flash("update", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
}));

// DELETE
router.delete("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("del", "Listing deleted successfully");
    res.redirect("/listings");
}));

module.exports = router;