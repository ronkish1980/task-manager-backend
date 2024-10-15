const mysql = require('mysql2');

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'portfolio_One2!@#', // Ensure this matches your MySQL password
  database: 'task_manager'
});

module.exports = pool.promise();

