'use strict';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const moment = require('moment');
const fileUpload = require('express-fileupload');
const { check } = require('express-validator');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 13; // --> Quante volte si vuole ciclare per fare l'hash della password inserita dall'utente

//Includo i modelli per creare le videate
const userDao = require('./models/user-dao.js');
const gestioneDao = require('./models/gestione-dao');
const podcastDao = require('./models/podcast-dao');

const podcastsRouter = require('./routes/podcast');
const sessionsRouter = require('./routes/sessions');
const paginagestione = require('./routes/pagina-gestione');
const registrazione = require('./routes/registrazione');

const db = require('./db.js');
const { info } = require('console');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
/*
//Controllo se ha fatto il login
app.locals.loginEseguito = function(req, res, next) {
  let loggato;
  if(req.isAuthenticated()){
    loggato = 'true';
  }
  else{
    loggato = 'false';
  }
  return loggato;
}
*/

// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then(({user, check}) => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!check) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  userDao.getUserById(id).then(user => {
    done(null, user);
  });
});

// set up the session
app.use(session({
  //store: new FileStore(), // by default, Passport uses a MemoryStore to keep track of the sessions - if you want to use this, launch nodemon with the option: --ignore sessions/
  secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false 
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

//Controllo se è loggato
app.use((req, res, next) => {
  if(req.isAuthenticated()){
    res.locals.loggato = 'true';
    //UTENTE = ID UTENTE LOGGATO
    res.locals.utente = req.user.id;
    podcastDao.getAdminValue(req.user.id)
    .then((admin) => {
      console.log(admin);
      res.locals.admin = admin.admin;
    })
  }
  else{
    res.locals.admin = '';
    res.locals.loggato = 'false';
  }
  next();
})

//Mando le categorie alla barra di ricerca
app.use((req, res, next) => {
  podcastDao.getCategorie()
  .then((categorie) => {
    res.locals.categorie = categorie;
    next();
  })
})

//Mando il valore di admin
app.use((req, res, next) => {
  if(res.locals.utente){
    podcastDao.getAdminValue(res.locals.utente)
    .then((admin) => {
      res.locals.admin = admin.admin;
    })
  }
  /*else{
    res.locals.admin = '';
  }*/
  next();
})

//Controllo se ci sono serie seguite e se ci sono le 
//confronto con ogni pulsante per farlo sparire a seconda
//se è seguita o no

app.use((req, res, next) => {
  if(res.locals.utente){
    const id_utente = res.locals.utente;
    //dao.controllaSeguite(id_utente)
    //podcastDao.getPersonalSeguitiTotali(id_utente)
    podcastDao.getPersonalSeguiti(id_utente)
    .then((personalSeguiti) => {
      console.log('Questi sono i seguiti totali');
      console.log(personalSeguiti);
      res.locals.personalSeguiti = personalSeguiti;
    })
  }
  else{
    const personalSeguiti = [];
    console.log('Queste sono le serie seguite');
    console.log(personalSeguiti);
    res.locals.personalSeguiti = personalSeguiti;
  }
  next();
})

/*
//Prendo gli autori dal db
app.get((req, res, next) => {
  podcastDao.getIDAutore()
  .then((rows) => {
    
  })
  next();
})
*/

//Controllo se l'episodio è acquistato
app.use((req, res, next) => {
  if(req.user){
    const id_utente = req.user.id;
    podcastDao.getEpisodiComprati(id_utente)
    .then((comprati) => {
      console.log('Episodi comprati');
      console.log(comprati);
      res.locals.comprati = comprati;
    })
  }
  else{
    const comprati = '';
    res.locals.comprati = comprati;
  }
    next();
})


/*
//Controllo se la serie è seguita o no
app.use((req, res, next) => {
  const id_utente = res.locals.utente;
  podcastDao.getPersonalSeguiti(id_utente)
  .then((personalSeguiti) => {
    console.log('Questi sono i seguiti');
    console.log(personalSeguiti);
    personalSeguiti.forEach(element => {
      console.log('Questo è element');
      console.log(element);
    if(element.serie_seguita === id_episodio){
      res.locals.seg = 'true';
    }
    else if(element.serie_seguita !== id_episodio){
      res.locals.seg = 'false';
    }
    next();
    });
  })
})*/

/*
//Controllo se l'episodio è preferito o no
app.use((req, res, next) => {
  podcastDao.getPersonalEpisodiPreferiti()
  .then((preferiti) => {
    
    next();
  })
})
*/

//Controllo se si è loggati e rimando al login
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    next();
  }
  else{
    res.redirect('/login');
  }
}

//Controllo se si è creatori o no
const isAdmin = (req, res, next) => {
  const id = req.user.id;
  const sql = 'SELECT admin FROM user WHERE id = ?';
  db.get(sql, [id], (err, row) => {
    const admin = row.admin;
    if(err){
      throw(err);
    }
    else if(admin === 1){
      next();
    }
    else{
      return res.render('failed-login');
    }
  });
}

// default options
//Upload delle copertine
app.use(fileUpload());

// define default variables for the views
app.use(function (req, res, next) {
  app.locals.moment = moment;
  app.locals.title = '';
  app.locals.message = '';
  app.locals.active = '';
  next();
});

app.use('/', sessionsRouter);

//Originale: app.use('/', isLoggedIn, podcastsRouter);
//Se c'è "isLoggedIn" se non è loggato reindirizza alla pagina login e non alla home
app.use('/', podcastsRouter);

//Controllare se è loggato, se non lo è procedere, sennò respingere la richiesta
app.use('/registrazione', registrazione);

app.use('/gestione', isLoggedIn, isAdmin, paginagestione);

app.use('/acquista-episodio', isLoggedIn, podcastsRouter);

//catch 404 and forward to error handler
app.use('/', function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
