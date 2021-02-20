'use strict';

const dao = require('../models/podcast-dao.js');
const express = require('express');
const router = express.Router();
const app = require('../app');
const passport = require('passport');
const { check, validationResult } = require('express-validator');

/* GET home page */
router.get('/', function(req, res, next) {
  //console.log('Valore di locals');
  //console.log(res.locals.loggato);
  //let loggato = res.locals.loggato;
  dao.getAllPodcasts()
  .then((podcasts) => {
    //console.log(podcasts);
    let personalSeguiti = res.locals.personalSeguiti;
    if(personalSeguiti.length > 0){
      for(let i = 0; i < podcasts.length; i++){
        let countSeguiti = 0;
        while(countSeguiti < personalSeguiti.length){
          if(podcasts[i].id === personalSeguiti[countSeguiti].serie_seguite){
            podcasts[i].seguito = 'true';
            break;
          }
          else{
            podcasts[i].seguito = 'false';
          }
          countSeguiti++;
        }
      }
    }
    else{
      for(let i = 0; i < podcasts.length; i++){
        podcasts[i].seguito = 'false';
      }
    }
    
    /*let personalSeguiti = res.locals.personalSeguiti;
    if(personalSeguiti !== [] || personalSeguiti !== ''){
    for(let i = 0; i<podcasts.length; i++){
      for(let j = 0; j<personalSeguiti.length; j++){
        if(podcasts[i].id === personalSeguiti[j].serie_seguite){
          //console.log('Questo è podcasts di i');
          //console.log(podcasts[i]);
          podcasts[i].seguito = 'true';
        }
        else if(podcasts[i].id !== personalSeguiti[j].serie_seguite){
          podcasts[i].seguito = 'false';
        }
      }
      console.log('Questo è il seguito che torna ogni ciclo');
      console.log(podcasts[i].seguito);
    }
    }
    console.log('Questo è il nuovo array di podcast');
    console.log(podcasts);
    //res.locals.podcasts = podcasts;
    //Inserire l'autore della serie*/
    dao.getCategorie()
    .then((categorie) => {
      //console.log('Questi sono i podcasts');
      //console.log(podcasts);
        res.render('podcasts', {title: 'Podcasts', categorie, podcasts, personalSeguiti})
      /*if(res.locals.utente){
        const id_utente = res.locals.utente;
        //dao.controllaSeguite(id_utente)
        //podcastDao.getPersonalSeguitiTotali(id_utente)
        dao.getPersonalSeguiti(id_utente)
        .then((personalSeguiti) => {
          res.render('podcasts', {title: 'Podcasts', podcasts, categorie, personalSeguiti});
        })
      }
      else{
        const personalSeguiti = [];*/

        //console.log(res.locals.personalSerie);
        //res.render('podcasts', {title: 'Podcasts', podcasts, categorie});
      //}
    })
  })
})

//Rimuovere la serie dalle serie seguite
router.post('/rimuovi-seguito', function(req, res, next){
  const id_serie = req.body.id;
  const id_utente = req.session.passport.user;
  dao.removeSeguito(id_utente, id_serie)
  .then(
    /*dao.getAllPodcasts()
    .then((podcasts) => {
      res.render('podcasts', {title: 'Podcasts', podcasts})
    })*/
    res.redirect('/')
  )
});

//Rimuovere l'episodio dai preferiti
router.post('/rimuovi-preferito', function(req, res, next){
  const id_episodio = req.body.id;
  const id_utente = req.session.passport.user;
  const id_serie = req.body.serie;
  dao.removePreferito(id_utente, id_episodio)
  .then(
    //dao.getPersonalEpisodiTotali(id_utente)
    //.then((preferititotali) => {
      //res.render('preferiti', {title: 'Preferiti', preferititotali})
    //})
    dao.getAllEpisodi(id_serie)
    .then((episodi) => {
      res.render('episodio', {title: 'Episodi Serie', episodi})
    })
  );
});

//Aggiungi la serie alle serie seguite
router.post('/aggiungi-seguito', function(req, res, next){
  console.log(req.body);
  const id_serie = req.body.id;
  const id_utente = req.session.passport.user;
  dao.getSeguito(id_utente, id_serie)
  .then(
    /*dao.getAllPodcasts()
    .then((podcasts) => {
      res.render('podcasts', {title: 'Podcasts', podcasts})
    })*/
    res.redirect('/')
  )
});

//Aggiungi l'episodio agli episodi seguiti
router.post('/aggiungi-preferito', function(req, res, next){
  const id_episodio = req.body.id;
  const id_serie = req.body.serie;
  const id_utente = req.session.passport.user;
  dao.aggiungiPreferito(id_utente, id_episodio)
  .then(
    //dao.getPersonalEpisodiTotali(id_utente)
    //.then((preferititotali) => {      
      //res.render('preferiti', {title: 'Preferiti', preferititotali})
    //})
    dao.getAllEpisodi(id_serie)
    .then((episodi) => {
      res.render('episodio', {title: 'Episodi Serie', episodi})
    })
  );
});

//Visualizzare la lista degli episodi
router.post('/visualizza-episodi', function(req, res, next){
  console.log(req.body.id);
  const id_serie = req.body.id;
  dao.getAllEpisodi(id_serie)
  .then((episodi) => {
    console.log('Questo è il catalogo episodi');
    console.log(episodi);
    if(req.user){
      const id_utente = res.locals.utente;
      dao.getEpisodiComprati(id_utente)
      .then((comprati) => {
        if(comprati.length > 0){
        console.log('Episodi comprati');
        console.log(comprati);
        for(let i = 0; i < episodi.length; i++){
          let countComprati = 0;
          while(countComprati < comprati.length){
            if(episodi[i].serie === comprati[countComprati].serie_episodio){
              if(episodi[i].id === comprati[countComprati].episodio){
                episodi[i].comprato = 'true';
                break;
              }
              else{
                episodi[i].comprato = 'false';
              }
            }
            else{
              episodi[i].comprato = 'false';
            }
            countComprati++;
          }
          console.log(episodi[i]);
        }
        //res.locals.episodi = episodi;
        res.render('episodio', {title: 'Episodi Serie', episodi})
      }
      else{
        for(let i = 0; i < episodi.length; i++){
          episodi[i].comprato = 'false';
        }
        //res.locals.episodi = episodi;
        res.render('episodio', {title: 'Episodi Serie', episodi})
      }
      })
    }
    else{
      for(let i = 0; i < episodi.length; i++){        
        episodi[i].comprato = 'false';
      }
      //res.locals.episodi = episodi;
      //console.log('Ciao a tutti');
      res.render('episodio', {title: 'Episodi Serie', episodi})
    }
  })
});

//Rimanda alla pagina di acquisto del relativo episodio
router.post('/acquista-episodio', function(req, res, next){
  console.log('Questa è la richiesta per l\'acquisto degli episodi');
  console.log(req.body);
  const id_episodio = req.body.id;
  const id_utente = req.user.id;
  const id_serie = req.body.serie;
  console.log('Questo è l\'id utente');
  console.log(id_utente);
  console.log('Questo è l\'id episodio');
  console.log(id_episodio);
  console.log('Questo è l\'id della serie');
  console.log(id_serie);
  /*dao.controlloCarta(id_utente)
  .then(
    dao.buyEpisode(id_episodio, id_utente)
    .then(
      res.render('episodio', {title: 'Acquisto'})
    )
  )*/
  res.render('pagamento', {title: 'Pagamento', id_episodio, id_serie});
})

//Fornisce le informazioni dell'episodio e i relativi commenti
router.post('/info-episodio', function(req, res, next){
  const id_episodio = req.body.id;
  dao.getInfoEpisodio(id_episodio)
  .then((info) => {
    dao.getCommenti(id_episodio)
    .then((commenti) => {
      const user = req.user.id;
      res.render('info-episodio', {title: 'Informazioni episodio', info, commenti, user})
    })
  })
})

//Permette la pubblicazione del commento
router.post('/pubblica', function(req, res, next){
  const commento = req.body.commento;
  const id_episodio = req.body.id;
  const autore = req.user.id;
  dao.pubblicaCommento(id_episodio, autore, commento)
  .then(
    dao.getCommenti(id_episodio)
    .then((commenti) => {
      const user = req.user.id;
      console.log('Questi sono i commenti')
      console.log(commenti)
      dao.getInfoEpisodio(id_episodio)
      .then((info) => {
        res.render('info-episodio', {title: 'Commento Pubblicato', commenti, info, user})
      })
    })
  )
})

//Elimina il commento dal database e quindi anche dalla pagina
router.post('/elimina-commento', function(req, res, next){
  console.log(req.body);
  const id_utente = req.user.id;
  console.log('Questo è l\'id dell\'utente');
  console.log(id_utente);
  const id_commento = req.body.idcommento;
  const id_episodio = req.body.idepisodio;
  const autore = req.body.autore;
  dao.removeCommenti(id_commento)
  .then(
    dao.getCommenti(id_episodio)
    .then((commenti) => {
      const user = req.user.id;
      dao.getInfoEpisodio(id_episodio)
      .then((info) => {
      res.render('info-episodio', {title: 'Commenti', autore, commenti, user, info})
      })
    })
  )
})

//Barra di ricerca
router.post('/cerca', function(req, res, next){
  console.log('Questo è il corpo della richiesta, barra di ricerca')
  console.log(req.body);
  const ricerca = req.body.search;
  console.log('Variabile ricerca');
  console.log(ricerca);
  const categoria = req.body.categoria;
  const tipo = req.body.tipo;
  //NO DATI
  if(ricerca === '' && categoria === 'Categoria' && tipo === 'Tipo'){
    res.redirect('/');
  }
  //SOLO TIPO
  else if(ricerca === '' && categoria === 'Categoria' && tipo !== 'Tipo'){
    //TIPO EPISODIO
    if(tipo === 'Episodio'){
      const serie = '';
      dao.cercaEpisodiNoRicerca()
      .then((episodi) => {
        res.render('cerca', {title: 'Search', serie, episodi})
      })
    }
    //TIPO SERIE
    else if(tipo === 'Serie'){
      const episodi = '';
      dao.cercaSerieNoRicerca()
      .then((serie) => {
        res.render('cerca', {title: 'Search', serie, episodi})
      })
    }
  }
  //CATEGORIA E TIPO
  else if(ricerca === '' && categoria !== 'Categoria' && tipo !== 'Tipo'){
    //TIPO SERIE
    if(tipo === 'Serie'){
      const episodi = '';
      dao.cercaSoloSerieNoRicerca(categoria)
      .then((serie) => {
        res.render('cerca', {title: 'Search', serie, episodi})        
      })
    }
    //TIPO EPISODIO
    else if(tipo === 'Episodio'){
      res.redirect('/');
    }
  }
  //SOLO RICERCA
  else if(categoria === 'Categoria' && tipo === 'Tipo'){
    dao.cercaSerie(ricerca)
    .then((serie) => {
      dao.cercaEpisodi(ricerca)
      .then((episodi) => {
        res.render('cerca', {title: 'Search', serie, episodi})
      })
    })
  }
  //RICERCA E CATEGORIA
  else if(categoria !== 'Categoria' && tipo === 'Tipo'){
    const episodi = '';
    dao.cercaSerieCategoria(ricerca, categoria)
    .then((serie) => {
      //dao.cercaEpisodiCategoria(ricerca)
      //.then((episodi) => {
        res.render('cerca', {title: 'Search', serie, episodi})
      //})
    })
  }
  //RICERCA, CATEGORIA E TIPO
  else if(categoria !== 'Categoria' && tipo !== 'Tipo'){
    //TIPO EPISODIO
    if(tipo === 'Episodio'){
      //const serie = '';
      //const episodi = '';
      //dao.cercaEpisodiCategoria(ricerca, categoria)
      //.then((episodi) => {
      //dao.getAllPodcasts()
      //.then((podcasts) => {
        //res.render('podcasts', {message: 'Non è possibile cercare gli episodi per categoria. Lasciare il campo di default', podcasts})
        res.redirect('/');
      //})
      //})
    }
    //TIPO SERIE
    else if(tipo === 'Serie'){
      const episodi = '';
      dao.cercaSerieCategoria(ricerca, categoria)
      .then((serie) => {
        res.render('cerca', {title: 'Search', serie, episodi})
      })
    }
    /*
    else{
      throw(err);
    }*/
  }
  //RICERCA E TIPO
  else if(categoria === 'Categoria' && tipo !== 'Tipo'){
    //TIPO EPISODIO
    if(tipo === 'Episodio'){
      const serie = '';
      dao.cercaEpisodi(ricerca)
      .then((episodi) => {
        res.render('cerca', {title: 'Search', serie, episodi})
      })
    }
    //TIPO SERIE
    else if(tipo === 'Serie'){
      const episodi = '';
      dao.cercaSerie(ricerca)
      .then((serie) => {
        res.render('cerca', {title: 'Search', serie, episodi})
      })
    }
  }
})

//Restituisce le serie seguite (serve per visualizzare l'elenco delle serie seguite nella scheda "Serie seguite" nella pagina)
router.get('/serie-personal', function(req, res, next){
  const id_utente = req.user.id;
  console.log(id_utente);
  //dao.getPersonalSeguiti(id_utente)
  //.then((seguiti) => {
    dao.getPersonalSeguitiTotali(id_utente)
    .then((seguititotali) => {
      res.render('seguiti', {title: 'Seguiti', seguititotali})
    })
  //})
})

//Restituisce gli episodi preferiti (serve per visualizzare l'elenco degli episodi seguiti nella scheda "Episodi preferiti" nella pagina)
router.get('/episodi-personal', function(req, res, next){
  const id_utente = req.user.id;
  console.log(id_utente);
  dao.getPersonalEpisodiTotali(id_utente)
  .then((preferititotali) => {
    res.render('preferiti', {title: 'Preferiti', preferititotali})
  })
})

//Controllo dati carta (numero carta e scadenza)
router.post('/checkout', [
  check('cardnumber').isInt().isCreditCard().notEmpty().isLength({min:16, max:16}),
  check('anno').isInt().notEmpty().isLength({min:4, max:4}),//.isDate(),
  check('mese').isInt().notEmpty().isLength({min:2, max:2}),
  check('cvv').isInt().notEmpty().isLength({min:3, max:3})
], function(req, res, next){
  const err = validationResult(req);
  const id_episodio = req.body.id_episodio;
  const id_utente = req.user.id;
  const id_serie = req.body.id_serie;
  console.log(id_episodio);
  console.log(req.body.mese);
  console.log('Questo è l\'id serie');
  console.log(id_serie);
  if(!err.isEmpty()){
    res.render('pagamento', {title: 'Errore', message: 'I valori inseriti non sono corretti, riprova', id_episodio, id_serie});
  }
  else{
    const anno = req.body.anno;
    const attuale = new Date().getFullYear();
    console.log('Questo è l\'anno attuale');
    console.log(attuale);
    if(anno < attuale){
      res.render('pagamento', {message: 'La tua carta è scaduta', id_episodio, id_serie});
    }
    else if(anno == attuale){
      console.log('Questi sono i mesi');
      const meseAttuale = new Date().getMonth();
      console.log(meseAttuale);
      const mese = req.body.mese;
      console.log(mese);
      if(mese-1 == meseAttuale){
        dao.buyEpisode(id_serie, id_episodio, id_utente)
        .then(
          res.redirect('/')
        )
      }
      else if(mese-1 > meseAttuale){
        dao.buyEpisode(id_serie, id_episodio, id_utente)
        .then(
          res.redirect('/')
        )
      }
      else if(mese-1 < meseAttuale){
        res.render('pagamento', {title: 'Errore', message: 'La tua carta è scaduta', id_episodio, id_serie})
      }
    }
    else if(anno > attuale){
      dao.buyEpisode(id_serie, id_episodio, id_utente)
      .then(
        /*dao.getAllPodcasts()
        .then((podcasts) => {
          res.render('podcasts', {title: 'Podcasts', podcasts})
        })*/
        //NON BASTA REINDIRIZZARE MA DEVO FAR APPARIRE UN BANNER O QUALCOSA
        res.redirect('/')
      )
    }
  }
  /*console.log('Carta di credito e data');
  console.log(req.body);
  const numeroCarta = req.body.cardnumber;
  const scadenza = req.body.scadenza;
  console.log(numeroCarta);
  console.log(scadenza);
  console.log('Questa è la stampa di VERO');
  let carta = parseInt(numeroCarta); //isInteger(carta);
  //let tipo = typeof carta;
  //let controllo = Number.isInteger(vero);
  //console.log(tipo);
  console.log('Lunghezza carta');
  console.log(numeroCarta.length);
  console.log(carta);
  console.log(typeof carta);
  //console.log(controllo);
  if(isNaN(carta) === 'false' && carta > 0 && carta.length === 16){
    console.log('Carta accettata');
    res.redirect('/acquista-episodio');
  }
  else{
    console.log('Non validi');
    res.render('pagamento', {message: 'I valori inseriti non sono validi'});
  }*/

  /*
  //Controllo carta algoritmo Luhn
  const cardnumber = req.body.cardnumber;
  console.log('Corpo della richiesta');
  console.log(req.body);
  function validate(cardnumber){
    let sum = 0;
    while(cardnumber > 0 && cardnumber.length === 16){
      let a = cardnumber % 10;
      cardnumber = Math.floor(cardnumber / 10);
      let b = (cardnumber % 10) * 2;
      cardnumber = Math.floor(cardnumber / 10);
      if(b > 9){
        b-=9;
      }
      sum += a + b;
    }
    return sum % 10 == 0;
  }
  validate(cardnumber);
  console.log('Ciao');
  */
})

module.exports = router;