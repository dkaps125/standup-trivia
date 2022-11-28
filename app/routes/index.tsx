import { Form, Link, useActionData } from "@remix-run/react";
import type { ActionFunction} from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import invariant from "tiny-invariant";
import { getGame } from "~/models/game.server";
import React from "react";

type ActionData = {
  errors?: {
    gameCode?: string;
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const gameCode = formData.get("gameCode");

  if (!gameCode || typeof gameCode !== 'string') {
    return json<ActionData>({
      errors: {
        gameCode: "Game code is required"
      }
    })
  }

  const game = await getGame({ code: gameCode });
  if (!game) {
    return json<ActionData>({
      errors: {
        gameCode: "Game does not exist"
      }
    })
  }

  return redirect(`/game/${gameCode}/play`);
};

export default function Index() {  
  const actionData = useActionData() as ActionData;

  const codeRef = React.useRef<HTMLInputElement>(null);

  if (actionData?.errors?.gameCode) {
    codeRef?.current?.focus();
  }

  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-red-500 drop-shadow-md">
                  Max & Eric&apos;s Fried Trivia
                </span>
              </h1>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                <div className="flex flex-col align-center justify-center space-y-4 sm:mx-auto sm:space-y-0">
                  <Link
                    to="/game/new"
                    className="flex items-center justify-center rounded-md bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600"
                  >
                    Create a new game
                  </Link>
                  <div className="flex flex-row justify-center items-center py-4">
                    <hr className="flex-1" />
                    <em className="px-2 text-gray-400">or</em>
                    <hr className="flex-1" />
                  </div>
                  <div>
                    <Form method="post">
                      <div className="flex flex-col w-full">
                        {actionData?.errors?.gameCode && (
                          <div className="pt-1 text-red-700" id="topic-error">
                            {actionData.errors.gameCode}
                          </div>
                        )}
                        <label className="flex w-full flex-col pb-1">
                          <input
                            ref={codeRef}
                            placeholder="Enter game code..."
                            name="gameCode"
                            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                            aria-invalid={actionData?.errors?.gameCode ? true : undefined}
                            aria-errormessage={
                              actionData?.errors?.gameCode ? "topic-error" : undefined
                            }
                          />
                        </label>
                        <button
                          type="submit"
                          className="flex items-center justify-center rounded-md border border-transparent bg-red-100 px-4 py-3 text-base font-medium text-red-700 shadow-sm hover:bg-red-50 sm:px-8"
                        >
                          Join an existing one
                        </button>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
