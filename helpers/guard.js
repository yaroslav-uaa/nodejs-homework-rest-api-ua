const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const Users = require('../repositories/users')
const { HttpCode } = require('./constants')
require('dotenv').config()
const SECRET_KEY = process.env.SECRET_KEY

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = SECRET_KEY

passport.use(
  new JwtStrategy(opts, async (payload, done) => {
    try {
      const user = await Users.findById(payload.id)
      if (!user) {
        return done('User not found')
      }
      if (!user.token) {
        return done(null, false)
      }
      return done(null, user)
    } catch (error) {
      return done(error, false)
    }
  })
)

const guard = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    const headerAuth = req.get('Authorization')
    let token = null
    if (headerAuth) {
      token = headerAuth.split(' ')[1]
    }
    if (err || !user || token !== user?.token) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: 'error',
        code: HttpCode.UNAUTHORIZED,
        message: 'Invalid credentials',
      })
    }

    req.user = user
    return next()
  })(req, res, next)
}
module.exports = guard
