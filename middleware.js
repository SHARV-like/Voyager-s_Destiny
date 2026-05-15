module.exports.isLoggedIn = (req,res,next) => {
    if (!req.isAuthenticated()){
        req.flash("error", "You must be logged in for creating a new listing !");
        return res.redirect("/login")
    }
    next();
}