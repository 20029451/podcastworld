'use strict';

const { router } = require('../app');
const db = require('../db');
const bcrypt = require('bcrypt');
const { param } = require('../routes/podcast');

exports.putPersonalinfo = function(credenziali){
    return new Promise((resolve, reject) => {
      
      //Inserisco i valori dati dall'utente nelle variabili
      const nome = credenziali.name;
      const email = credenziali.username;
      const passwordInChiaro = credenziali.password;
      
      //Faccio l'hash della password che è stata inserita dall'utente
      const saltRounds = 13;
      const salt = bcrypt.genSaltSync(saltRounds);
      const password = bcrypt.hashSync(passwordInChiaro, salt);
      
      //Controllo la checkbox per sapere se si è registrato come admin o come ascoltatore
      const controllo = credenziali.controllo;
      let admin;
      if(controllo === undefined){
        admin = 0;
      }
      else if(controllo === 'on'){
        admin = 1;
      }

      //Inserisco le credenziali dell'utente nel database insieme all'hash della password
      const sql = 'INSERT INTO user(nome, email, password, admin) VALUES(?, ?, ?, ?)';
      let params = [nome, email, password, admin];
      db.run(sql, params, (err, rows) => {
        if (err === null){
          resolve();
        }
        else{
          const message = 'Il nome o la mail sono già state prese';
          resolve(message);
        }
      });
    });
};
