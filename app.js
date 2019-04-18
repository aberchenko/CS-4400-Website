const express = require('express')
const mysql = require('mysql')
const dotenv = require('dotenv')
const app = express()
const port = 3000

dotenv.config()

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'AtlantaBeltline',
})

connection.connect()

connection.query('SELECT 1 + 1 AS solution', function(error, results, fields) {
  if (error) throw error
  console.log('The solution is: ', results[0].solution)
})

app.get('/', (req, res, err) => {
  res.send('yo!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
