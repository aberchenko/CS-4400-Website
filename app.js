const express = require('express')
const handlebars = require('express-handlebars')
const mysql = require('mysql')
const dotenv = require('dotenv')
const util = require('util')
const store = require('store')

const app = express()
const port = 3000

app.engine('handlebars', handlebars({ defaultLayout: 'layout' }))
app.set('view engine', 'handlebars')

dotenv.config()
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'Phase3AtlantaBeltline',
})

db.connect()

// To allow us to use "await" to grab the result
const query = util.promisify(db.query).bind(db)

db.query('SELECT 1 + 1 AS solution', function(error, results, fields) {
  if (error || !results || !results.length) throw error
  console.log('The solution is: ', results[0].solution)
})

app.get('/login', async (req, res, err) => {
  const matchingUsers = await query(
    `SELECT Firstname, Lastname, Username FROM User NATURAL JOIN UserEmail
    WHERE email=\"${req.query.email}\"
    AND password=\"${req.query.password}\"
    LIMIT 1`
  )

  if (!matchingUsers || !matchingUsers.length) {
    res.render('user_login', { invalidLogin: true })
  } else {
    store.set('user', matchingUsers[0])
    res.redirect('/')
  }
})

app.get('/', async (req, res, err) => {
  const user = store.get('user')
  if (!user || !user.Username) {
    res.redirect('/login')
    return
  }

  const employeeRoles = await query(
    `SELECT isAdmin, isMngr, isStaff FROM employee
    WHERE username=\"${user.Username}\"
    LIMIT 1`
  )

  if (!employeeRoles || !employeeRoles.length) {
    const visitorRecord = await query(`SELECT * FROM Visitor
      WHERE username=\"${user.Username}\"`)
    if (visitorRecord && visitorRecord.length) {
      var role = 'Visitor'
    } else {
      var role = 'User'
    }
  } else {
    if (employeeRoles[0].isAdmin) {
      var role = 'Admin'
    } else if (employeeRoles[0].isMngr) {
      var role = 'Manager'
    } else {
      var role = 'Staff'
    }
  }
  store.set('user', { ...user, Role: role })
  res.render('dashboard', { ...user, Role: role })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
