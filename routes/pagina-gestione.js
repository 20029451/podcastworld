'use strict';

const dao = require('../models/gestione-dao');
const { check, validationResult } = require('express-validator');

const express = require('express');
const router = express.Router();
const app = require('../app');
const fileUpload = require('express-fileupload');
const { param } = require('./podcast');
const moment = require('moment');

//GET pagina gestione
router.get('/', function(req, res, next) {
    const id = req.user.id;
    dao.getPersonalSeries(id)
    .then((series) => {
        res.render('gestione', {title: 'Gestione', series});
    });
});

//Delete serie
router.post('/rimozione', function(req, res, next) {
    //La req contiene l'id della serie relativa al bottone che è stato cliccato
    const id_serie = req.body.id;
    dao.deletePersonalSeries(id_serie)
    .then(
        res.render('rimozione', {title: 'Rimozione'})
    );
});

//Modifica le serie
router.post('/modifica', function(req, res, next) {
    const id_serie = req.body.id;
    dao.getPersonalSerieFromId(id_serie)
    .then((serie) => {
        dao.getEpisodiFromIdSerie(id_serie)
        .then((episodi) => {
            res.render('modifica-serie', {title: 'Modifica Serie', serie, episodi});
        });
    });
});


router.post('/modifica-episodio', function(req, res, next) {
    const id_episodio = req.body.id;
    //console.log(id_episodio);
    dao.getModificareEpisodi(id_episodio)
    .then((episodi) => {
        res.render('modifica-episodi', {title: 'Modifica episodi', episodi})
    })
    /*.catch(function(error){
        console.log('Questo è l\'errore' + error);
        throw(error);
    });*/

});


//Aggiornare le serie
router.post('/aggiornamento', function(req, res, next) {
    const info = req.body;
    dao.updatePersonalSerie(info)
    .then(
        res.render('modifica-riuscita', {title: 'Modificata Completata'})
    );
});

//Aggiornare gli episodi
router.post('/aggiornamento-episodi', [
    check('data').isDate()
], function(req, res, next) {
    const info = req.body;
    const err = validationResult(req);
    const id_episodio = req.body.id_episodio;
    //console.log('Queste sono le info dell\'aggiornamento');
    //console.log(info);
    //const data = moment.isDate(info.data);
    //console.log('Se è data o no');
    //console.log(data);
    //if(data === 'true'){
    if(err.isEmpty()){
    dao.updatePersonalEpisodio(info)
    .then(
        res.render('modifica-riuscita', {title: 'Modificata Completata'})
    );
    }
    else{
        dao.getModificareEpisodi(id_episodio)
        .then((episodi) => {
            res.render('modifica-episodi', {title: 'Modifica episodi', message: 'La data inserita non è corretta', episodi})
        })
    }
    //}
});

router.get('/aggiungi-serie', function(req, res, next){
    const params = req.session.passport.user;
    //console.log(params);
    res.render('aggiungi-serie', {title: 'Aggiungi Serie', params});
});

//Serve per aggiungere la nuova serie e per segnalare che la serie è stata aggiunta correttamente
router.post('/aggiungi-serie', function(req, res, next) {
    //console.log('Questo è il file');
    //console.log(req.files);
    if (!req.files.copertina || Object.keys(req.files.copertina).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let copertina = req.files.copertina;
    //console.log('Questa è la copertina');
    //console.log(req.files);
    
    // Use the mv() method to place the file somewhere on your server
      
    copertina.mv(`./public/copertine/${copertina.name}`, function(err) {
        if (err){
            return res.status(500).send(err);
        }
        const nomeFile = copertina.name;
        //console.log(nomeFile);
        //dao.upload(nomefile);
        const nuovaSerie = req.body;
        //console.log(nuovaSerie);
        dao.putPersonaSerie(nuovaSerie, nomeFile)
        .then(
            res.render('aggiornamento', {titolo: 'Serie aggiunta'})
        );
    });
});

//POST eseguita dal bottone che serve per aggiungere gli episodi (serve per mandare il valore della serie nella quale si sta aggiungendo l'episodio)
router.post('/aggiungi-episodio', function(req, res, next){
    const params = req.body.id_serie;
    res.render('aggiungi-episodio', {title: 'Aggiungi Episodio', params});
});

//Aggiungo l'episodio che mi viene dato dall'utente dentro al database
router.post('/episodio-aggiunto', function(req, res, next) {
    //const dati = req.body;
    //console.log('Questo è il file');
    //console.log(req.files);
    if (!req.files.audio || Object.keys(req.files.audio).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let audio = req.files.audio;
    //console.log('Questa è la copertina');
    //console.log(req.files);
    
    // Use the mv() method to place the file somewhere on your server
      
    audio.mv(`./public/audio/${audio.name}`, function(err) {
        if (err){
            return res.status(500).send(err);
        }
        const nomeFile = audio.name;
        //console.log(nomeFile);
        //dao.upload(nomefile);
        const nuovoEpisodio = req.body;
        //console.log('Questo è il nuovo episodio caricato');
        //console.log(nuovoEpisodio);
        dao.putPersonaEpisodio(nuovoEpisodio, nomeFile)
        .then(
            res.render('aggiornamento', {titolo: 'Inserimento riuscito'})
        );
    });
    /*dao.putPersonaEpisodio(dati)
    .then(
        res.render('aggiornamento', {title: 'Inserimento Riuscito'})
    );*/
});

//Delete episodio
router.post('/rimozione-episodio', function(req, res, next) {
    //La req contiene l'id dell'episodio relativo al bottone che è stato cliccato
    const id_episodio = req.body.id;
    dao.deletePersonalEpisodio(id_episodio)
    .then(
        res.render('rimozione', {title: 'Rimozione'})
    );
});

module.exports = router;