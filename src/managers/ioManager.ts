import { Server } from "socket.io";
import { createServer } from "http";

const server = createServer();

export class IoManager{
    
    private static io: any;

    constructor(){}

    public static getIo(){
        if(!this.io){
            this.io = new Server(server);
            return this.io;
        }
        return this.io;
    }

}