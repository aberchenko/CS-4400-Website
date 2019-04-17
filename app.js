const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res, err) => {
  res.send('yo!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
