const mysql = require("mysql2");
const dotenv = require("dotenv");

// Cargar las variables del archivo .env
dotenv.config({ path: './config/.env' });

// Variables desde .env
const host = process.env.HOST;
const user = process.env.USER;
const pass = process.env.PASS;
const db   = process.env.DB;

// Crear conexión
const connection = mysql.createConnection({
  host: host,
  user: user,
  password: pass,
  database: db
});

// Probar conexión
connection.connect(function(err){
    if(err){
        throw err;
    }else{
        console.log("conexion exitosa");
    }
});

module.exports = connection;
