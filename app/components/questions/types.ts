import React from "react";
import { Answer } from "~/models/answer.server";
import { Question } from "~/models/question.server";

export type QuestionType = "multiple_choice" | "freeform" | "number"

export type QuestionComponent = {
  editComponent: React.ReactNode;
  playComponent: (props: any) => JSX.Element;
  name: string;
  getCorrectAnswers: (question: Question, correctAnswer: string, answers: Answer[]) => Set<string>;
}