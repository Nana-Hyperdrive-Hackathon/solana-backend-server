const chai = require('chai')
const sinon = require('sinon')
const { expect } = chai
const crypto = require('../crypto/cryptoMock')

const jwt = require('jsonwebtoken')

const authController = require('../../src/controllers/authControllers')
const AuthModel = require('../../src/models/authModel')
const generateToken = require('../../src/middleware/generateToken')

describe('authController', () => {
  describe('create', () => {
    let req, res, status, json, send

    // antes de cada prueba
    beforeEach(() => {
      req = {
        body: {
          wallet: 'testWallet'
        }
      }
      json = sinon.spy()
      send = sinon.spy()
      status = sinon.stub().returns({ json, send })
      res = { status }
    })

    // después de cada prueba
    afterEach(() => {
      sinon.restore()
    })

    it('should return 400 if wallet is not provided', async () => {
      req.body.wallet = undefined
      await authController.create(req, res)
      expect(status.calledWith(400)).to.be.true
      expect(json.calledWith({ error: 'Datos inválidos' })).to.be.true
    })

    it('should return 401 if wallet already has a saved device', async () => {
      sinon.stub(AuthModel, 'getDeviceIDbyWallet').returns([{}])
      await authController.create(req, res)
      expect(status.calledWith(401)).to.be.true
      expect(
        json.calledWith({ msg: 'La wallet ya tiene dispositivo guardado' })
      ).to.be.true
    })

    it('should return 500 if AuthModel.createAuthData fails', async () => {
      sinon.stub(AuthModel, 'createAuthData').returns(false)

      await authController.create(req, res)

      expect(status.calledWith(500)).to.be.true
      expect(json.calledWith({ msg: 'No se guardó la wallet' })).to.be.true
    })

    it('should delete the device if not verified in time', async () => {
      const clock = sinon.useFakeTimers() // Iniciar el reloj falso

      const deleteDeviceStub = sinon
        .stub(AuthModel, 'deleteDevice')
        .returns({ eliminados: 1 })
      sinon.stub(AuthModel, 'createAuthData').returns(true)
      sinon.stub(AuthModel, 'checkDevice').returns({ verified: false })

      await authController.create(req, res)

      clock.tick(120001) // Avanzar el tiempo en 120001ms

      expect(deleteDeviceStub.calledWith('testWallet')).to.be.true

      clock.restore() // Restaurar el comportamiento normal del tiempo
    })

    it('should return a token if AuthModel.createAuthData is successful', async () => {
      sinon.stub(AuthModel, 'createAuthData').returns(true)
      sinon.stub(AuthModel, 'checkDevice').returns({ verified: false })

      await authController.create(req, res)

      expect(status.calledWith(200)).to.be.true
      expect(json.args[0][0].token).to.not.be.null
    })
  })
})
