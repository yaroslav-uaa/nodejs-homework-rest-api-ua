const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { limiterAPI } = require('./helpers/constants')

const contactsRouter = require('./routes/api/contacts')
const usersRouter = require('./routes/api/users')

const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(helmet())
app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json({ limit: 10000 }))
// another way to init usersRouter
app.use('/api/', rateLimit(limiterAPI))

app.use('/api/users', usersRouter)
app.use('/api/contacts', contactsRouter)
// control error
app.use((req, res) => {
  res.status(404).json({ status: 'error', code: 404, message: 'Not found' })
})
// uncontrol error
app.use((err, req, res, next) => {
  const status = err.status || 500
  res
    .status(status)
    .json({ status: 'fail', code: status, message: err.message })
})

module.exports = app
