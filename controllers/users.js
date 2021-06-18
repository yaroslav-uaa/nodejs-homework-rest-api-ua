const Users = require('../repositories/users')
const { HttpCode } = require('../helpers/constants')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const SECRET_KEY = process.env.SECRET_KEY

const register = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email)

    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: 'error',
        code: HttpCode.CONFLICT,
        message: 'Email is already used',
      })
    }

    const { id, email, subscription } = await Users.create(req.body)

    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      message: 'You registered successfully',
      user: { id, email, subscription },
    })
  } catch (e) {
    next(e)
  }
}

const login = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email)
    const isValidPassword = await user?.isValidPassword(req.body.password)
    if (!user || !isValidPassword) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: 'error',
        code: HttpCode.UNAUTHORIZED,
        message: 'Invalid login or password',
      })
    }
    const id = user.id
    const payload = { id }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' })
    await Users.updateToken(id, token)

    const {
      _doc: { email, subscription },
    } = user

    return res.json({
      status: 'success',
      code: HttpCode.OK,
      token,
      message: 'You have logged in',
      user: { email, subscription },
    })
  } catch (e) {
    next(e)
  }
}

const logout = async (req, res, next) => {
  try {
    const id = req.user.id
    await Users.updateToken(id, null)
    return res.status(HttpCode.NO_CONTENT).json({})
  } catch (e) {
    next(e)
  }
}

const current = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: 'error',
        code: HttpCode.UNAUTHORIZED,
        message: 'Not authorized',
      })
    }

    const { email, subscription } = req.user

    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      user: { email, subscription },
    })
  } catch (error) {
    next(error)
  }
}

const updateSubscription = async (req, res, next) => {
  try {
    const id = req.user.id
    const updatedSubscription = await Users.updateSubscription(id, req.body)

    if (!updatedSubscription) {
      return res.status(HttpCode.NOT_FOUND).json({
        status: 'error',
        code: HttpCode.NOT_FOUND,
        message: 'Not found',
      })
    }
    const { email, subscription } = updatedSubscription
    return res.json({
      status: 'success',
      code: HttpCode.OK,
      message: 'Contact updated',
      payload: { email, subscription },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  login,
  logout,
  current,
  updateSubscription,
}
