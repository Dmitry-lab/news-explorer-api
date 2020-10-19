const express = require('express');
const { findMe } = require('../controllers/users');

const router = express.Router();

router.get('/me', findMe);

module.exports = router;
