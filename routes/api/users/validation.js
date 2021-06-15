const Joi = require('joi')
const { UserPlans } = require('../../../helpers/constants')
const subscriptionOptions = Object.values(UserPlans)

const schemaCreateUser = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net'] },
  }),
  password: Joi.string().min(8).max(15).required(),
  subscription: Joi.string()
    .valid(...subscriptionOptions)
    .optional(),
})

const schemaLoginUser = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
})

const schemaUpdateSubscription = Joi.object({
  subscription: Joi.string()
    .valid(...subscriptionOptions)
    .required(),
})

const validate = async (schema, obj, next) => {
  try {
    await schema.validateAsync(obj)
    next()
  } catch (err) {
    next({
      status: 400,
      message: err.message.replace(/"/g, ''),
    })
  }
}
module.exports = {
  validationCreateUser: (req, res, next) => {
    return validate(schemaCreateUser, req.body, next)
  },

  validateLoginUser: (req, res, next) => {
    return validate(schemaLoginUser, req.body, next)
  },
  validateSubscription: (req, res, next) => {
    return validate(schemaUpdateSubscription, req.body, next)
  },
}
