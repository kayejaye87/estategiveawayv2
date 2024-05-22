// Needed for dotenv
require("dotenv").config();

// This example uses Express to receive webhooks
const express = require('express')
const app = express()

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
