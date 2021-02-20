'use strict';

const db = require('../db.js');
const { param } = require('../routes/podcast.js');

exports.getAllPodcasts = function() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id_serie, titolo_serie, descrizione_serie, categoria, immagine_serie, autore, nome FROM serie, user WHERE autore = id';
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      /*
      let data = [];
      data[0] = { "ID": "1", "Status": "Valid" };
      data[1] = { "ID": "2", "Status": "Invalid" };
      let tempData = [];
      for ( let index=0; index<data.length; index++ ) {
        if ( data[index].Status == "Valid" ) {
          tempData.push( data );
        }
      }
      data = tempData;
      */
      /*
      console.log('Queste sono le righe');
      console.log(rows[0].id_serie);
      for(let i = 0; i<rows.length; i++){
        console.log('Questo è l\'id della serie');
        console.log(rows[i].id_serie);
      }*/
      /*else{
      console.log('Questa è la riga');
      console.log(rows);
      console.log(rows.id_serie);
      return new Promise((resolve, reject) => {
        const secondasql = 'SELECT * FROM seguiti WHERE serie_seguite = ?';
        db.all(sql, [rows.id_serie], (err, righe) => {
          if(err){
            reject(err);
            return;
          }
          console.log('Queste sono le righe');
          console.log(righe);

          console.log('Queste sono le righe di podcasts');
          console.log(rows);
          const podcasts = rows.map((e) => ({id: e.id_serie, titolo: e.titolo_serie, descrizione: e.descrizione_serie, categoria: e.categoria, copertina: e.immagine_serie, autore: e.autore}));
          resolve(podcasts);
        })
      })
      }*/
      /*
      array podcast
      [
        {podcast: 1},
        {podcast: 2},
        {podcast: 3}
      ]

      array serie seguite
      [
        {serie_seguite: 1},
        {serie_seguite: 2},
        {serie_seguite: 3}
      ]
      */
      //Ritorna l'array arraypodcast con una chiave in più
      //Devo ciclare nell'ejs per vedere se seguito = true o seguito = false
      const podcasts = rows.map((e) => ({id: e.id_serie, titolo: e.titolo_serie, descrizione: e.descrizione_serie, categoria: e.categoria, copertina: e.immagine_serie, autore: e.autore, nome: e.nome}));
      resolve(podcasts);
    });
  });
};

/*
//Controllare che la serie sia seguita o meno
exports.controllaSeguite = function(id_utente){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM serie JOIN serie_seguite WHERE utente = ?';
    db.all(sql, (err, seguite) => {
      if(err){
        reject(err);
        return;
      }
      resolve(seguite);
    })
  })
}
*/

//SEGUIRE E SMETTERE DI SEGUIRE
//Segui
exports.getSeguito = function(id_utente, id_serie){
  return new Promise((resolve, reject) => {
    const utente = id_utente;
    const serie_seguite = id_serie;
    const sql = 'INSERT INTO seguiti(utente, serie_seguite) VALUES(?, ?)';
    let params = [utente, serie_seguite];
    db.run(sql, params, (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      else{
        resolve();
      }
    });
  });
};

//Smetti di seguire
exports.removeSeguito = function(id_utente, id_serie){
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM seguiti WHERE utente = ? AND serie_seguite = ?';
    let params = [id_utente, id_serie];
    db.run(sql, params, (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      resolve();
    });
  });
};

//AGGIUNGERE E RIMUOVERE DAI PREFERITI
//Aggiungi preferito
exports.aggiungiPreferito = function(id_utente, id_episodio){
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO preferiti(utente, episodi_preferiti) VALUES(?, ?)';
    db.run(sql, [id_utente, id_episodio], (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      resolve();
    });
  });
};

//Rimuovi preferito
exports.removePreferito = function(id_utente, id_episodio){
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM preferiti WHERE utente = ? AND episodi_preferiti = ?';
    db.run(sql, [id_utente, id_episodio], (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      resolve();
    });
  });
};


//Codice per prendere la liste degli episodi
exports.getAllEpisodi = function(id_serie) {
  return new Promise((resolve, reject) => {
    //const sql = 'SELECT course_code, score, date, name, id, user_id FROM exam, course WHERE course_code=code AND user_id=?';
    const sql = 'SELECT * FROM episodio WHERE serie = ? ORDER BY data DESC';
    // execute the query and get all the results into 'rows'
    db.all(sql, [id_serie], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      else{
        // transform 'rows' (query results) into an array of objects
        const episodi = rows.map((e) => ({
          id: e.id_episodio,
          audio: e.audio,
          titolo: e.titolo_episodio,
          descrizione: e.descrizione_episodio,
          data: e.data,
          sponsor: e.sponsor,
          costo: e.costo,
          serie: e.serie
        }));
        resolve(episodi);
      }
    });
  });
};

/* //NON MANTENGO LE CARTE NEL DATABASE
exports.controlloCarta = function(id_utente, carta){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM carte WHERE id_utente = ?';
    db.all(sql, [id_utente], (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      resolve();
    })
  })
}
*/

//Inserire l'episodio negli episodi acquistati con il relativo id utente
exports.buyEpisode = function(id_serie, id_episodio, id_utente) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO episodi_acquistati(serie_episodio, episodio, utente) VALUES(?, ?, ?)';
    db.run(sql, [id_serie, id_episodio, id_utente], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

//DA METTERE A POSTO
exports.getEpisodiComprati = function(id_utente){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM episodi_acquistati WHERE utente = ?';
    db.all(sql, [id_utente], (err, comprati) => {
      if(err){
        reject(err);
        return;
      }
      resolve(comprati);
    })
  })
}

//Prendere le informazioni dell'episodio in base all'id episodio
exports.getInfoEpisodio = function(id_episodio){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM episodio WHERE id_episodio = ?';
    db.all(sql, [id_episodio], (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      const info = rows.map((e) => ({
        id: e.id_episodio,
        audio: e.audio,
        titolo: e.titolo_episodio,
        descrizione: e.descrizione_episodio,
        data: e.data,
        sponsor: e.sponsor,
        costo: e.costo,
        serie: e.serie
      }));
      resolve(info);
    })
  })
}

//DA FARE JOIN CON TABELLA USER PER NOMI UTENTI E ANCHE PER AUTORI EPISODI E SERIE
exports.getAutoreCommento = function(id_commento) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT autore_commento FROM commenti WHERE id_commento = ?';
    let params = id_commento;
    db.all(sql, [params], (err, autore) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(autore);
    });
  });
}

//Prendere i commenti ordinati in ordine decrescente per avere gli ultimi in cima
exports.getCommenti = function(id_episodio) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM commenti WHERE id_episodio = ? ORDER BY id_commento DESC';
    let params = id_episodio;
    db.all(sql, [params], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Queste sono le righe per i commenti');
      console.log(rows);
      const commenti = rows.map((e) => ({
        idc: e.id_commento,
        ide: e.id_episodio,
        autore: e.autore_commento,
        contenuto: e.contenuto_commento
      }));
      resolve(commenti);
    });
  });
}

//DA METTERE A POSTO PER POTER ELIMINARE SOLO I PROPRI COMMENTI
exports.removeCommenti = function(id_commento) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM commenti WHERE id_commento = ?';
    let params = id_commento;
    db.all(sql, [params], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      //console.log('Queste sono le righe per i commenti');
      //console.log(rows);
      resolve();
    });
  });
}

exports.pubblicaCommento = function(id_episodio, autore, commento){
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO commenti(id_episodio, autore_commento, contenuto_commento) VALUES(?, ?, ?)';
    let params = [id_episodio, autore, commento];
    db.run(sql, params, (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      else{
        resolve();
      }
    })
  })
}

exports.getCategorie = function(){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT DISTINCT categoria FROM serie';
    db.all(sql, (err, categorie) => {
      if(err){
        reject(err);
        return;
      }
      //const categorie
      //console.log('Queste sono le categorie');
      //console.log(categorie);
      resolve(categorie);
    })
  })
}

exports.cercaSerie = function(ricerca){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM serie WHERE titolo_serie LIKE ? OR descrizione_serie LIKE ?';
    let params = "%"+ricerca+"%";
    db.all(sql, [params, params], (err, serie) => {
      if(err){
        reject(err);
        return;
      }
      //console.log('Risultato ricerca');
      //console.log(serie);
      resolve(serie);
    })
  })
}

exports.cercaEpisodi = function(ricerca){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM episodio WHERE titolo_episodio LIKE ? OR descrizione_episodio LIKE ?';
    let params = "%"+ricerca+"%";
    db.all(sql, [params, params], (err, episodi) => {
      if(err){
        reject(err);
        return;
      }
      //console.log('Risultato ricerca');
      //console.log(episodi);
      resolve(episodi);
    })
  })
}

exports.cercaSerieCategoria = function(ricerca, categoria){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM serie WHERE titolo_serie LIKE ? OR descrizione_serie LIKE ? AND categoria LIKE ?';
    let params = "%"+ricerca+"%";
    db.all(sql, [params, params, categoria], (err, serie) => {
      if(err){
        reject(err);
        return;
      }
      //console.log('Risultato ricerca');
      //console.log(serie);
      resolve(serie);
    })
  })
}

//NON SI PUò FARE PERCHè GLI EPISODI NON HANNO CATEGORIE
/*
exports.cercaEpisodiCategoria = function(ricerca, categoria){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM episodio WHERE titolo_episodio LIKE ? OR descrizione_episodio LIKE ? AND categoria LIKE ?';
    let params = "%"+ricerca+"%";
    db.all(sql, [params, params, categoria], (err, episodi) => {
      if(err){
        reject(err);
        return;
      }
      console.log('Risultato ricerca');
      console.log(episodi);
      resolve(episodi);
    })
  })
}
*/

//CERCA SERIE NEL CASO IN CUI NON VENGA INSERITO NIENTE COME RICERCA
exports.cercaSerieNoRicerca = function(){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM serie';
    db.all(sql, (err, serie) => {
      if(err){
        reject(err);
        return;
      }
      //console.log('Risultato ricerca');
      //console.log(serie);
      resolve(serie);
    })
  })
}

//CERCA EPISODI NEL CASO IN CUI NON VENGA INSERITO NIENTE COME RICERCA
exports.cercaEpisodiNoRicerca = function(){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM episodio';
    db.all(sql, (err, episodi) => {
      if(err){
        reject(err);
        return;
      }
      //console.log('Risultato ricerca');
      //console.log(episodi);
      resolve(episodi);
    })
  })
}

//CERCA SERIE NEL CASO IN CUI NON VENGA INSERITO NIENTE COME RICERCA MA VENGA INSERITA LA CATEGORIA
exports.cercaSoloSerieNoRicerca = function(categoria){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM serie WHERE categoria LIKE ?';
    let params = "%"+categoria+"%";
    db.all(sql, params, (err, serie) => {
      if(err){
        reject(err);
        return;
      }
      //console.log('Risultato ricerca');
      //console.log(serie);
      resolve(serie);
    })
  })
}

//PRENDE LE SERIE SEGUITE PER NASCONDERE I BOTTONI SEGUI SE LA SERIE è SEGUITA E SEGUITO SE LA SERIE NON è SEGUITA
exports.getPersonalSeguiti = function(id_utente){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM seguiti WHERE utente = ?';
    db.all(sql, id_utente, (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      const personalSeguiti = rows.map((e) => ({serie_seguite: e.serie_seguite}));
      //console.log('Questi sono i seguiti');
      //console.log(personalSeguiti);
      resolve(personalSeguiti);
    })
  })
}

//PRENDE GLI EPISODI PREFERITI PER CAMBIARE I PULSANTI "AGGIUNGI PREFERITO" E "RIMUOVI PREFERITO"
exports.getPersonalEpisodiPreferiti = function(id_utente){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM preferiti WHERE utente = ?';
    db.all(sql, id_utente, (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      const personalPreferiti = rows.map((e) => ({episodi_preferiti: e.episodi_preferiti}));
      //console.log('Questi sono i preferiti');
      //console.log(preferiti);
      resolve(personalPreferiti);
    })
  })
}

//PRENDE DAL DATABASE LE INFORMAZIONI DELLE SERIE SEGUITE (TITOLO, DESCRIZIONE, COPERTINA, ECC.) IN BASE ALL'UTENTE
exports.getPersonalSeguitiTotali = function(id_utente){
  //console.log('Questi sono i seguiti in total seguiti');
  //console.log(seguiti[0]);
  return new Promise((resolve, reject) => {
    /*seguiti.forEach(element => {
      
    });*/
    //let seguititotal = [];
    //let id_utente = seguiti[0].utente;
    //id_utente.push(seguiti[0].utente);
    //console.log('Questo è il valore di utente');
    //console.log(id_utente);
    /*let valoriSerie = seguiti.map(obj => {

    })*/
    /*
    for(let i=0; i<seguiti.length; i++){
      seguititotal.push(seguiti[i].serie_seguite);
    }
    console.log('Questi sono i seguiti totali ciclati nel for');
    console.log(seguititotal);*/
    //let utente = this.seguiti.utente;
    //let serie_seguite = this.seguiti.serie_seguite;
    //console.log('Questi sono i valori di utente e serie seguite');
    //console.log(utente);
    //console.log(serie_seguite);
    const sql = 'SELECT DISTINCT * FROM seguiti INNER JOIN serie WHERE id_serie = serie_seguite AND utente = ?';
    db.all(sql, id_utente, (err, seguititotali) => {
      if(err){
        reject(err);
        return;
      }
      //console.log('Questi sono i seguiti totali');
      //console.log(seguititotali);
      resolve(seguititotali);
    })
  })
}

exports.getPersonalEpisodiTotali = function(id_utente){
  //console.log('Questi sono i seguiti in total seguiti');
  //console.log(seguiti[0]);
  return new Promise((resolve, reject) => {
    /*seguiti.forEach(element => {
      
    });*/
    //let seguititotal = [];
    //let id_utente = seguiti[0].utente;
    //id_utente.push(seguiti[0].utente);
    //console.log('Questo è il valore di utente');
    //console.log(id_utente);
    /*let valoriSerie = seguiti.map(obj => {

    })*/
    /*
    for(let i=0; i<seguiti.length; i++){
      seguititotal.push(seguiti[i].serie_seguite);
    }
    console.log('Questi sono i seguiti totali ciclati nel for');
    console.log(seguititotal);*/
    //let utente = this.seguiti.utente;
    //let serie_seguite = this.seguiti.serie_seguite;
    //console.log('Questi sono i valori di utente e serie seguite');
    //console.log(utente);
    //console.log(serie_seguite);
    const sql = 'SELECT DISTINCT * FROM preferiti INNER JOIN episodio WHERE id_episodio = episodi_preferiti AND utente = ?'; //ORDER BY data no perchè deve vedersi l'ultimo aggiunto
    db.all(sql, id_utente, (err, preferititotali) => {
      if(err){
        reject(err);
        return;
      }
      //console.log('Questi sono i preferiti totali');
      //console.log(preferititotali);
      resolve(preferititotali);
    })
  })
}
/*
//DA FINIRE
//Prendo l'autore in base alla serie
exports.getIDAutore = function(){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT autore FROM serie';
    db.all(sql, (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      console.log('Questi sono i creatori');
      console.log(rows);
      //const nomeAutore = rows.map((e) => ({autore: e.nome, titolo: e.titolo_serie, descrizione: e.descrizione_serie, categoria: e.categoria, copertina: e.immagine_serie, autore: e.autore}));
      resolve();
    })
  })
}
*/

//Controlla se è admin o no
exports.getAdminValue = function(id_utente){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT admin FROM user WHERE id = ?';
    db.get(sql, id_utente, (err, admin) => {
      if(err){
        reject(err);
        return;
      }
      //console.log('Questo è il valore di admin');
      //console.log(admin);
      resolve(admin);
    })
  })
}
/*
exports.getEpisodiIdEpisodioIdSerie = function(id_utente){
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id_episodio, serie FROM episodio';
    db.all(sql, (err, rows) => {
      if(err){
        reject(err);
        return;
      }
      const valori = rows.map((e) => ({id_episodio: e.id_episodio, serie: e.serie}));
      resolve(valori);
    })
  })
}
*/