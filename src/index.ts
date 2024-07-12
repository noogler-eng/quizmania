import { Socket } from "socket.io";
import { IoManager } from "./managers/ioManager";
import { ConnectionManager } from "./managers/connectionManagers";

const io = IoManager.getIo();
const cm = new ConnectionManager();
  
io.on('connection', (socket: Socket) => {
    console.log("new user is connected");
    cm.userHandler(socket);
});

io.listen(3000);
  
    
