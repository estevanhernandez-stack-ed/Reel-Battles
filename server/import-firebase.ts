import { db } from "./db";
import { triviaQuestions } from "@shared/schema";
import { sql } from "drizzle-orm";

interface FirestoreDocument {
  name: string;
  fields: {
    text?: { stringValue: string };
    options?: {
      arrayValue: {
        values: Array<{ stringValue: string }>;
      };
    };
    correctAnswerIndex?: { integerValue: string };
    movieTitle?: { stringValue: string };
    difficulty?: { stringValue: string };
    hint?: { stringValue: string };
    isDisabled?: { booleanValue: boolean };
  };
}

interface FirestoreResponse {
  documents?: FirestoreDocument[];
  nextPageToken?: string;
}

const FIRESTORE_BASE_URL =
  "https://firestore.googleapis.com/v1/projects/guestbuzz-cineperks/databases/(default)/documents";

function extractDocId(name: string): string {
  const parts = name.split("/");
  return parts[parts.length - 1];
}

interface QuestionRow {
  question: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
  category: string;
  difficulty: string;
  hint: string | null;
  movieTitle: string | null;
  firebaseId: string;
}

function transformDocument(doc: FirestoreDocument): QuestionRow | null {
  try {
    const fields = doc.fields;
    if (!fields.text?.stringValue || !fields.options?.arrayValue?.values) {
      return null;
    }

    if (fields.isDisabled?.booleanValue) {
      return null;
    }

    const questionText = fields.text.stringValue;
    const options = fields.options.arrayValue.values.map(v => v.stringValue);
    const correctIndex = parseInt(fields.correctAnswerIndex?.integerValue || "0", 10);

    if (options.length < 4 || correctIndex < 0 || correctIndex >= options.length) {
      return null;
    }

    const correctAnswer = options[correctIndex];
    const wrongAnswers = options.filter((_, i) => i !== correctIndex);

    return {
      question: questionText,
      correctAnswer,
      wrongAnswer1: wrongAnswers[0] || "",
      wrongAnswer2: wrongAnswers[1] || "",
      wrongAnswer3: wrongAnswers[2] || "",
      category: fields.movieTitle?.stringValue || "General",
      difficulty: fields.difficulty?.stringValue || "medium",
      hint: fields.hint?.stringValue || null,
      movieTitle: fields.movieTitle?.stringValue || null,
      firebaseId: extractDocId(doc.name),
    };
  } catch {
    return null;
  }
}

async function importFromFirebase() {
  console.log("Starting Firebase → PostgreSQL import...");
  console.log("Clearing existing trivia questions...");

  await db.delete(triviaQuestions);

  let totalFetched = 0;
  let totalInserted = 0;
  let pageToken: string | undefined;
  const pageSize = 300;
  const BATCH_SIZE = 500;
  let batch: QuestionRow[] = [];

  try {
    do {
      const url = new URL(`${FIRESTORE_BASE_URL}/questionBank`);
      url.searchParams.set("pageSize", pageSize.toString());
      if (pageToken) {
        url.searchParams.set("pageToken", pageToken);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        console.error(`Firestore API error: ${response.status} ${response.statusText}`);
        break;
      }

      const data: FirestoreResponse = await response.json();

      if (data.documents) {
        totalFetched += data.documents.length;

        for (const doc of data.documents) {
          const transformed = transformDocument(doc);
          if (transformed) {
            batch.push(transformed);
          }
        }

        if (batch.length >= BATCH_SIZE) {
          await db.insert(triviaQuestions).values(batch);
          totalInserted += batch.length;
          console.log(`  Inserted ${totalInserted} questions so far... (fetched ${totalFetched} from Firebase)`);
          batch = [];
        }
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    if (batch.length > 0) {
      await db.insert(triviaQuestions).values(batch);
      totalInserted += batch.length;
    }

    console.log(`\nImport complete!`);
    console.log(`  Fetched from Firebase: ${totalFetched}`);
    console.log(`  Inserted into PostgreSQL: ${totalInserted}`);
    console.log(`  Skipped (disabled/invalid): ${totalFetched - totalInserted}`);

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(triviaQuestions);
    console.log(`  Verified DB count: ${countResult.count}`);

  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

importFromFirebase();
