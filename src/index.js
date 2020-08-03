const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')


const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000

//define paths for Express config
const publicDirectory = path.join(__dirname, '../public')

//Set up static directory to serve
app.use(express.static(publicDirectory))

io.on('connection', (socket) => {
    console.log('New Websocket connection')

    socket.emit('message', 'Welcome!')

    socket.on('sendMessage', (message) => {
        io.emit('message', message)
    })
})

//Starts up the server on a specific port.
//3000 is a development port
//Callback runs when the is server up
server.listen(port, () => {
    console.log('Server is up on port ' + port + '.')
})

