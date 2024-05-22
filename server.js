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
app.use(express.urlencoded({extended: true}));

// Needed for Prisma to connect to database
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

// This example uses Express to receive webhooks
const express = require('express')
const app = express()

// Instantiating formsg-sdk without parameters default to using the package's
// production public signing key.
const formsg = require('@opengovsg/formsg-sdk')()

// This is where your domain is hosted, and should match
// the URI supplied to FormSG in the form dashboard
const POST_URI = 'https://plumber.gov.sg/webhooks/9d2440b0-6b13-4810-9fec-e1f2e8dea25a'

// Your form's secret key downloaded from FormSG upon form creation
const formSecretKey = process.env.FORM_SECRET_KEY

// Set to true if you need to download and decrypt attachments from submissions
const HAS_ATTACHMENTS = true

app.post(
  '/submissions',
  async (req, res, next) => {
    try {
      formsg.webhooks.authenticate(req.get('X-FormSG-Signature'), POST_URI);
      next();
    } catch (e) {
      res.status(401).send({ message: 'Unauthorized' });
    }
  },
  async (req, res) => {
    try {
      const submission = HAS_ATTACHMENTS
        ? await formsg.crypto.decryptWithAttachments(formSecretKey, req.body.data)
        : formsg.crypto.decrypt(formSecretKey, req.body.data);

      if (submission) {
        // Save to database
        const savedSubmission = await prisma.submission.create({
          data: {
            formId: req.body.formId,
            data: submission,
          },
        });
        res.status(200).send(savedSubmission);
      } else {
        res.status(400).send({ message: 'Invalid submission data' });
      }
    } catch (error) {
      console.error('Error processing submission:', error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
);


app.listen(8080, () => console.log('Running on port 8080'))

// Main landing page
app.get('/', async function(req, res) {

    // Try-Catch for any errors
    try {
        // Get all blog posts
        const blogs = await prisma.post.findMany({
                orderBy: [
                  {
                    id: 'desc'
                  }
                ]
        });

        // Render the homepage with all the blog posts
        await res.render('pages/home', { blogs: blogs });
      } catch (error) {
        res.render('pages/home');
        console.log(error);
      } 
});

// About page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

// New post page
app.get('/new', function(req, res) {
    res.render('pages/new');
});

// Demo page
app.get('/demo', async function(req, res) {

  var blog_posts = await prisma.post.findMany();

  console.log(blog_posts);

  await res.render('pages/demo', { blog_posts: blog_posts });
});

// Create a new post
app.post('/new', async function(req, res) {
    
    // Try-Catch for any errors
    try {
        // Get the title and content from submitted form
        const { title, content } = req.body;

        // Reload page if empty title or content
        if (!title || !content) {
            console.log("Unable to create new post, no title or content");
            res.render('pages/new');
        } else {
            // Create post and store in database
            const blog = await prisma.post.create({
                data: { title, content },
            });

            // Redirect back to the homepage
            res.redirect('/');
        }
      } catch (error) {
        console.log(error);
        res.render('pages/new');
      }

});

// Delete a post by id
app.post("/delete/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        await prisma.post.delete({
            where: { id: parseInt(id) },
        });
      
        // Redirect back to the homepage
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
  });

// Tells the app which port to run on
app.listen(8080);