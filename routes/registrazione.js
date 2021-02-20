'use strict';

//Routes della pagina di registrazione dell'utente sul sito

//INSERT INTO nometabella VALUES (parametro1, parametro2 ...)

const dao = require('../models/registrazione-dao');
const express = require('express');
const router = express.Router();
const app = require('../app');

//Pagina di registrazione
router.get('/', function(req, res, next) {
  res.render('registrazione', {title: 'Registrazione'});
});

router.post('/', function(req, res, next){
  const credenziali = req.body;
  dao.putPersonalinfo(credenziali)
  .then((message) => {
    if(message === undefined) {
      res.render('registrazione-riuscita', {title: 'Successo'})
    }
    else if(message != undefined){
      res.render('registrazione', {title: 'Registrazione Fallita', message});
    }
  });
});

module.exports = router;
