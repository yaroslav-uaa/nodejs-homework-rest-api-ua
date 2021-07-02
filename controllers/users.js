const Users = require('../repositories/users')
const { HttpCode } = require('../helpers/constants')
const jwt = require('jsonwebtoken')
const fs = require('fs/promises')
const path = require('path')
const EmailService = require('../services/email')
const { CreateSenderNodemailer } = require('../services/email-sender')
require('dotenv').config()

// const UploadAvatarService = require('../services/local-upload')
const UploadService = require('../services/cloud-upload')

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

    const { id, email, subscription, avatar, verifyToken } = await Users.create(
      req.body
    )
    try {
      const emailService = new EmailService(
        process.env.NODE_ENV,
        new CreateSenderNodemailer()
      )
      await emailService.sendVerifyEmail(verifyToken, email)
    } catch (error) {
      console.log(error)
    }

    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      message: 'You registered successfully',
      user: { id, email, subscription, avatar },
    })
  } catch (e) {
    next(e)
  }
}

const login = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email)
    const isValidPassword = await user?.isValidPassword(req.body.password)
    console.log(user.isVerified)
    if (!user || !isValidPassword || !user.isVerified) {
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

    const { email, subscription } = user

    return res.json({
      status: 'success',
      code: HttpCode.OK,
      data: { token, user: { email, subscription } },
      message: 'You have logged in',
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

// // *Local Upload

// const avatars = async (req, res, next) => {
//   try {
//     const id = req.user.id
//     const uploads = new UploadAvatarService(process.env.AVATAR_OF_USERS)
//     const avatarUrl = await uploads.saveAvatar({ idUser: id, file: req.file })

//     try {
//       await fs.unlink(path.join(process.env.AVATAR_OF_USERS, req.user.avatar))
//     } catch (e) {
//       console.log(e.message)
//     }
//     await Users.updateAvatar(id, avatarUrl)
//     res.json({
//       status: 'success',
//       code: HttpCode.OK,
//       data: { avatarUrl },
//     })
//   } catch (error) {
//     next(error)
//   }
// }

const avatars = async (req, res, next) => {
  try {
    const id = req.user.id
    const uploads = new UploadService()
    const { idCloudAvatar, avatarUrl } = await uploads.saveAvatar(
      req.file.path,
      req.user.idCloudAvatar
    )
    // delete file on folder uploads
    await fs.unlink(req.file.path)

    await Users.updateAvatar(id, avatarUrl, idCloudAvatar)
    res.json({
      status: 'success',
      code: HttpCode.OK,
      data: { avatarUrl },
    })
  } catch (error) {
    next(error)
  }
}

const verify = async (req, res, next) => {
  try {
    const user = await Users.findByVerifyToken(req.params.token)
    if (user) {
      await Users.updateVerifyToken(user.id, true, null)
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: { message: 'Success!' },
      })
    }
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      message: 'Verification token isn`t valid',
    })
  } catch (error) {
    next(error)
  }
}

const repeatEmailVerification = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email)
    if (user) {
      const { email, isVerified, verifyToken } = user
      if (!isVerified) {
        const emailService = new EmailService(
          process.env.NODE_ENV,
          new CreateSenderNodemailer()
        )
        await emailService.sendVerifyEmail(verifyToken, email)
        return res.status(HttpCode.OK).json({
          status: 'success',
          code: HttpCode.OK,
          message: 'Resubmitted verification',
        })
      }
      return res.status(HttpCode.CONFLICT).json({
        status: 'error',
        code: HttpCode.CONFLICT,
        message: 'Email has been verified',
      })
    }
    return res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: 'User not found',
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
  avatars,
  repeatEmailVerification,
  verify,
}
