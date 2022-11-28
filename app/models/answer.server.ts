import arc from '@architect/functions';
import cuid from 'cuid';
import { Game, idToDynamoAttribute } from './game.server';

export type Answer = {
  pk: string;
  sk: string;
  gs1pk: string;
  gs1sk: string;
  id: ReturnType<typeof cuid>;
  name: string;
  responses: { [key: string]: string } | undefined;
};

export const answerIdToDynamoAttribute = (id: ReturnType<typeof cuid>): string => `answer#${id}`;

export async function submitAnswer({
  id: gameId,
  ...rest
}: Pick<Answer, "name" | "responses"> & Pick<Game, "id">) {
  const db = await arc.tables();

  const id = cuid();

  const result = await db.trivia.put({
    pk: idToDynamoAttribute(gameId),
    sk: answerIdToDynamoAttribute(id),
    gs1pk: answerIdToDynamoAttribute(id),
    gs1sk: idToDynamoAttribute(gameId),
    id,
    ...rest
  });

  return result;
}

export async function getGameAnswers({
  id
}: Pick<Game, "id">): Promise<Answer[]> {
  const db = await arc.tables();

  const answers = await db.trivia.query({
    KeyConditionExpression: 'pk = :id AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: {
      ':id': idToDynamoAttribute(id),
      ':prefix': 'answer'
    }
  })

  return answers.Items;
}