const mongoose = require('mongoose')

const devicesSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
    trim: false,
    unique: true
  },
  device_id: {
    type: String,
    required: true,
    trim: false,
    unique: true
  },
  verified: {
    type: Boolean,
    required: true,
    trim: false,
    unique: true
  }
})

const DevicesModel = mongoose.model('devices', devicesSchema)
module.exports = DevicesModel
