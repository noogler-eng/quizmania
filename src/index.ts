// import { Server } from "socket.io";
// import { createServer } from "http";
import { Socket } from "socket.io";
import { IoManager } from "./managers/ioManager";

const io = IoManager.getIo();
  
io.on('connection', (socket: Socket) => {
    console.log('a user connected');
    socket.on('event', (data)=>{
        console.log(typeof(data));
        console.log(data);
    })
    socket.on('disconnect', ()=>{
        console.log('user disconnected')
    })
});

io.listen(3000);
  
    
