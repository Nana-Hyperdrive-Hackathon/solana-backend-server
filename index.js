require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const authRoutes = require('./src/routes/authRoutes')
const homeRoutes = require('./src/routes/homeRoutes')
const decryptToken = require('./src/middleware/decryptToken')
const notRoutes = require('./src/routes/notRoutes')
const blackRoutes = require('./src/routes/blackRoutes')
const tokenRoutes = require('./src/routes/tokenRoutes')

app.use(express.json())
app.use(
  cors({
    origin: '*'
  })
)
app.use('/', homeRoutes)
app.use('/auth', authRoutes)
app.use('/not', notRoutes)
app.use('/black', blackRoutes)
app.use('/token', tokenRoutes)

app.listen(3030, () => {
  console.log('Servidor escuchando en el puerto 3030')
})
