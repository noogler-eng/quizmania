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
    userSocket: Socket,
    roomId: string,
    questionId: string,
    answer: string
}


export class QuizManager{

    private quizes: Quiz[]

    private roomIdToQuiz = new Map<string, Quiz>();
    constructor(){
        this.quizes = [];
        this.roomIdToQuiz = new Map<string, Quiz>();
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
        const roomId = this.generateRandomString(4);
        const quiz = new Quiz(data.adminUsername, roomId, data.adminPassword, data.adminSocket);
        this.roomIdToQuiz.set(roomId, quiz);
        this.quizes.push(quiz);
        return roomId;
    }

    addProblem(data: dataQuizInterface){
        const quiz = this.roomIdToQuiz.get(data.roomId);        
        if (!quiz) {
            throw new Error(`Quiz not found for roomId: ${data.roomId}`);
        }

        try{
            const questionId = quiz?.addProblems(data.question, data.options, data.answer, " ", data.adminPassword);
            return questionId;
        }catch(error){
            console.log("error while adding problem", error);
        }
    }

    nextQuestion(data: nextQuizInterface){
        const quiz = this.roomIdToQuiz.get(data.roomId);
        const questionId = quiz?.nextProblem();
        return questionId;
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
        quiz?.submit(data.userSocket, data.questionId, data.answer);
    }

    // ---- // GENERAL WORKFLOW // ---- //
    showLeaderboard(data: userInterface){
        const quiz = this.roomIdToQuiz.get(data.roomId);
        quiz?.showLeaderboard();
    }

}