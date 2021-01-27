const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'gaaaaabrielagallango@gmail.com',
        pass: 'gaby1356'
    }
})

module.exports = transporter