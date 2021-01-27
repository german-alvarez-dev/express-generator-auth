const express = require("express")
const router = express.Router()
const passport = require("passport")

const User = require("../models/user.model")

const bcrypt = require("bcrypt")
const bcryptSalt = 10

const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let token = '';
        for (let i = 0; i < 25; i++) {
            token += characters[Math.floor(Math.random() * characters.length )];
        }

// User signup
router.get("/signup", (req, res) => res.render("auth/signup"))
router.post("/signup", (req, res, next) => {

    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    
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


            User.create({ username, email: email, password: hashPass, confirmationCode: token })
                .then(() => res.redirect("/"))
                .catch(() => res.render("auth/signup", { errorMsg: "No se pudo crear el usuario" }))
        })
        .catch(error => next(error))

        mailer.sendMail({
            from: '"nodemailer test" <patyjuradodebilbao@gmail.com>',
            to: email,
            subject: 'Prueba de envio',
            text: 'hola, confirm your account here http://localhost:5000/auth/confirm/',
            html: `<a href="http://localhost:5000/auth/confirm/${confirmationCode}> Verifica tu email </a>`
          })
            .then(() => res.render('message', { email, username, confirmationCode }))
            .catch(error => console.log(error));
        
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