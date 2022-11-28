import type { Answer } from "~/models/answer.server";
import type { Question } from "~/models/question.server";

export const EditFreeformQuestion = () => {
  return (
    <label className="flex w-full flex-col gap-1">
      <span>Answer: </span>
      <textarea
        rows={2}
        name="answer"
        className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
        // aria-invalid={actionData?.errors?.question ? true : undefined}
        // aria-errormessage={
        //   actionData?.errors?.question ? "question-error" : undefined
        // }
      />
    </label>
  ) 
};

type Props = {
  questionId: string;
}

export const PlayFreeformQuestion = (props: Props) => {
  return (
    <label className="flex w-full flex-col gap-1">
      <textarea
        rows={2}
        name={`answers[${props.questionId}]`}
        className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
      />
    </label>
  ) 
};

export const getFreeformCorrectAnswer = (question: Question, correctAnswer: string, answers: Answer[]): Set<string> => {
  return new Set(answers.filter(answer => answer.responses?.[question.id] === correctAnswer).map(answer => answer.id));
};