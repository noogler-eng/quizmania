import { Server, Socket } from "socket.io";
import { IoManager } from "./managers/ioManager";

export interface problemInterface{
    questionId: number,
    question: string,
    options: {
        id: number,
        title: string,
    }[],
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
    private timeLimit: number;
    private admin: adminInterface;
    private hasStarted = false;
    private io: Server;
    public problems: problemInterface[];
    public users: userInterface[];  
    public activeProblem;
    private isQuizEnd;

    constructor(adminUsername: string, roomId: string, adminPassword: string, timeLimit: number, adminSocket: Socket){
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
        this.isQuizEnd = false;
        this.timeLimit = timeLimit;
    }

    // only admin can start quiz
    start(adminPassword: string){
        if(this.isQuizEnd == true || this.admin.adminPassword != adminPassword) {
            this.admin.adminSocket.emit("quiz_started", {
                msg: "quiz has already been ended"
            })
            return;
        }

        if(this.hasStarted == true || this.admin.adminPassword != adminPassword) {
            this.admin.adminSocket.emit("quiz_started", {
                msg: "quiz has been currently running"
            })
            return;
        }

        this.hasStarted = true;
        this.io.emit("quiz_started", {
            msg: "quiz has been started"
        })
        const interval = setInterval(()=>{
            this.nextProblem();
            if(this.isQuizEnd == true) clearInterval(interval);
        }, this.timeLimit * 1000);
    }

    // only admin can add question
    addProblems(question: string, options: any, answer: string, adminPassword: string){

        if(adminPassword != this.admin.adminPassword){
            this.admin.adminSocket.emit("admin_question_added", {
                msg: "someone has tried to add problem in place of you"
            })
            return;
        }

        const prevQuesId = this.problems.length;

        try{
            this.problems.push({
                questionId: prevQuesId,
                question: question,
                options: options,
                answer: answer,
            })
    
            this.admin.adminSocket.emit("admin_question_added", {
                msg: "problem has been added into problems section"
            })
    
            return prevQuesId;
        }catch(error){
            console.log(error);
        }
    }

    // problem are going next in timeLimit again and again
    // if quizEnded then interval will be clear
    nextProblem(){
        if(this.activeProblem >= this.problems.length) {
            this.io.emit("quiz_end", {
                msg: "all problems are completed"
            })
            this.isQuizEnd = true;
            return;
        }
        
        this.io.emit("question", {
            msg: this.problems[this.activeProblem]
        })
        this.activeProblem++;
        return this.activeProblem - 1;
    }

    // any user can add
    // 
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
        this.io.emit("leaderboard", {
            msg: this.users
        })
    }

    submit(socket: Socket, questionId: number, answer: number){
        
        const question = this.problems.find(question => questionId == question.questionId);
        const optionAnswer = question?.options[answer].title;
        if( optionAnswer === question?.answer ){
            socket.emit("answer", {
                msg: "right answer"
            })
        }else{
            socket.emit("answer", {
                msg: "wrong answer"
            })
        }
    }
}