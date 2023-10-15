const express = require('express')
const router = express.Router()
const blackController = require('../controllers/blackController')

//rutas POST que tienen como middleware verifyToken para corroborar expiración
router.post('/addBlacklist', blackController.addBlacklist)
router.post('/getBlacklist', blackController.getToken)

module.exports = router
