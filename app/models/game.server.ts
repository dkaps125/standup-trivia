import arc from "@architect/functions";
import cuid from "cuid";
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)

export type Game = {
  pk: string;
  sk: string;
  gs1pk: string;
  gs1sk: string;
  id: ReturnType<typeof cuid>;
  code: string;
  topic: string;
  host: string;
  questionOrdering: string[];
};

export const idToDynamoAttribute = (id: ReturnType<typeof cuid>): string => `game#${id}`;
const codeToDynamoAttribute = (code: string): string => `gamecode#${code}`;

export async function getGame({
  code
}: Pick<Game, "code">): Promise<Game | null> {
  const db = await arc.tables();

  const existingGame = await db.trivia.query({
    IndexName: 'GS1',
    KeyConditionExpression: 'gs1pk = :code AND gs1sk = :code',
    ExpressionAttributeValues: { ':code': codeToDynamoAttribute(code) },
  });

  if (existingGame.Items[0]) {
    return existingGame.Items[0];
  }
  return null;
}

export async function createGame({
  topic,
  host
}: Pick<Game, "topic" | "host">): Promise<Game> {
  const db = await arc.tables();

  const id = cuid();
  const code = await generateCode()

  const result = await db.trivia.put({
    pk: idToDynamoAttribute(id),
    sk: idToDynamoAttribute(id),
    gs1pk: codeToDynamoAttribute(code),
    gs1sk: codeToDynamoAttribute(code),
    id,
    code,
    topic,
    host,
    questionOrdering: []
  });

  return result;
}

const generateCode = async (): Promise<string> => {
  const db = await arc.tables();

  const code = nanoid()
  const existingGame = await db.trivia.query({
    IndexName: 'GS1',
    KeyConditionExpression: 'gs1pk = :code',
    ExpressionAttributeValues: { ':code': codeToDynamoAttribute(code) },
  });

  return existingGame.Count ? generateCode() : code;
};
