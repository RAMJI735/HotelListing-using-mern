const Listing= require("../models/listing.js");
const multer= require("multer");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { query } = require("express");
const mapToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index= async (req, res, next) => {
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });

};

module.exports.renderNewForm=  (req, res) => {
    res.render("./listings/new.ejs");
    console.log(req.user);
};

module.exports.postlisting= async (req, res, next) => {
    // if(!req.body.listing){
    //     throw new ExpressError(404,"Send valid Data For listing");
    // }    

    // res.send(req.file);
    let response;
    try{
        response = await geoCodingClient
        .forwardGeocode({
            // query: "New Delhi, India",
            query: req.body.listing.location,
            limit:1,
        })
        .send();
    } catch (err) {
        // If geocoding fails (e.g., missing MAP_TOKEN or network), proceed without geometry
        response = { body: { features: [] } };
    }

    // console.log(response.body.features[0].geometry);
    // res.send("done");

    let url;
    let filename;
    if (req.file && req.file.path && req.file.filename) {
        url = req.file.path;
        filename = req.file.filename;
    } else {
        // fallback image if none uploaded
        url = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
        filename = "placeholder";
    }
// console.log(url,"..",filename);
    let listing = req.body.listing;
    const newListing = new Listing(listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};
    const feature = Array.isArray(response?.body?.features) ? response.body.features[0] : undefined;
    if (feature && feature.geometry) {
        newListing.geoMetry = feature.geometry;
    } else {
        newListing.geoMetry = { type: "Point", coordinates: [0, 0] };
    }
    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect("/listings");

};

module.exports.editform= async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Page that you are searching is not exist");
    };

    let originalimageUrl= listing.image.url;
    originalimageUrl.replace("upload", "upload/h300,w_250");
    res.render("./listings/edit.ejs", { listing, originalimageUrl });
};

module.exports.updatelisting= async (req, res, next) => {
    // if(!req.body.listing){
    //     throw new ExpressError(404,"Send valid Data For listing");
    // }    
    let { id } = req.params;
   
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    await listing.save();
    req.flash("success", "listing updated successful");

    if(typeof req.file!=="undefined"){
        let url= req.file.path;
        let filename= req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }

    if (!listing) {
        req.flash("error", "Page that you are searching is not exist");
    };
    res.redirect(`/listings/${id}`);
};

module.exports.deletelisting= async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    console.log(res.locals.CurrUser._id);
    console.log(listing.owner._id);

    if (!res.locals.CurrUser._id.equals(listing.owner._id)) {

        req.flash("error", "Don,t have permission");
        return res.redirect(`/listings`);
    }
    await Listing.findByIdAndDelete(id);    
     req.flash("success", "Listing Deleted");
     res.redirect(`/listings`);
};

// module.exports.deletelisting = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const listing = await Listing.findById(id);

//         if (!res.locals.CurrUser._id.equals(listing.owner._id)) {
//             req.flash("error", "You don't have permission to delete this listing.");
//             return res.redirect("/listings");
//         }

//         await Listing.findByIdAndDelete(id);
//         req.flash("success", "Listing deleted successfully.");
//         res.redirect("/listings");
//     } catch (error) {
//         // Handle the error (e.g., log it or send an error response)
//         next(error);
//     }
// };


module.exports.ShowListing= async (req, res, next) => {
    let { id } = req.params;
    // convert data from obj id help of populate
    const listing = await Listing.findById(id).
        populate({
            path: "reviews",
            populate: {
                path: "author",
            }
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Page that you are searching is not exist");
    };
    res.render("listings/show.ejs", { listing });
};