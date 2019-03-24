require('dotenv').config();
const logger = require('morgan');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const getLgNews = require('./app/sites/lg');

app.set('port', port);

app.use(logger('dev'));

getLgNews();

app.listen(port, () => console.log(`App started on port ${process.env.PORT}`));
