import { Server, Socket } from "socket.io";
import { IoManager } from "./managers/ioManager";



export class Quiz{

    private roomId: string;
    private admin: string;
    private adminPassword: string;
    private hasStarted = false;
    private socketAdmin;
    private io: Server;
    public problems: {
        question: string,
        options: {
            id: string,
            title: string,
        }[],
        image?: string,
        type?: 'single' | 'multiple',
        answer: string,
    }[]
    public users: {
        username: string,
        solverSocket: Socket,
    }[] 
    public activeProblem;

    constructor(roomId: string, admin: string, adminPassword: string, socketAdmin: Socket){
        this.roomId = roomId;
        this.io = IoManager.getIo();
        this.admin = admin;
        this.adminPassword = adminPassword;
        this.problems = [];
        this.socketAdmin = socketAdmin;
        this.users = [];
        this.activeProblem = 0;
    }

    start(){
        this.hasStarted = true;
        this.io.to(this.roomId).emit("message", {
            msg: "quiz has been started"
        })
        this.nextProblem();
    }

    // only admin can add question
    addProblems(question: string, options: any, answer: string, image: string = '', type: 'single', adminPassword: string){
        if(this.hasStarted != true) return;
        
        if(adminPassword != this.adminPassword){
            this.socketAdmin.emit("message", {
                msg: "someone has tried to add problem in place of you"
            })
            return;
        }

        this.problems.push({
            question: question,
            options: options,
            answer: answer,
            image: image,
            type: type
        })

        this.socketAdmin.emit("message", {
            msg: "problem has been added into problems section"
        })

    }

    nextProblem(){
        if(this.activeProblem >= this.problems.length) {
            this.io.to(this.roomId).emit("message", {
                msg: "all problems are completed"
            })
            return;
        }
        
        this.io.to(this.roomId).emit("message", {
            msg: this.problems[this.activeProblem]
        })
        this.activeProblem++;
    }

    addUser(username: string, solverSocket: Socket){
        if(this.hasStarted) return;
        this.users.push({username, solverSocket});
    }

    showLeaderboard(){
        this.io.to(this.roomId).emit("message", {
            msg: this.users
        })
    }
}