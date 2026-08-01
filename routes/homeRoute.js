const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // <-- correct depth


router.get('/',authController.home);

router.get('/login',authController.viewLogin);
router.get('/signup', authController.viewSignup);



module.exports = router; 