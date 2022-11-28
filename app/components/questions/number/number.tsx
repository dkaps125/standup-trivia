import type { Answer } from "~/models/answer.server";
import type { Question } from "~/models/question.server";

export const EditNumberQuestion = () => {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex w-full flex-col gap-1">
        <span>Answer: </span>
        <input
          type="number"
          name="answer[value]"
          className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          // aria-invalid={actionData?.errors?.question ? true : undefined}
          // aria-errormessage={
          //   actionData?.errors?.question ? "question-error" : undefined
          // }
        />
      </label>
      <div className="flex flex-col justify-between">
        <span>Scoring type:</span>
        <label>
          <input name="answer[scoringType]" className="mr-2" type="radio" value="price_is_right" />
          <span>&quot;The Price Is Right&quot; Rules</span>
        </label>
        <label>
          <input name="answer[scoringType]" className="mr-2" type="radio" value="exact" />
          <span>Exact</span>
        </label>
        <label>
          <input name="answer[scoringType]" className="mr-2" type="radio" value="closest" />
          <span>Closest</span>
        </label>
      </div>
    </div>
  )
}

type Props = {
  questionId: string;
}

export const PlayNumberQuestion = (props: Props) => {
  return (
    <label className="flex w-full flex-col gap-1">
      <input
        type="number"
        name={`answers[${props.questionId}]`}
        className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
        // aria-invalid={actionData?.errors?.question ? true : undefined}
        // aria-errormessage={
        //   actionData?.errors?.question ? "question-error" : undefined
        // }
      />
    </label>
  )
}

export const getNumberCorrectAnswer = (question: Question, correctAnswer: string, answers: Answer[]): Set<string> => {
  const correctInt = parseInt(correctAnswer);

  if (question.data.scoringType === 'closest') {
    return new Set([answers.sort((a, b) => {
      if (!a.responses?.[question.id]) {
        return 1;
      } else if (!b.responses?.[question.id]) {
        return -1
      }

      const correctAnswer = parseInt(question.data.value);
      const aDiff = correctAnswer - parseInt(a.responses[question.id])
      const bDiff = correctAnswer - parseInt(b.responses[question.id])

      return aDiff - bDiff;
    }).map(answer => answer.id)[0]])
  } else if (question.data.scoringType === 'price_is_right') {
    // like 'closest', but can't exceed the correct answer
    return new Set([answers.filter(answer => answer.responses?.[question.id] && parseInt(answer.responses[question.id]) < correctInt)
      .sort((a, b) => {
        if (!a.responses?.[question.id]) {
          return 1;
        } else if (!b.responses?.[question.id]) {
          return -1
        }

        const aDiff = correctInt - parseInt(a.responses[question.id])
        const bDiff = correctInt - parseInt(b.responses[question.id])

        return aDiff - bDiff;
      }).map(answer => answer.id)[0]])
  }
  
  // Default to 'exact'
  return new Set(answers.filter(answer => answer.responses?.[question.id] === correctAnswer).map(answer => answer.id));
};