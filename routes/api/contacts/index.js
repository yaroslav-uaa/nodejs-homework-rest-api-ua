const express = require('express')
const router = express.Router()
const ctrl = require('../../../controllers/contacts')
const guard = require('../../../helpers/guard')

const passport = require('passport')

const {
  validationCreateContact,
  validationUpdateContact,
  validationUpdateStatus,
  validateMongoId,
} = require('./validation')

router.use((req, res, next) => {
  console.log(req.url)
  next()
})

router
  .get('/', guard, ctrl.getAll)
  .post('/', guard, validationCreateContact, ctrl.create)

router
  .get('/:contactId', guard, validateMongoId, ctrl.getById)
  .delete('/:contactId', guard, validateMongoId, ctrl.remove)
  .put(
    '/:contactId',
    guard,
    validateMongoId,
    validationUpdateContact,
    ctrl.update
  )

router.patch('/:contactId/favorite', guard, validationUpdateStatus, ctrl.update)

module.exports = router
