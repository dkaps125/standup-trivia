import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useCatch, useLoaderData, useSubmit } from "@remix-run/react";
import qs from "qs";
import invariant from "tiny-invariant";
import * as React from 'react';
import { questionTypes } from "~/components/questions";

import { getGame } from "~/models/game.server";
import { getGameQuestions } from "~/models/question.server";
import { submitAnswer } from "~/models/answer.server";

type LoaderData = {
  game: NonNullable<Awaited<ReturnType<typeof getGame>>>;
  questions: NonNullable<Awaited<ReturnType<typeof getGameQuestions>>>;
};

type ActionData = {
  errors?: {
    entrant?: string;
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.code, "Game not found");

  const game = await getGame({ code: params.code });
  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  const questions = (await getGameQuestions({ id: game.id }))
    .map(question => ({
      ...question,
      data: typeof question.data === 'string' ? null : {
        ...question.data,
        correctOption: null,
        value: null
      }
    }));
  return json<LoaderData>({ game, questions: questions || [] });
};

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.code, "Game not found")

  const gameCode = params.code;
  const q = qs.parse(await request.text());
  const entrant = q['entrant'];
  const answers = q['answers'];

  if (typeof entrant !== "string" || entrant.length === 0) {
    return json<ActionData>(
      { errors: { entrant: "Name is required" } },
      { status: 400 }
    );
  }

  const game = await getGame({ code: gameCode });
  if (!game) {
    throw new Response("Game not found", { status: 400 });
  }

  await submitAnswer({ id: game.id, name: entrant, responses: answers as {} })

  return null;
};

export default function PlayGamePage() {
  const [hasSubmitted, setSubmitted] = React.useReducer(() => true, false);
  const submit = useSubmit();
  const data = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;

  const entrantRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    submit(event.currentTarget);
    setSubmitted();
  }

  if (hasSubmitted) {
    return (
      <div>
        <h3 className="text-2xl font-bold">{data.game.topic}</h3>
        <p className="py-2">{data.game.host}</p>
        <hr className="my-4" />
        <p className="my-4">
          Thanks for playing! The host will announce the winners shortly.
        </p>
        <Link
          to="/"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Go home
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.game.topic}</h3>
      <p className="py-2">{data.game.host}</p>
      <hr className="my-4" />
      <Form method="post" onSubmit={handleSubmit}>
        <label className="flex w-full flex-col gap-1 pb-3">
          <span>Your name: </span>
          <input
            ref={entrantRef}
            name="entrant"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.entrant ? true : undefined}
            aria-errormessage={
              actionData?.errors?.entrant ? "entrant-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.entrant && (
          <div className="pt-1 text-red-700" id="topic-error">
            {actionData.errors.entrant}
          </div>
        )}
        <div className="flex flex-col gap-3 pb-2">
          {data.questions.map((question, index) => {
            const Component = questionTypes[question.questionType].playComponent;

            return (
              <div key={question.pk}>
                <p>{index + 1}. {question.question}</p>
                <Component questionId={question.id} {...question.data} />
              </div>
            )
          })}
        </div>
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Submit
        </button>
      </Form>
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
