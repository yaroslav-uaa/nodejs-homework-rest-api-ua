const express = require('express')
const router = express.Router()
const ctrl = require('../../../controllers/users')
const guard = require('../../../helpers/guard')

const {
  validateLoginUser,
  validateSubscription,
  validationCreateUser,
} = require('./validation')

router.post('/register', validationCreateUser, ctrl.register)
router.post('/login', validateLoginUser, ctrl.login)
router.post('/logout', guard, ctrl.logout)
router.get('/current', guard, ctrl.current)
router.patch('/', guard, validateSubscription, ctrl.updateSubscription)

module.exports = router
