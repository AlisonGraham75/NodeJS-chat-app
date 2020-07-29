const express = require('express')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000

//define paths for Express config
const publicDirectory = path.join(__dirname, '../public')

//Set up static directory to serve
app.use(express.static(publicDirectory))

//app.get('')

//Starts up the server on a specific port.
//3000 is a development port
//Callback runs when the is server up
app.listen(port, () => {
    console.log('Server is up on port ' + port + '.')
})