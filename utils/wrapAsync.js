function wrapAsync(fn){
    return function (req,res,next){
        fn(req,res,next).catch(next);   // same as " .catch((err) => next(err)); "
    }
}

module.exports = wrapAsync;