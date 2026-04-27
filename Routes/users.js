const express = require("express");
const router = express.Router();
const User = require("../models/user.js")
const passport = require("passport");

router.get("/signup", (req,res) => {
    res.render("users/signup.ejs");
})

router.post("/signup", async(req,res) => {
    try{
        let {username , email , password} = req.body;
        const newUser = new User({email, username});
        const registeredUer = await User.register(newUser, password);
        console.log(registeredUer);
        req.flash("success", "welcome to Voyager's Destiny");
        res.redirect("/listings")
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup")
    }
})

router.get("/login", (req,res) => {
    res.render("users/login.ejs");
})

router.post("/login", 
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req,res) => {
        req.flash("success", `Welcome back ${req.body.username} !`);
        res.redirect("/listings");
})
module.exports = router;