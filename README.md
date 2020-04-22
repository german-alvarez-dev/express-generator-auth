# week5_day1

> Passport | Sign Up, Login, Logout
>
> Passport | Security & Roles

## Main points: Passport | Sign Up, Login, Logout

- Passport dispone de **Local Strategy** para gestionar el inicio de sesión mediante usuario/contraseña.
- Setup:
    * Instalar y requerir dependencias:
      ````javascript
      const session = require("express-session")
      const bcrypt = require("bcrypt")
      const passport = require("passport")
      const LocalStrategy = require("passport-local").Strategy
      const flash = require("connect-flash")    // Error handling
      ````
      
    * Configurar middleware de `express-session`:
      ````javascript
      app.use(session({
        secret: "our-passport-local-strategy-app",
        resave: true,
        saveUninitialized: true
      }))
      ````

    * Configurar serialización y deserialización de usuario:
      ````javascript
      passport.serializeUser((user, cb) => cb(null, user._id))
      passport.deserializeUser((id, cb) => {
        User.findById(id, (err, user) => {
          if (err) { return cb(err) }
          cb(null, user)
        })
      })
      ````
      
    * Configurar estrategia:
      ````javascript
      app.use(flash())    // Error handling
      passport.use(new LocalStrategy({ passReqToCallback: true }, (req, username, password, next) => {
        User.findOne({ username })
          .then(theUser => {
            if (!theUser) return next(null, false, { message: "Nombre de usuario incorrecto" })
            if (!bcrypt.compareSync(password, theUser.password)) return next(null, false, { message: "Contraseña incorrecta" })
            return next(null, theUser);
          })
          .catch(err => next(err))
      }))
      ````
    
    * Inicializar tanto `passport` como `passport session`:
      ````javascript
      app.use(passport.initialize())
      app.use(passport.session())
      ````
    
   * Configurar dos endpoints para login (`.get()`y `.post()`) y uno para logout (`.get()`):
       ````javascript
       router.get("/login", (req, res) => res.render("auth/login", { "message": req.flash("error") }))
       router.post("/login", passport.authenticate("local", {
         successRedirect: "/",
         failureRedirect: "/login",
         failureFlash: true,
         passReqToCallback: true
       }))
       router.get("/logout", (req, res) => {
         req.logout()
         res.redirect("/login")
       })
       ````
    
    

## Main points: login check

Passport incluye el método `.isAuthenticated()` en el objeto `req` para comprobar si el usuario tiene la sesión iniciada:

  ````javascript
  const checkLoggedIn = (req, res, next) => req.isAuthenticated() ? next() : res.render('index', { loginErrorMessage: 'Acceso restringido' })
  ````
Que puede ser utilizado como *blocker*:
  ````javascript
  router.get("/profile", checkLoggedIn, (req, res) => res.render("profile", { user: req.user }));
  ````
  

  
## Main points: Roles

Los roles, almacenados en cada usuario como la propiedad `role`, permiten garantizar privilegios y/o accesos a grupos de usuarios en la aplicación cubriendo, entre otros, dos escenarios:

  - Renderizado condicional según el rol, enviándolo a la vista mediante una función reusable:
    ````javascript
    const isAdmin = user => user.role === 'ADMIN'
    ````
    Que puede enviarse a una vista:
    ````javascript
    router.get('/', (req, res) => res.render('index', { isAdmin: isAdmin(req.user) }))
    ````
    
  - Limitando el acceso a una ruta, mediante un *middleware*:
    ````javascript
    const checkRole = roles => (req, res, next) => req.isAuthenticated() && roles.includes(req.user.role) ? next() : res.render("index", { roleErrorMessage: `Necesitas ser  ${roles} para acceder aquí` })
    ````
    Que puede ser utilizado como *blocker*:
    ````javascript
    router.get('/edit-route', checkRole(['ADMIN, EDITOR']), (req, res) => res.render('protected-route', { user: req.user }))
    ````
    
 
## Main points: owned items

- Es posible relacionar items en una aplicación con el usuario que los ha creado, disponiendo de una propiedad `owner` en cada item donde almacenar el `ObjectId` de su *owner*.

- Esto permite renderizar en una vista únicamente los items asociados al *owner*:
  ````javascript
  Item.find({owner: req.user._id})
    .then(itemsOwnedByUser => res.render('items-index', {itemsOwnedByUser})
  ````
