import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import * as React from "react";
import invariant from "tiny-invariant";
import qs from 'qs';
import { questionTypes } from "~/components/questions";
import { QuestionType } from "~/components/questions/types";
import { addQuestion } from "~/models/question.server";
import { getGame } from "~/models/game.server";

type LoaderData = {
  code: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.code, "Game not found");

  return json<LoaderData>({ code: params.code });
};

type ActionData = {
  errors?: {
    question?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.code, 'Game not found')

  const q = qs.parse(await request.text());
  const gameCode = params.code;
  const question = q['question'];
  const questionType = q['questionType'];
  const answer = q['answer'];

  const questionObj = {
    question,
    questionType,
    answer
  };

  if ([gameCode, question, questionType].some(val => !val || typeof val !== 'string')) {
    return json<ActionData>({
      errors: { question: 'Question is invalid' }
    }, { status: 400 })
  }

  const game = await getGame({ code: gameCode as string })
  if (!game) {
    return json<ActionData>({}, { status: 404 })
  }

  await addQuestion({ 
    id: game.id,
    question: question as string,
    questionType: questionType as QuestionType,
    data: answer
  })

  return redirect(`/game/${gameCode}/edit`);
}

export default function AddQuestion() {
  const [questionType, setQuestionType] = React.useState<QuestionType>('freeform');
  const loaderData = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const questionRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <Form method="post">
      <div className="flex flex-col w-full gap-2">
        <label className="flex w-full flex-col gap-1">
          <span>Question type: </span>
          <select name="questionType" onChange={e => setQuestionType(e.target.value as QuestionType)}>
            {Object.keys(questionTypes).map(key => 
              <option value={key} key={key}>{questionTypes[key as QuestionType].name}</option>
            )} 
          </select>
        </label>
        <label className="flex w-full flex-col gap-1">
          <span>Question: </span>
          <textarea
            ref={questionRef}
            rows={2}
            name="question"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.question ? true : undefined}
            aria-errormessage={
              actionData?.errors?.question ? "question-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.question && (
          <div className="pt-1 text-red-700" id="question-error">
            {actionData.errors.question}
          </div>
        )}
        {questionTypes[questionType].editComponent}
      </div>

      <div className="text-right pt-2">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 mr-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Add
        </button>
        <Link
          to={`/game/${loaderData.code}/edit`}
          className="rounded py-3 px-4 text-blue-500 hover:bg-blue-100 focus:bg-blue-400"
        >
          Cancel
        </Link>
      </div>
    </Form>
  );
}