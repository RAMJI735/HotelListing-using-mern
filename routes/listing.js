const express = require("express");
const router = express.Router();
// const { listingSchema, reviewSchema } = require("../schema.js");
const wrapAsync = require("../utilis/wrapAsync.js");
// const mongoose = require("mongoose");
// const ExpressError = require("../utilis/ExpressError.js");
// const Listing = require("../models/listing.js");
const { isLoggedIn, isOwned, validateListing } = require("../middleware.js");
const { populate } = require("../models/review.js");
const listingController= require("../controllers/listings.js");
const multer  = require("multer");
const {storage}= require("../cloudconfig.js");
const upload = multer({ storage });
const uploadSingle = upload.single("listing[image]");

// Handle multer/cloudinary upload errors gracefully
function handleUpload(req, res, next) {
    uploadSingle(req, res, function (err) {
        if (err) {
            console.error("Multer/Upload error:", err);
            req.flash("error", "Image upload failed. Please try again.");
            return res.redirect("/listings/new");
        }
        next();
    });
}
// const upload = multer({ dest: 'uploads/' })





// app.get("/", (req,res)=>{
//     console.log("working");
// });

// combine "/"get route and create route 
router
.route("/")
.get( wrapAsync(listingController.index))
.post( isLoggedIn,
    handleUpload,
    validateListing,
     wrapAsync(listingController.postlisting)
);
// .post( upload.single("listing[image]"),(req,res)=>{
//     res.send(req.file);
// })

// new route
router.get("/new", isLoggedIn,listingController.renderNewForm);


router.route("/:id")
.get( wrapAsync(listingController.ShowListing))
.put(isLoggedIn, isOwned, handleUpload, validateListing, wrapAsync(listingController.updatelisting))
.delete( isLoggedIn, isOwned, wrapAsync(listingController.deletelisting));

// //index route 
// router.get("/", wrapAsync(listingController.index)
// );




// Create Route (second method to get data from form )

// router.post("/", validateListing, isLoggedIn, wrapAsync(listingController.postlisting)
// );

// create route (first method)
// app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
//     if (!req.body.listing) {
//         throw new ExpressError(400, "Send valid data for listing");
//     }
//     try {
//         let listing = req.body.listing;
//         const newListing = new Listing(listing);
//         await newListing.save();
//         res.redirect("/listings");
//     } catch (error) {
//         next(error);
//     }
// }));


// edit form route
router.get("/:id/edit", isLoggedIn, isOwned, wrapAsync(listingController.editform));

// Fallback for clients/pages that submit without method-override
router.post("/:id", isLoggedIn, isOwned, handleUpload, validateListing, wrapAsync(listingController.updatelisting));

//  update route
// router.put("/:id", validateListing, isOwned, wrapAsync(listingController.updatelisting));

// delete route
// router.delete("/:id", isLoggedIn, isOwned, wrapAsync(listingController.deletelisting));

// show data
// router.get("/:id", wrapAsync(listingController.ShowListing));


module.exports = router;