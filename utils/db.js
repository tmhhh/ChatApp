const mysql = require("mysql");
require("dotenv").config({ path: "./.env" });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});
module.exports = {
  findByID: (table, id) => {
    return new Promise((resolve, reject) => {
      const query = `Select * from ${table} where ${table}ID=? `;
      connection.query(query, [id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },
  getAll: (table) => {
    return new Promise((resolve, reject) => {
      const query = connection.query(
        `Select * from ${table}`,
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });
  },
  insert: (table, entity) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO ${table} SET ?`;
      connection.query(query, entity, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  },
  optionalInsert: (query) => {
    return new Promise((resolve, reject) => {
      connection.query(query, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  },
  getByCondition: (query, condition) => {
    return new Promise((resolve, reject) => {
      connection.query(query, condition, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  },
};
// module.exports = connection;
