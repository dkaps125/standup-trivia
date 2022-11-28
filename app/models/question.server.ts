import arc from "@architect/functions";
import cuid from "cuid";
import { QuestionType } from "~/components/questions/types";
import { Game, idToDynamoAttribute } from "./game.server";

export type Question = {
  pk: string;
  sk: string;
  gs1pk: string;
  gs1sk: string;
  id: string;
  question: string;
  questionType: QuestionType;
  data: any;
};

const questionIdToDynamoAttribute = (id: ReturnType<typeof cuid>): string => `question#${id}`;

export async function getGameQuestions({
  id
}: Pick<Game, "id">): Promise<Question[]> {
  const db = await arc.tables();

  const questions = await db.trivia.query({
    KeyConditionExpression: 'pk = :id AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: {
      ':id': idToDynamoAttribute(id),
      ':prefix': 'question'
    }
  })

  return questions.Items
}

export async function addQuestion({
  id: gameId,
  ...rest
}: Omit<Question, "sk" | "pk" | "gs1pk" | "gs1sk" | "id"> & Pick<Game, "id">) {
  const db = await arc.tables();

  const id = cuid();

  const result = await db.trivia.put({
    pk: idToDynamoAttribute(gameId),
    sk: questionIdToDynamoAttribute(id),
    gs1pk: questionIdToDynamoAttribute(id),
    gs1sk: idToDynamoAttribute(gameId),
    id,
    ...rest
  });

  return result;
}