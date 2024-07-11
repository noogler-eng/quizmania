import { Server, Socket } from "socket.io"
import { IoManager } from "./ioManager"

export class QuizManager{

    private quizes: {
        roomId: string,
        problems: {
            question: string,
            answer: string[]
        }[],
        users: {
            username: string,
            type: "admin" | "solver"
            points: number,
            socket: Socket
            roomId: string
        }
    }[]

    constructor(){
        this.quizes = [];
    }

    addQuiz(){
        const io: Server = IoManager.getIo();
        const roomId = "";
        this.start(io, roomId);
    }

    public start(io: Server, roomId: string){
        io.to(roomId).emit("message", {
            type: "quiz start",
        });
        this.nextQues(io, roomId);
    }

    public nextQues(io: Server, roomId: string){
        const quiz = this.quizes.find(x => roomId === x.roomId);

        io.to(roomId).emit("message", {
            type: "quiz start",
            question: quiz?.problems[0].question,
            options: quiz?.problems[0].answer
        });
    }


}