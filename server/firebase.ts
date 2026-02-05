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
    isKidFriendly?: { booleanValue: boolean };
    isDisabled?: { booleanValue: boolean };
  };
}

interface FirestoreResponse {
  documents?: FirestoreDocument[];
  nextPageToken?: string;
}

interface TransformedQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
  category: string;
  difficulty: string;
  hint: string | null;
  movieTitle: string | null;
}

const FIRESTORE_BASE_URL =
  "https://firestore.googleapis.com/v1/projects/guestbuzz-cineperks/databases/(default)/documents";

let cachedQuestions: TransformedQuestion[] = [];
let lastFetchTime = 0;
let isFetching = false;
let fetchPromise: Promise<void> | null = null;
const CACHE_DURATION = 30 * 60 * 1000;

function extractDocId(name: string): string {
  const parts = name.split("/");
  return parts[parts.length - 1];
}

function transformDocument(doc: FirestoreDocument): TransformedQuestion | null {
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
      id: extractDocId(doc.name),
      question: questionText,
      correctAnswer,
      wrongAnswer1: wrongAnswers[0] || "",
      wrongAnswer2: wrongAnswers[1] || "",
      wrongAnswer3: wrongAnswers[2] || "",
      category: fields.movieTitle?.stringValue || "General",
      difficulty: fields.difficulty?.stringValue || "medium",
      hint: fields.hint?.stringValue || null,
      movieTitle: fields.movieTitle?.stringValue || null,
    };
  } catch {
    return null;
  }
}

async function fetchAllQuestions(): Promise<TransformedQuestion[]> {
  const allQuestions: TransformedQuestion[] = [];
  let pageToken: string | undefined;
  const pageSize = 300;

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
        for (const doc of data.documents) {
          const transformed = transformDocument(doc);
          if (transformed) {
            allQuestions.push(transformed);
          }
        }
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    console.log(`Fetched ${allQuestions.length} questions from Firebase Firestore`);
    return allQuestions;
  } catch (error) {
    console.error("Error fetching from Firebase Firestore:", error);
    return allQuestions;
  }
}

function startBackgroundFetch(): void {
  if (isFetching) return;
  isFetching = true;
  console.log("Starting background Firebase question fetch...");
  fetchPromise = fetchAllQuestions()
    .then(questions => {
      cachedQuestions = questions;
      lastFetchTime = Date.now();
      isFetching = false;
      fetchPromise = null;
      console.log(`Firebase cache warmed: ${questions.length} questions ready`);
    })
    .catch(err => {
      console.error("Background fetch failed:", err);
      isFetching = false;
      fetchPromise = null;
    });
}

export function warmFirebaseCache(): void {
  startBackgroundFetch();
}

export async function getFirebaseQuestions(limit: number = 10): Promise<TransformedQuestion[]> {
  if (cachedQuestions.length === 0 && isFetching && fetchPromise) {
    await fetchPromise;
  }

  const now = Date.now();
  if (cachedQuestions.length === 0 || now - lastFetchTime > CACHE_DURATION) {
    if (!isFetching) {
      startBackgroundFetch();
    }
    if (cachedQuestions.length === 0 && fetchPromise) {
      await fetchPromise;
    }
  }

  if (cachedQuestions.length === 0) {
    return [];
  }

  const shuffled = [...cachedQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

export async function getFirebaseQuestionCount(): Promise<number> {
  if (cachedQuestions.length === 0 && fetchPromise) {
    await fetchPromise;
  }
  return cachedQuestions.length;
}
