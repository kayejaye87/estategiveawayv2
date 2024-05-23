// Needed for dotenv
require("dotenv").config();

// Needed for Express
var express = require('express')
var app = express()

// Needed for EJS
app.set('view engine', 'ejs');

// Needed for public directory
app.use(express.static(__dirname + '/public'));

// Needed for parsing form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Needed for Prisma to connect to database
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

// Main landing page
app.get('/', async function (req, res) {

  // Try-Catch for any errors
  try {
    // Get all listings
    const listings = await prisma.post.findMany({
      orderBy: [
        {
          id: 'desc'
        }
      ]
    });

    // Render the homepage with all the listings
    console.log("listings", listings)
    await res.render('pages/home', {
      listings: listings
    });
  } catch (error) {
    res.render('pages/home');
    console.log(error);
  }
});

// Create a new post
app.post('/', async function (req, res) {

  // Try-Catch for any errors
  try {
    // Get the listing info from submitted form
    const { ListingTitle, Condition, Description, MobileNumber } = req.body;

    // Reload page if empty title or content
    if (!ListingTitle || !Condition || !Description || !MobileNumber) {
      console.log("Unable to create new post, no title or content");
      res.render('pages/home');
    } else {
      // Create post and store in database
      const listings = await prisma.post.create({
        data: { ListingTitle, Condition, Description, MobileNumber },
      });

      // Redirect back to the homepage
      res.redirect('/');
    }
  } catch (error) {
    console.log(error);
    res.render('pages/home');
  }

});

// Tells the app which port to run on
app.listen(8080);