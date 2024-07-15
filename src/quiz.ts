import { Server, Socket } from "socket.io";
import { IoManager } from "./managers/ioManager";

export interface problemInterface{
    questionId: string,
    question: string,
    options: {
        id: string,
        title: string,
    }[],
    image?: string,
    type?: 'single' | 'multiple',
    answer: string,
}

export interface userInterface{
    username: string,
    roomId: string,
    solverSocket: Socket
}

export interface adminInterface{
    username: string,
    roomId: string,
    adminPassword: string,
    adminSocket: Socket
}


export class Quiz{

    private roomId: string;
    private admin: adminInterface;
    private hasStarted = false;
    private io: Server;
    public problems: problemInterface[];
    public users: userInterface[];  
    public activeProblem;

    constructor(adminUsername: string, roomId: string, adminPassword: string, adminSocket: Socket){
        this.roomId = roomId;
        this.io = IoManager.getIo();
        
        this.admin = {
            username: adminUsername,
            roomId: roomId,
            adminPassword: adminPassword,
            adminSocket: adminSocket,
        };
        
        this.problems = [];
        this.users = [];
        this.activeProblem = 0;
    }

    start(){
        this.hasStarted = true;
        this.io.emit("message", {
            msg: "quiz has been started"
        })
        this.nextProblem();
    }

    // only admin can add question
    addProblems(question: string, options: any, answer: string, image: string, adminPassword: string){

        if(adminPassword != this.admin.adminPassword){
            this.admin.adminSocket.emit("message", {
                msg: "someone has tried to add problem in place of you"
            })
            return;
        }

        const prevQuesId = this.problems.length;

        try{
            this.problems.push({
                questionId: (prevQuesId).toString(),
                question: question,
                options: options,
                answer: answer,
                image: image,
                type: 'single'
            })
    
            this.admin.adminSocket.emit("message", {
                msg: "problem has been added into problems section"
            })
    
            return prevQuesId;
        }catch(error){
            console.log(error);
        }
    }

    nextProblem(){
        if(this.activeProblem >= this.problems.length) {
            this.io.emit("message", {
                msg: "all problems are completed"
            })
            return;
        }
        
        this.io.emit("message", {
            msg: this.problems[this.activeProblem]
        })
        this.activeProblem++;
        return this.activeProblem - 1;
    }

    addUser(username: string, roomId: string, solverSocket: Socket){
        if(this.hasStarted) return;
        const newUser = {
            username: username,
            roomId: roomId,
            solverSocket: solverSocket
        }
        this.users.push(newUser);
    }

    showLeaderboard(){
        this.io.emit("message", {
            msg: this.users
        })
    }

    submit(socket: Socket, questionId: string, answer: string){
        
        const question = this.problems.find(question => questionId == question.questionId);
        const optionAnswer = question?.options[Number(answer)].title;
        if( optionAnswer === question?.answer ){
            socket.emit("message", {
                msg: "right answer"
            })
        }else{
            socket.emit("message", {
                msg: "wrong answer"
            })
        }
    }
}