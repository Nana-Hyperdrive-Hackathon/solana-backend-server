const express = require('express')
const router = express.Router()
const notController = require('../controllers/notController')
const verifyToken = require('../middleware/verifyToken')
//rutas POST que tienen como middleware verifyToken para corroborar expiración
router.post('/addNotification', notController.addNotification)
router.post('/authNotification', verifyToken, notController.authNotification)
router.post('/getNotifications', notController.getNotificationsByWallet)
router.post(
  '/getNotificationStatus',

  notController.getNotificationStatus
)

module.exports = router
