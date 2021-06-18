const Contacts = require('../repositories/contacts')

const getAll = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { docs: contacts, ...rest } = await Contacts.listContacts(
      userId,
      req.query
    )
    res.json({
      status: 'success',
      code: 200,
      data: { contacts, ...rest },
    })
  } catch (e) {
    next(e)
  }
}

const getById = async (req, res, next) => {
  try {
    const userId = req.user.id
    const contact = await Contacts.getContactById(userId, req.params.contactId)
    if (contact) {
      return res.json({
        status: 'success',
        code: 200,
        data: { contact },
      })
    }
    return res.json({ status: 'error', code: 404, message: 'Not found' })
  } catch (e) {
    next(e)
  }
}

const create = async (req, res, next) => {
  try {
    const userId = req.user.id
    const contacts = await Contacts.addContact(userId, req.body)
    return res.status(201).json({
      status: 'success',
      code: 201,
      data: { contacts },
    })
  } catch (e) {
    next(e)
  }
}

const remove = async (req, res, next) => {
  try {
    const userId = req.user.id
    const contact = await Contacts.removeContact(userId, req.params.contactId)
    if (contact) {
      return res.json({
        status: 'success',
        code: 200,
        data: { contact },
      })
    }
    return res.json({ status: 'error', code: 404, message: 'Not found' })
  } catch (e) {
    next(e)
  }
}

const update = async (req, res, next) => {
  try {
    const userId = req.user.id
    const contact = await Contacts.updateContact(
      userId,
      req.params.contactId,
      req.body
    )
    if (contact) {
      return res.json({
        status: 'success',
        code: 200,
        data: { contact },
      })
    }
    return res.json({ status: 'error', code: 404, message: 'Not found' })
  } catch (e) {
    next(e)
  }
}

module.exports = {
  getAll,
  getById,
  remove,
  create,
  update,
}
