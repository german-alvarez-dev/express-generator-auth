const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'patyjuradodebilbao@gmail.com',
        pass: 'Patylla.23'
    }
})

module.exports = transporter