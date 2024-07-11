import { Socket } from "socket.io"
import { Quiz } from "../quiz"

interface createQuizInterface{
    adminUsername: string,
    adminPassword: string,
    adminSocket: Socket
}

interface dataQuizInterface{
    roomId: string,
    question: string, 
    options: {
        id: string,
        title: string,
    }[], 
    answer: string, 
    image?: string, 
    adminPassword: string
}

interface nextQuizInterface{
    roomId: string
}

interface userInterface{
    username: string,
    roomId: string,
    solverSocket: Socket
}

interface userSubmissionInterface{
    username: string,
    roomId: string,
    questionId: string,
    answer: string
}


export class QuizManager{

    private quizes: Quiz[]

    private roomId: string;
    private roomIdToQuiz = new Map<string, Quiz>();
    constructor(){
        this.quizes = [];
        this.roomId = "";
    }

    // ---- // ADMIN WORKFLOW // ---- //
    generateRandomString(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charactersLength);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

    createQuiz(data: createQuizInterface){
        this.roomId = this.generateRandomString(4);
        const quiz = new Quiz(data.adminUsername, this.roomId, data.adminPassword, data.adminSocket);
        this.roomIdToQuiz.set(this.roomId, quiz);
        this.quizes.push(quiz);
        return this.roomId;
    }

    addProblem(data: dataQuizInterface){
        const quiz = this.roomIdToQuiz.get(data.roomId);
        quiz?.addProblems(data.question, data.options, data.answer, data.image, data.adminPassword);
    }

    nextQuestion(data: nextQuizInterface){
        const quiz = this.roomIdToQuiz.get(data.roomId);
        quiz?.nextProblem();
    }

    start(data: nextQuizInterface){
        const quiz = this.roomIdToQuiz.get(data.roomId);
        quiz?.start();
    }

    // ---- // SOLVER WORKFLOW // ---- //
    joinUser(data: userInterface){
        const quiz = this.roomIdToQuiz.get(data.roomId);
        quiz?.addUser(data.username, data.roomId, data.solverSocket);
    }

    submit(data: userSubmissionInterface){
        const quiz = this.roomIdToQuiz.get(data.roomId);
        quiz?.submit(data.username, data.questionId, data.answer);
    }

    // ---- // GENERAL WORKFLOW // ---- //
    showLeaderboard(data: userInterface){
        const quiz = this.roomIdToQuiz.get(data.roomId);
        quiz?.showLeaderboard();
    }

}