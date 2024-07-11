import { Socket } from "socket.io"


export class ConnectionManager{

    private users: {
        roomId: string,
        socket: Socket
    }[]

    constructor(){
        this.users = [];

    };

    addUser(roomId: string, socket: Socket){
        this.users.push({roomId, socket});
        this.userHandler(roomId, socket);
    }

    userHandler(roomId: string, socket: Socket){
        
        socket.on("", ()=>{

        })
        
        socket.on("submission", (data)=>{
            
        })


    }


}