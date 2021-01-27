const express = require("express")
const router = express.Router()
const passport = require("passport")

const User = require("../models/user.model")

const bcrypt = require("bcrypt")
const bcryptSalt = 10

const mailer = require('../configs/nodemailer.config')


// User signup
router.get("/signup", (req, res) => res.render("auth/signup"))
router.post("/signup", (req, res, next) => {

    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 25; i++) {
        token += characters[Math.floor(Math.random() * characters.length)];
    }

    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const confirmationCode = token

    if (!username || !password) {
        res.render("auth/signup", { errorMsg: "Rellena el usuario y la contraseña" })
        return
    }

    User.findOne({ username })
        .then(user => {
            if (user) {
                res.render("auth/signup", { errorMsg: "El usuario ya existe en la BBDD" })
                return
            }
            const salt = bcrypt.genSaltSync(bcryptSalt)
            const hashPass = bcrypt.hashSync(password, salt)

            User.create({ username, email, password: hashPass, confirmationCode: token })

                .then(() => res.redirect("/"))
                .catch(() => res.render("auth/signup", { errorMsg: "No se pudo crear el usuario" }))
        })
        .catch(error => next(error))

    mailer.sendMail({
        from: '"Gabrielas mail" <gaaaaabrielagallango@gmail.com>',
        to: email,
        subject: "prueba dos",
        text: "jdsajdsadsd",
        html: `<a href="http://localhost:3000/auth/confirm/${confirmationCode}"> Verifica tu email </a>`
    })
        .then(info => res.render('email-sent', { email, subject, message, info }))
        .catch(error => console.log(error));
})


router.get("/confirm/:confirmationCode", (req, res) => {
    token = req.params.confirmationCode
    User.findOneAndUpdate({ confirmationCode: { $eq: token } }, { status: 'Active' })
        .then(() => {
            res.render("confirmation", req.user)
        })
})


// User login
router.get('/login', (req, res) => res.render('auth/login', { "errorMsg": req.flash("error") }))
router.post('/login', passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true,
    badRequestMessage: 'Rellena todos los campos'
}))


// User logout
router.get("/logout", (req, res) => {
    req.logout()
    res.redirect("/login")
})

module.exports = router