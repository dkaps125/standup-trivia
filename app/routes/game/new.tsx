import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import { createGame } from "~/models/game.server";

type ActionData = {
  errors?: {
    host?: string;
    topic?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const host = formData.get("host");
  const topic = formData.get("topic");

  if (typeof host !== "string" || host.length === 0) {
    return json<ActionData>(
      { errors: { host: "Host is required" } },
      { status: 400 }
    );
  }

  if (typeof topic !== "string" || topic.length === 0) {
    return json<ActionData>(
      { errors: { topic: "Topic is required" } },
      { status: 400 }
    );
  }

  const game = await createGame({ topic, host });

  return redirect(`/game/${game.code}/edit`);
};

export default function NewNotePage() {
  const actionData = useActionData() as ActionData;
  const topicRef = React.useRef<HTMLInputElement>(null);
  const hostRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.topic) {
      topicRef.current?.focus();
    } else if (actionData?.errors?.host) {
      hostRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Create a game</h1>
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
          maxWidth: "320px"
        }}
      >
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Topic: </span>
            <input
              ref={topicRef}
              name="topic"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.topic ? true : undefined}
              aria-errormessage={
                actionData?.errors?.topic ? "topic-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.topic && (
            <div className="pt-1 text-red-700" id="topic-error">
              {actionData.errors.topic}
            </div>
          )}
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Host: </span>
            <input
              ref={hostRef}
              name="host"
              className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
              aria-invalid={actionData?.errors?.host ? true : undefined}
              aria-errormessage={
                actionData?.errors?.host ? "host-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.host && (
            <div className="pt-1 text-red-700" id="host-error">
              {actionData.errors.host}
            </div>
          )}
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create
          </button>
        </div>
      </Form>
    </div>
  );
}
