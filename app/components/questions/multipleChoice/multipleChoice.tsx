import * as React from 'react';
import { Answer } from '~/models/answer.server';
import { Question } from '~/models/question.server';

export const EditMultipleChoiceQuestion = () => {
  const [options, setOptions] = React.useState<number[]>([0]);

  return (
    <div className="flex flex-col items-start gap-2">
      <span>Answers</span>
      {options.map((option, index) => {
        return (
          <label key={option} className="flex w-full flex-row gap-1">
            <input type="radio" value={option} name={`answer[correctOption]`} />
            <input
              name={`answer[options][${option}][text]`}
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            />
            {index !== 0 ? <button
              type="button"
              className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
              onClick={() => setOptions(options => [...options.slice(0, index), ...options.slice(index + 1)])}
            >
              -
            </button> : null}
          </label>
        )
      })}
      <button
        type="button"
        className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        onClick={() => setOptions(options => [...options, options[options.length - 1]+1])}
      >
        +
      </button>
    </div>
  )
}

type Props = {
  questionId: string;
  options: {[ key: number ]: {
    text: string;
  }}
}

export const PlayMultipleChoiceQuestion = ({ options, questionId }: Props) => {
  return (
    <div className="flex flex-col gap-1">
      {Object.entries(options).map(([optNum, option], index) => {
        return (
          <label key={optNum} className="flex w-full flex-row gap-1">
            <input type="radio" value={optNum} name={`answers[${questionId}]`} />
            <span>{option.text}</span>
          </label>
        )
      })}
    </div>
  )
}

export const getMultipleChoiceCorrectAnswer = (question: Question, correctAnswer: string, answers: Answer[]): Set<string> => {
  return new Set(answers.filter(answer => answer.responses?.[question.id] === correctAnswer).map(answer => answer.id));
};