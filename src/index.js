const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getusersInRoom, getUsersInRoom } = require('./utils/users')



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

    socket.on('join', ({username, room}, callback) => {
       
        const {error, user} = addUser({ id: socket.id, username, room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        //emits to the current client
        socket.emit('message', generateMessage('Admin','Welcome!'))

        //send to every client in room except the current
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`))
        //Send new list of users to the client
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
                
        const filter = new Filter()
        if (filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
     

        //emits to all connected clients in the same room
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    //send message to all remaining clients on disconnect
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if( user ){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left.`))
            //send list of remaining users to the client
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

//Starts up the server on a specific port.
//3000 is a development port
//Callback runs when the is server up
server.listen(port, () => {
    console.log('Server is up on port ' + port + '.')
})

