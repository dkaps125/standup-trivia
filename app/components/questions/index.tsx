import { EditFreeformQuestion, getFreeformCorrectAnswer, PlayFreeformQuestion } from "./freeform/freeform";
import { EditMultipleChoiceQuestion, getMultipleChoiceCorrectAnswer, PlayMultipleChoiceQuestion } from "./multipleChoice/multipleChoice";
import { EditNumberQuestion, getNumberCorrectAnswer, PlayNumberQuestion } from "./number/number";
import { Question, QuestionComponent, QuestionType } from "./types";

export const questionTypes: { [key in QuestionType]: QuestionComponent } = {
  'freeform': {
    editComponent: <EditFreeformQuestion />,
    playComponent: PlayFreeformQuestion,
    name: 'Freeform',
    getCorrectAnswers: getFreeformCorrectAnswer
  },
  'multiple_choice': {
    editComponent: <EditMultipleChoiceQuestion />,
    playComponent: PlayMultipleChoiceQuestion,
    name: 'Multiple Choice',
    getCorrectAnswers: getMultipleChoiceCorrectAnswer
  },
  'number': {
    editComponent: <EditNumberQuestion />,
    playComponent: PlayNumberQuestion,
    name: 'Number',
    getCorrectAnswers: getNumberCorrectAnswer
  }
}; 