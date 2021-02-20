'use strict';

const db = require('../db.js');

exports.getPersonalSeries = function(id){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM serie WHERE autore=?';
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const series = rows.map((e) => ({id: e.id_serie, titolo: e.titolo_serie, descrizione: e.descrizione_serie, categoria: e.categoria, copertina: e.immagine_serie}));
      resolve(series);
    });
  });
};


//Eliminazione podcast da usare quando viene cliccato il tasto elimina
exports.deletePersonalSeries = function(id_serie){
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM serie WHERE id_serie=?';
    db.run(sql, [id_serie], (err, rows) => {
        if(err){
          reject(err);
          return;
        }
        else{
          resolve();
        }
    });
  });
}

//Seleziono la serie da modificare tramite l'id
exports.getPersonalSerieFromId = function(id_serie){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM serie WHERE id_serie=?';
    db.all(sql, [id_serie], (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      else{
        const serie = rows.map((e) => ({id: e.id_serie, titolo: e.titolo_serie, descrizione: e.descrizione_serie, categoria: e.categoria, copertina: e.immagine_serie}));
        resolve(serie);
      }
    });
  });
}

//PRENDO GLI EPISODI DAL DB IN BASE ALL'ID

//Seleziono l'episodio tramite l'id
exports.getEpisodiFromIdSerie = function(id_serie){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM episodio WHERE serie=?';
    db.all(sql, [id_serie], (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      else{
        const episodi = rows.map((a) => ({id: a.id_episodio, audio: a.audio, titolo: a.titolo_episodio, descrizione: a.descrizione_episodio, data: a.data, sponsor: a.sponsor, costo: a.costo, serie: a.serie}));
        resolve(episodi);
      }
    });
  });
}

exports.getModificareEpisodi = function(id_episodio){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM episodio WHERE id_episodio=?';
    db.all(sql, [id_episodio], (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      else{
        const episodi = rows.map((a) => ({id: a.id_episodio, audio: a.audio, titolo: a.titolo_episodio, descrizione: a.descrizione_episodio, data: a.data, sponsor: a.sponsor, costo: a.costo, serie: a.serie}));
        resolve(episodi);
      }
    });
  });
}

//AGGIORNO SERIE ED EPISODI
//Aggiorno la serie in base ai dati che mi arrivano dall'utente
exports.updatePersonalSerie = function(info){
  return new Promise((resolve, reject) => {
      const id_serie = info.id_serie;
      const titolo = info.titolo_serie;
      const descrizione = info.descrizione_serie;
      const categoria = info.categoria;
      const copertina = info.immagine_serie;
      const sql = 'UPDATE serie SET titolo_serie = ?, descrizione_serie = ?, categoria = ?, immagine_serie = ? WHERE id_serie = ?';
      let params = [titolo, descrizione, categoria, copertina, id_serie];
      db.run(sql, params, (err, rows) => {
        if(err){
          reject(err);
          return;
        }
        resolve();
      });
  });
}


//Aggiorno gli episodi in base ai dati che mi arrivano dall'utente
exports.updatePersonalEpisodio = function(info){
  return new Promise((resolve, reject) => {
      console.log('Queste sono le informazioni che vedo nell\'update episodio');
      console.log(info);
      const id_episodio = info.id_episodio;
      const titolo = info.titolo_episodio;
      const descrizione = info.descrizione_episodio;
      const data = info.data;
      const sponsor = info.sponsor;
      const costo = info.costo;
      const serie = info.serie;
      const sql = 'UPDATE episodio SET titolo_episodio = ?, descrizione_episodio = ?, data = ?, sponsor = ?, costo = ? WHERE id_episodio = ?';
      let params = [titolo, descrizione, data, sponsor, costo, id_episodio];
      db.run(sql, params, (err, rows) => {
        if(err){
          reject(err);
          return;
        }
        resolve();
      });
  });
}
/*
//Aggiungo nel database la nuova serie creata dall'utente
exports.putPersonaSerie = function(nuovaSerie){
  return new Promise((resolve, reject) => {
    console.log('Questa è la nuova serie inserita dall\'utente');
    console.log(nuovaSerie);
    const titolo = nuovaSerie.titolo;
    const descrizione = nuovaSerie.descrizione;
    const categoria = nuovaSerie.categoria;
    const copertina = nuovaSerie.copertina;
    const autore = nuovaSerie.autore;
    const sql = 'INSERT INTO serie(titolo_serie, descrizione_serie, categoria, immagine_serie, autore) VALUES(?, ?, ?, ?, ?)';
    let params = [titolo, descrizione, categoria, copertina, autore];
    db.run(sql, params, (err, rows) => {
      if (err){
        reject(err);
        return;
      }
      else{
        resolve();
      }
    });
  });
};
*/

//Aggiungo nel database la nuova serie creata dall'utente
exports.putPersonaSerie = function(nuovaSerie, nomeFile){
  return new Promise((resolve, reject) => {
    console.log('Questa è la nuova serie inserita dall\'utente');
    console.log(nuovaSerie);
    console.log('Questo è il nome del file');
    console.log(nomeFile);
    const titolo = nuovaSerie.titolo;
    const descrizione = nuovaSerie.descrizione;
    const categoria = nuovaSerie.categoria;
    const copertina = `/copertine/${nomeFile}`;//nuovaSerie.copertina;
    const autore = nuovaSerie.autore;
    const sql = 'INSERT INTO serie(titolo_serie, descrizione_serie, categoria, immagine_serie, autore) VALUES(?, ?, ?, ?, ?)';
    let params = [titolo, descrizione, categoria, copertina, autore];
    db.run(sql, params, (err, rows) => {
      if (err){
        reject(err);
        return;
      }
      else{
        resolve();
      }
    });
  });
};

//Aggiungo l'episodio caricato dall'utente riportando il relativo id utente e le informazioni
exports.putPersonaEpisodio = function(nuovoEpisodio, nomeFile){
  return new Promise((resolve, reject) => {
    console.log('Questo è il nuovo episodio inserito dall\'utente');
    console.log(nuovoEpisodio);
    const audio = `/audio/${nomeFile}`;
    const titolo = nuovoEpisodio.titolo;
    const descrizione = nuovoEpisodio.descrizione;
    const data = nuovoEpisodio.data;
    const sponsor = nuovoEpisodio.sponsor;
    const costo = nuovoEpisodio.costo;
    const serie = nuovoEpisodio.serie;
    const sql = 'INSERT INTO episodio(audio, titolo_episodio, descrizione_episodio, data, sponsor, costo, serie) VALUES(?, ?, ?, ?, ?, ?, ?)';
    let params = [audio, titolo, descrizione, data, sponsor, costo, serie];
    db.run(sql, params, (err, rows) => {
      if (err){
        reject(err);
        return;
      }
      else{
        resolve();
      }
    });
  });
};

//Elimino l'episodio associato al tasto che è stato cliccato
exports.deletePersonalEpisodio = function(id_episodio){
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM episodio WHERE id_episodio=?';
    db.run(sql, [id_episodio], (err, rows) => {
        if(err){
          reject(err);
          return;
        }
        else{
          resolve();
        }
    });
  });
}