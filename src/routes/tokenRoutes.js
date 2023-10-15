const express = require('express')
const router = express.Router()
const tokenController = require('../controllers/tokenController')

//rutas POST que tienen como middleware verifyToken para corroborar expiración
router.post('/payTokens', tokenController.addToken)
router.post('/transferTokens', tokenController.transferTokens)
router.delete('/burnTokens', tokenController.burnTokens)
module.exports = router
