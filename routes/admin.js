

const express = require("express");
const router = express.Router();

const adminController = require('../controllers/admin');

router.get('/', adminController.home);

router.get('/usuarios', adminController.getUsers);

module.exports = router;