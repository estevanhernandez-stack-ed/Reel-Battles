import { db } from "./db";
import { triviaQuestions, movies } from "@shared/schema";

const sampleTriviaQuestions = [
  {
    question: "Who directed 'The Godfather' (1972)?",
    correctAnswer: "Francis Ford Coppola",
    wrongAnswer1: "Martin Scorsese",
    wrongAnswer2: "Steven Spielberg",
    wrongAnswer3: "Stanley Kubrick",
    category: "Directors",
    difficulty: "easy",
  },
  {
    question: "Which film won the Academy Award for Best Picture in 1994?",
    correctAnswer: "Forrest Gump",
    wrongAnswer1: "Pulp Fiction",
    wrongAnswer2: "The Shawshank Redemption",
    wrongAnswer3: "Four Weddings and a Funeral",
    category: "Awards",
    difficulty: "medium",
  },
  {
    question: "Who played the Joker in 'The Dark Knight' (2008)?",
    correctAnswer: "Heath Ledger",
    wrongAnswer1: "Joaquin Phoenix",
    wrongAnswer2: "Jack Nicholson",
    wrongAnswer3: "Jared Leto",
    category: "Actors",
    difficulty: "easy",
  },
  {
    question: "What year was 'Jurassic Park' released?",
    correctAnswer: "1993",
    wrongAnswer1: "1991",
    wrongAnswer2: "1995",
    wrongAnswer3: "1994",
    category: "Release Dates",
    difficulty: "medium",
  },
  {
    question: "Which actor starred in both 'Fight Club' and 'Se7en'?",
    correctAnswer: "Brad Pitt",
    wrongAnswer1: "Edward Norton",
    wrongAnswer2: "Morgan Freeman",
    wrongAnswer3: "Kevin Spacey",
    category: "Actors",
    difficulty: "easy",
  },
  {
    question: "What is the highest-grossing film of all time (adjusted for inflation)?",
    correctAnswer: "Gone with the Wind",
    wrongAnswer1: "Avatar",
    wrongAnswer2: "Titanic",
    wrongAnswer3: "Star Wars: A New Hope",
    category: "Box Office",
    difficulty: "hard",
  },
  {
    question: "Who composed the iconic score for 'Jaws'?",
    correctAnswer: "John Williams",
    wrongAnswer1: "Hans Zimmer",
    wrongAnswer2: "Ennio Morricone",
    wrongAnswer3: "Bernard Herrmann",
    category: "Music",
    difficulty: "medium",
  },
  {
    question: "In which city is 'Blade Runner' set?",
    correctAnswer: "Los Angeles",
    wrongAnswer1: "New York",
    wrongAnswer2: "Tokyo",
    wrongAnswer3: "London",
    category: "Settings",
    difficulty: "medium",
  },
  {
    question: "Who directed 'Inception' (2010)?",
    correctAnswer: "Christopher Nolan",
    wrongAnswer1: "David Fincher",
    wrongAnswer2: "Denis Villeneuve",
    wrongAnswer3: "Ridley Scott",
    category: "Directors",
    difficulty: "easy",
  },
  {
    question: "What was the first fully computer-animated feature film?",
    correctAnswer: "Toy Story",
    wrongAnswer1: "Shrek",
    wrongAnswer2: "Finding Nemo",
    wrongAnswer3: "A Bug's Life",
    category: "Animation",
    difficulty: "medium",
  },
  {
    question: "Which actress won an Oscar for 'Black Swan' (2010)?",
    correctAnswer: "Natalie Portman",
    wrongAnswer1: "Mila Kunis",
    wrongAnswer2: "Jennifer Lawrence",
    wrongAnswer3: "Anne Hathaway",
    category: "Awards",
    difficulty: "medium",
  },
  {
    question: "What is the name of the fictional African nation in 'Black Panther'?",
    correctAnswer: "Wakanda",
    wrongAnswer1: "Zamunda",
    wrongAnswer2: "Genosha",
    wrongAnswer3: "Latveria",
    category: "Trivia",
    difficulty: "easy",
  },
];

const sampleMovies = [
  {
    title: "Avatar",
    year: 2009,
    openingWeekend: 77025481,
    genre: "Sci-Fi",
    director: "James Cameron",
    rating: "PG-13",
    synopsis: "A paraplegic Marine dispatched to the moon Pandora becomes torn between following his orders and protecting the world he feels is his home.",
  },
  {
    title: "Avengers: Endgame",
    year: 2019,
    openingWeekend: 357115007,
    genre: "Action",
    director: "Anthony & Joe Russo",
    rating: "PG-13",
    synopsis: "The Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
  },
  {
    title: "The Dark Knight",
    year: 2008,
    openingWeekend: 158411483,
    genre: "Action",
    director: "Christopher Nolan",
    rating: "PG-13",
    synopsis: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
  },
  {
    title: "Jurassic World",
    year: 2015,
    openingWeekend: 208806270,
    genre: "Adventure",
    director: "Colin Trevorrow",
    rating: "PG-13",
    synopsis: "A fully functional dinosaur theme park descends into chaos when a genetically modified dinosaur breaks loose.",
  },
  {
    title: "The Lion King",
    year: 2019,
    openingWeekend: 191770759,
    genre: "Animation",
    director: "Jon Favreau",
    rating: "PG",
    synopsis: "A young lion prince flees his kingdom after his father's death only to return years later to reclaim his throne.",
  },
  {
    title: "Frozen II",
    year: 2019,
    openingWeekend: 130263358,
    genre: "Animation",
    director: "Chris Buck & Jennifer Lee",
    rating: "PG",
    synopsis: "Anna, Elsa, Kristoff, and Olaf head far into the forest to discover the origin of Elsa's powers.",
  },
  {
    title: "Spider-Man: No Way Home",
    year: 2021,
    openingWeekend: 260138569,
    genre: "Action",
    director: "Jon Watts",
    rating: "PG-13",
    synopsis: "Peter Parker seeks Doctor Strange's help to make everyone forget he is Spider-Man.",
  },
  {
    title: "Black Panther",
    year: 2018,
    openingWeekend: 202003951,
    genre: "Action",
    director: "Ryan Coogler",
    rating: "PG-13",
    synopsis: "T'Challa returns home to Wakanda to take his rightful place as king after the death of his father.",
  },
  {
    title: "Incredibles 2",
    year: 2018,
    openingWeekend: 182687905,
    genre: "Animation",
    director: "Brad Bird",
    rating: "PG",
    synopsis: "The Parr family takes on a new mission which involves a change in family roles.",
  },
  {
    title: "Star Wars: The Force Awakens",
    year: 2015,
    openingWeekend: 247966675,
    genre: "Sci-Fi",
    director: "J.J. Abrams",
    rating: "PG-13",
    synopsis: "Three decades after the defeat of the Empire, a new threat arises in the form of the First Order.",
  },
  {
    title: "Titanic",
    year: 1997,
    openingWeekend: 28638131,
    genre: "Romance",
    director: "James Cameron",
    rating: "PG-13",
    synopsis: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the ill-fated R.M.S. Titanic.",
  },
  {
    title: "The Godfather",
    year: 1972,
    openingWeekend: 26081000,
    genre: "Crime",
    director: "Francis Ford Coppola",
    rating: "R",
    synopsis: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.",
  },
  {
    title: "Joker",
    year: 2019,
    openingWeekend: 96202337,
    genre: "Drama",
    director: "Todd Phillips",
    rating: "R",
    synopsis: "A mentally troubled comedian embarks on a downward spiral that leads to the creation of an iconic villain.",
  },
  {
    title: "Toy Story 4",
    year: 2019,
    openingWeekend: 120908065,
    genre: "Animation",
    director: "Josh Cooley",
    rating: "G",
    synopsis: "Woody and the gang go on a road trip with Bonnie and a new toy named Forky.",
  },
  {
    title: "Captain Marvel",
    year: 2019,
    openingWeekend: 153433423,
    genre: "Action",
    director: "Anna Boden & Ryan Fleck",
    rating: "PG-13",
    synopsis: "Carol Danvers becomes one of the universe's most powerful heroes during a galactic war.",
  },
];

export async function seedDatabase() {
  try {
    const existingQuestions = await db.select().from(triviaQuestions).limit(1);
    if (existingQuestions.length === 0) {
      console.log("Seeding trivia questions...");
      await db.insert(triviaQuestions).values(sampleTriviaQuestions);
      console.log(`Seeded ${sampleTriviaQuestions.length} trivia questions`);
    } else {
      console.log("Trivia questions already exist, skipping seed");
    }

    const existingMovies = await db.select().from(movies).limit(1);
    if (existingMovies.length === 0) {
      console.log("Seeding movies...");
      await db.insert(movies).values(sampleMovies);
      console.log(`Seeded ${sampleMovies.length} movies`);
    } else {
      console.log("Movies already exist, skipping seed");
    }

    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
