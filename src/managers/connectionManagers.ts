import { Socket } from "socket.io";
import { QuizManager } from "./quizManager";
import { adminInterface } from "../quiz";

export class ConnectionManager {
  private qm: any;
  constructor() {
    this.qm = new QuizManager();
  }

  userHandler(socket: Socket) {
    socket.on("JOIN_ADMIN", (data) => {
      console.log("creating quiz..");
      data = JSON.parse(data);
      const roomId = this.qm.createQuiz({
        adminUsername: data.username,
        adminPassword: data.password,
        adminSocket: socket,
      });
      socket.emit("message", {
        msg: `roomId: ${roomId}`,
      });
    });

    socket.on("START", (data) => {
      data = JSON.parse(data);
      this.qm.start({ roomId: data.roomId });
    });

    socket.on("ADD_PROBLEM", (data) => {
      console.log("adding problem...");
      data = JSON.parse(data);
      const questionId = this.qm.addProblem({
        roomId: data.roomId,
        question: data.question,
        options: data.options,
        answer: data.answer,
        image: data.image,
        adminPassword: data.adminPassword,
      });
      socket.emit("message", {
        msg: `questionId: ${questionId}`,
      });
    });

    socket.on("NEXT_QUESTION", (data) => {
      console.log("next question...");
      data = JSON.parse(data);
      const questionId = this.qm.nextQuestion({ roomId: data.roomId });
      socket.emit("message", {
        msg: `currentQuestionId: ${questionId}`,
      });
    });

    socket.on("SHOW_LEADERBOARD", (data) => {
      console.log("show leaderboard...");
      data = JSON.parse(data);
      this.qm.nextQuestion({ roomId: data.roomId });
    });

    socket.on("JOIN_SOLVER", (data) => {
      console.log("join solver...");
      data = JSON.parse(data);
      this.qm.joinUser({
        username: data.username,
        roomId: data.roomId,
        solverSocket: Socket,
      });
      socket.emit("message", {
        msg: "user joined sussccesfully",
      });
    });

    socket.on("SUBMISSION", (data) => {
      console.log("submission...");
      data = JSON.parse(data);
      this.qm.submit({
        userSocket: socket,
        roomId: data.roomId,
        questionId: data.questionId,
        answer: data.answer,
      });
    });
  }
}
