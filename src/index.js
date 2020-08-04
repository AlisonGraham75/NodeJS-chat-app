const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')


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

    //emits to the current client
    socket.emit('message', 'Welcome!')

    //send to every client except the current
    socket.broadcast.emit('message', "A new user has joined")

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        //emits to all connected clients
        io.emit('message', message)
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('message', 'https://google.com/maps?q=' + coords.latitude + ',' +  coords.longitude)
        callback()
    })

    //send message to all remaining clients on disconnect
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left.')
    })
})

//Starts up the server on a specific port.
//3000 is a development port
//Callback runs when the is server up
server.listen(port, () => {
    console.log('Server is up on port ' + port + '.')
})

