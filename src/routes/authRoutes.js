const express = require('express')
const router = express.Router()
const authController = require('../controllers/authControllers')
const verifyToken = require('../middleware/verifyToken')

//rutas POST que tienen como middleware verifyToken para corroborar expiración
router.post('/create', authController.create)
router.post('/save', verifyToken, authController.save)
router.post('/verify', authController.verify)
router.post('/checkdevice', authController.checkDevice)

module.exports = router
