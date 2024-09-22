const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let users = []
let user_ids = []

io.on("connection", (socket) => {
    
    socket.on('user-connected',(username)=>{
        users.push(username);
        user_ids.push(socket.id);
        io.emit('connected-users',users);
        
    })

    socket.on("message", ({message,username})=> {
        
    io.emit("message", {message,username,id:socket.id}); 
    });
    
    socket.on('typing',()=>{
        let username = users[user_ids.indexOf(socket.id)]
        socket.broadcast.emit('typing', username);
    })

    socket.on("disconnect", () => {
        let index = user_ids.indexOf(socket.id);
        if(index !== -1){
            users.splice(index,1);
            user_ids.splice(index,1);
            io.emit('connected-users',users);
        }
    });

});
app.get("/", (req, res) => {
    res.render("chat");
});


server.listen(3000);
