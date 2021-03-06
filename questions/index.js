const express = require('express');
const app = express();
// Initialise startup routes and database
require('./startup/routes')(app);
require('./startup/db')();

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));