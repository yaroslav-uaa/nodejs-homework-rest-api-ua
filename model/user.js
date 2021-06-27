const { Schema, model } = require('mongoose')
const gravatar = require('gravatar')
const { UserPlans } = require('../helpers/constants')
const bcrypt = require('bcryptjs')

const SALT_WORK_FACTOR = 8

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, 'Set password for user'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    subscription: {
      type: String,
      enum: [UserPlans.START, UserPlans.PRO, UserPlans.BUSINESS],
      default: UserPlans.START,
    },
    token: String,
    avatar: {
      type: String,
      default: function () {
        return gravatar.url(this.email, { s: '250' }, true)
      },
    },
    idCloudAvatar: {
      type: String,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)
    this.password = await bcrypt.hash(this.password, salt)
  }
  next()
})

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

const User = model('user', userSchema)

module.exports = User
