const Mailgen = require('mailgen')
require('dotenv').config()

class EmailService {
  constructor(env, sender) {
    this.sender = sender
    switch (env) {
      case 'development':
        this.link = 'http://ea95fd22fed6.ngrok.io'
        break
      case 'production':
        this.link = 'link for production'
        break

      default:
        this.link = 'http://ea95fd22fed6.ngrok.io'

        break
    }
  }
  #createTemplateVerificationEmail(verifyToken) {
    // Configure mailgen
    const mailGenerator = new Mailgen({
      theme: 'neopolitan',
      product: {
        name: 'React_Ua System',
        link: this.link,
        // Custom copyright notice
      },
    })
    const email = {
      body: {
        intro:
          "Welcome to React_Ua System! We're very excited to have you on board.",
        action: {
          instructions:
            'To get started with React_Ua System, please click here:',
          button: {
            color: '#22BC66', // Optional action button color
            text: 'Confirm your account',
            link: `${this.link}/api/users/verify/${verifyToken}`,
          },
        },
      },
    }
    return mailGenerator.generate(email)
  }
  async sendVerifyEmail(verifyToken, email) {
    const emailHtml = this.#createTemplateVerificationEmail(verifyToken)
    const msg = {
      to: email,
      subject: 'verify your account',
      html: emailHtml,
    }
    const result = await this.sender.send(msg)
    console.log(result)
  }
}

module.exports = EmailService
