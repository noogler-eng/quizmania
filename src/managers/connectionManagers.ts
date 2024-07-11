import { Socket } from "socket.io"
import { QuizManager } from "./quizManager";
import { adminInterface } from "../quiz";


export class ConnectionManager{

    private qm: any;
    constructor(){
        this.qm = new QuizManager();
    };

    userHandler(username: string, roomId: string, socket: Socket){
        
        socket.on("JOIN_ADMIN", (data: adminInterface)=>{
            const roomId = this.qm.createQuiz(data);
            data.adminSocket.send("message", {
                msg: `roomId: ${roomId}`
            })
        })

        socket.on("START", (data)=>{
            this.qm.createQuiz(data);
        })

        socket.on("ADD_PROBLEM", (data)=>{
            this.qm.addProblem();
        })

        socket.on("NEXT_QUESTION", (data)=>{
            this.qm.nextQuestion();
        })

        socket.on("SHOW_LEADERBOARD", (data)=>{
            this.qm.nextQuestion();
        })
        

        socket.on("JOIN_SOLVER", (data)=>{
            this.qm.joinUser(data);
        })

        socket.on("SUBMISSION", (data)=>{
            this.qm.submit(data);
        })
    }
}