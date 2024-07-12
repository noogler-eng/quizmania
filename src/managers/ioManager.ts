import { Server } from "socket.io";
import { createServer } from "http";

const server = createServer();

export class IoManager {
    private static io: Server;

    static getIo(): Server {
        if (!this.io) {
            this.io = new Server(server, {
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"]
                }
            });
        }
        return this.io;
    }
}
