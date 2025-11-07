const express = require('express');
const router = express.Router();

const { 
    registerAuthController, 
    loginAuthController,
    forgotPasswordController,
    resetPasswordController
} = require('../controllers/authController');


router.post('/signup', registerAuthController);
router.post('/login', loginAuthController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);



module.exports = router;