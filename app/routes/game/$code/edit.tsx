import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getGame } from "~/models/game.server";

type LoaderData = {
  game: NonNullable<Awaited<ReturnType<typeof getGame>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.code, "noteId not found");

  const game = await getGame({ code: params.code });
  if (!game) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ game });
};

export default function NoteDetailsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.game.topic}</h3>
      <p className="py-2">Hosted by {data.game.host}</p>
      <hr className="my-4" />
      <Outlet />
      <hr className="my-4" />
      <Link
        to={`/game/${data.game.code}/run`}
        className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
      >
        Start
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
