import { Link, useLoaderData } from "@remix-run/react";
import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import invariant from "tiny-invariant";
import { getGameQuestions } from "~/models/question.server";
import { getGame } from "~/models/game.server";

type LoaderData = {
  questions: NonNullable<Awaited<ReturnType<typeof getGameQuestions>>>;
}

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.code, "Game not found");

  const game = await getGame({ code: params.code });
  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }

  const questions = await getGameQuestions({ id: game.id });

  return json<LoaderData>({ questions: questions || [] });
}

export default function EditIndex() {
  const data = useLoaderData() as LoaderData;

  return (
    <div className="flex flex-col gap-2">
      {data.questions.map(question => {
        return (
          <div key={question.pk}>
            <p>Q: {question.question}</p>
          </div>
        );
      })}
      <Link to="addQuestion" className="text-blue-600 underline">
        Add a question
      </Link>
    </div>
  );
}