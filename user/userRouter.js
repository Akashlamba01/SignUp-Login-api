const express = require('express')
const router = express.Router()
const userControler = require('./userController');
const UserModel = require('../auth/middleware')

router.post('/signUp', userControler.singUp)
router.post('/login', userControler.login)
router.post('/logout', UserModel.verifyToken,userControler.logout)
router.post('/sendOtp', userControler.sendOtp)
router.post('/verifyOtp', userControler.verifyOtp)
router.post('/resetPassword', userControler.resetPassword)
router.post('/changePassword', userControler.changePassword)

exports.router = router