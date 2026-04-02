const express = require("express");
const router = express.Router({ mergeParams: true }); // child router ko :id access karna hai.

const {reviewSchema } = require("../schema.js");
const Listing = require("../models/listing");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/expressError");

// ================= SERVER SIDE VALIDATION =================
const validateReview = ((req, res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
})

//POST
router.post("/",validateReview, wrapAsync(async(req,res) => {
    // console.log(req.body);
    let listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review)
    listing.reviews.push(newReview);

    await newReview.save();    
    await listing.save();
    req.flash("success", "Review created successfully");
    res.redirect(`/listings/${listing._id}`);
    // console.log(req.body.review);
}))

// DELETE
router.delete("/:reviewId", wrapAsync(async (req,res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("del", "Review deleted successfully");
    res.redirect(`/listings/${id}`);
}))

module.exports = router;