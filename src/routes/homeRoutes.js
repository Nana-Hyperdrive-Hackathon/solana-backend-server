const express = require('express')
const router = express.Router()
const homeController = require('../controllers/homeControllers')

//rutas POST que tienen como middleware verifyToken para corroborar expiración
router.post('', homeController.home)
router.get('', homeController.home)

module.exports = router
