import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { questionTypes } from "~/components/questions";
import { getGameAnswers } from "~/models/answer.server";

import { getGame } from "~/models/game.server";
import { getGameQuestions } from "~/models/question.server";

type LoaderData = {
  game: NonNullable<Awaited<ReturnType<typeof getGame>>>;
  questions: NonNullable<Awaited<ReturnType<typeof getGameQuestions>>>;
  answers: NonNullable<Awaited<ReturnType<typeof getGameAnswers>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.code, "Game not found");

  const game = await getGame({ code: params.code });
  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  const questions = await getGameQuestions({ id: game.id });
  const answers = await getGameAnswers({ id: game.id });
  return json<LoaderData>({ game, questions: questions || [], answers: answers || [] });
};

export default function RunGamePage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.game.topic}</h3>
      <p className="py-2">Hosted by {data.game.host}</p>
      <div>
        {data.questions.map(question => {
          const correctAnswer = question.data.correctOption || question.data.value || question.data;
          const correctResponses = questionTypes[question.questionType].getCorrectAnswers(question, correctAnswer, data.answers);

          return (
            <div key={question.pk} className="pb-2">
              <h3 className="font-bold">Q: {question.question}</h3>
              <p>Correct answer: {correctAnswer} {question.data.options?.[correctAnswer]?.text}</p>
              <div className="flex flex-col gap-1">
                {data.answers.length 
                  ? data.answers.map(answer => {
                    const thisAnswer = answer.responses?.[question.id];

                    return (
                      <span key={answer.id} className={`${correctResponses.has(answer.id) ? 'text-green-700' : 'text-red-500'}`}>
                        {thisAnswer} - {answer.name}
                      </span>
                    )
                  })
                  : 'No responses yet.'}
              </div>
            </div>
          )
        })}
      </div>
      <hr className="my-4" />
        <Link
          to={`/game/edit/${data.game.code}`}
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Edit
        </Link>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
