const client = require('../config/db')

const NotModel = {}

NotModel.setNotCollection = async () => {
  try {
    await client.connect()
    const myDB = client.db('test')
    const myColl = myDB.collection('notifications')
    return myColl
  } catch (error) {
    console.error(
      '[notModel - setNotCollection] Error al conectarse / obtener la colección notifications',
      error
    )
    throw error
  }
}

NotModel.addNotification = async (
  _wallet,
  _timestamp,
  _title,
  _subtitle,
  _body,
  _notification,
  _seen
) => {
  try {
    const setNotCollection = await NotModel.setNotCollection()
    const newNotificationDoc = {
      wallet: _wallet,
      timestamp: _timestamp,
      title: _title,
      subtitle: _subtitle,
      body: _body,
      notification: _notification,
      seen: _seen
    }

    console.log(newNotificationDoc)

    const result = await setNotCollection.insertOne(newNotificationDoc)

    if (!result) return false

    return result
  } catch (error) {
    console.error(
      '[NotModel - addNotification] Error al guardar la notificacion',
      error
    )
    return false
  }
}

NotModel.authNotification = async (
  _wallet,
  _timestamp,
  _device_id,
  _accion,
  _result
) => {
  try {
    const setNotCollection = await NotModel.setNotCollection()

    const filter = { wallet: _wallet, timestamp: _timestamp }

    const res = await NotModel.getNotificationStatus(_wallet, _timestamp)

    if (res === 'expirada') {
      console.log(
        `Notificación de ${_wallet} con timestamp ${_timestamp} expirada, no se autoriza`
      )
      return false
    }

    if (res === 'cancelada') {
      console.log(
        `Notificación de ${_wallet} con timestamp ${_timestamp} rechazada previamente, no se autoriza`
      )
      return false
    }

    if (res === 'aceptada') {
      console.log(
        `Notificación de ${_wallet} con timestamp ${_timestamp} aceptada previamente, no se autoriza nuevamente`
      )
      return false
    }

    const updateDocument = {
      $set: {
        seen: true,
        notification: {
          type: _accion,
          result: 'aceptada'
        }
      }
    }

    const result = await setNotCollection.updateOne(filter, updateDocument)

    if (!result) return false

    return true
  } catch (error) {
    console.error(
      '[NotModel - addNotification] Error al guardar la notificacion',
      error
    )
    return false
  }
}

NotModel.expireNotification = async (_wallet, _timestamp, _accion) => {
  try {
    const setNotCollection = await NotModel.setNotCollection()

    const filter = { wallet: _wallet, timestamp: _timestamp }

    console.log(_accion)

    const updateDocument = {
      $set: {
        seen: true,
        notification: { type: _accion, result: 'expirada' }
      }
    }

    const result = await setNotCollection.updateOne(filter, updateDocument)

    if (!result) return false

    return true
  } catch (error) {
    console.error(
      '[NotModel - expireNotification] Error al expirar la notificacion',
      error
    )
    return false
  }
}

NotModel.getNotificationsByWallet = async _wallet => {
  const notificacions = []
  try {
    const setNotCollection = await NotModel.setNotCollection()
    const result = await setNotCollection.find({ wallet: _wallet })

    for await (const doc of result) {
      notificacions.push(doc)
    }

    return notificacions
  } catch (error) {
    console.error(
      '[NotModel - addNotification] Error al recuperar las notificaciones',
      error
    )
    return false
  }
}

NotModel.getNotificationStatus = async (_wallet, _timestamp) => {
  const notificacions = []
  try {
    const setNotCollection = await NotModel.setNotCollection()
    const result = await setNotCollection.find({
      wallet: _wallet,
      timestamp: _timestamp
    })

    for await (const doc of result) {
      notificacions.push(doc)
    }

    const status = notificacions[0].notification['result']

    return status
  } catch (error) {
    console.error(
      '[NotModel - addNotification] Error al recuperar las notificaciones',
      error
    )
    return false
  }
}

module.exports = NotModel
