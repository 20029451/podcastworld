'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const app = require('../app');


// Login page
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* Do the login */
router.post('/sessions', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
        // display wrong login messages
        return res.render('login', {'message': info.message});
    }
    // success, perform the login
    req.login(user, function(err) {
      if (err) { return next(err); }
      // req.user contains the authenticated user
      //console.log(user.id);
      res.redirect('/');

      //Codice presente in passport che si può provare ad usare al posto di "res.redirect('/');" nella riga sopra, per mettere "user.id" al posto di "user.username" per tornare l'id e usarlo in altri pezzi di codice
      //return res.redirect('/' + user.id); Senza il + perchè sennò manda alla route /1
    });
  })(req, res, next);
});

router.delete('/sessions/current', function(req, res, next) {
  req.logout();
  res.end();
});

module.exports = router;
