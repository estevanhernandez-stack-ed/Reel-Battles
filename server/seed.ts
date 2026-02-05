import { db } from "./db";
import { triviaQuestions, movies, movieAthletes } from "@shared/schema";

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

const sampleMovieAthletes = [
  // CAPTAINS (Round 1 picks - leaders and coaches)
  { name: "Herman Boone", movie: "Remember the Titans", movieYear: 2000, sport: "Football", actor: "Denzel Washington", archetype: "captain", bio: "Head coach who united a racially divided high school team into state champions.", quote: "I don't care if you like each other or not. But you will respect each other.", athleticism: 42, clutch: 85, leadership: 99, heart: 90, skill: 75, intimidation: 88, teamwork: 82, charisma: 92 },
  { name: "Coach Norman Dale", movie: "Hoosiers", movieYear: 1986, sport: "Basketball", actor: "Gene Hackman", archetype: "captain", bio: "Disgraced college coach who led a tiny Indiana high school to the state championship.", quote: "I love you guys.", athleticism: 35, clutch: 88, leadership: 95, heart: 92, skill: 78, intimidation: 70, teamwork: 90, charisma: 85 },
  { name: "Ken Carter", movie: "Coach Carter", movieYear: 2005, sport: "Basketball", actor: "Samuel L. Jackson", archetype: "captain", bio: "Coach who locked his undefeated team out of the gym until they improved their grades.", quote: "Our deepest fear is not that we are inadequate.", athleticism: 55, clutch: 80, leadership: 98, heart: 95, skill: 72, intimidation: 92, teamwork: 88, charisma: 90 },
  { name: "Tony D'Amato", movie: "Any Given Sunday", movieYear: 1999, sport: "Football", actor: "Al Pacino", archetype: "captain", bio: "Veteran head coach fighting for relevance in a game that has passed him by.", quote: "The inches we need are everywhere around us.", athleticism: 30, clutch: 90, leadership: 94, heart: 88, skill: 80, intimidation: 85, teamwork: 78, charisma: 96 },
  { name: "Herb Brooks", movie: "Miracle", movieYear: 2004, sport: "Hockey", actor: "Kurt Russell", archetype: "captain", bio: "The coach who led a team of college kids to defeat the unbeatable Soviet hockey team.", quote: "Great moments are born from great opportunity.", athleticism: 45, clutch: 95, leadership: 99, heart: 92, skill: 82, intimidation: 78, teamwork: 95, charisma: 88 },
  { name: "Jimmy Dugan", movie: "A League of Their Own", movieYear: 1992, sport: "Baseball", actor: "Tom Hanks", archetype: "captain", bio: "Washed-up former slugger who reluctantly coaches a women's baseball team.", quote: "There's no crying in baseball!", athleticism: 50, clutch: 75, leadership: 78, heart: 72, skill: 85, intimidation: 55, teamwork: 70, charisma: 92 },
  { name: "Gordon Bombay", movie: "The Mighty Ducks", movieYear: 1992, sport: "Hockey", actor: "Emilio Estevez", archetype: "captain", bio: "Hotshot lawyer forced into coaching a ragtag youth hockey team as community service.", quote: "Ducks fly together.", athleticism: 65, clutch: 72, leadership: 85, heart: 88, skill: 78, intimidation: 45, teamwork: 92, charisma: 80 },
  { name: "Mickey Goldmill", movie: "Rocky", movieYear: 1976, sport: "Boxing", actor: "Burgess Meredith", archetype: "captain", bio: "Grizzled old trainer who saw something special in a Philly brawler nobody believed in.", quote: "You're gonna eat lightnin' and you're gonna crap thunder!", athleticism: 25, clutch: 88, leadership: 92, heart: 95, skill: 90, intimidation: 70, teamwork: 85, charisma: 82 },

  // NATURALS (Round 2 picks - pure talent)
  { name: "Roy Hobbs", movie: "The Natural", movieYear: 1984, sport: "Baseball", actor: "Robert Redford", archetype: "natural", bio: "A mysteriously gifted middle-aged rookie whose talent borders on the mythical.", quote: "I coulda been better. I coulda broke every record in the book.", athleticism: 88, clutch: 99, leadership: 70, heart: 85, skill: 98, intimidation: 75, teamwork: 65, charisma: 78 },
  { name: "Apollo Creed", movie: "Rocky", movieYear: 1976, sport: "Boxing", actor: "Carl Weathers", archetype: "natural", bio: "The People's Champion -- flashy, talented, and supremely confident heavyweight champion.", quote: "I want you to promise me you're gonna stop this fight.", athleticism: 95, clutch: 82, leadership: 78, heart: 80, skill: 92, intimidation: 72, teamwork: 75, charisma: 96 },
  { name: "Willie Mays Hayes", movie: "Major League", movieYear: 1989, sport: "Baseball", actor: "Wesley Snipes", archetype: "natural", bio: "Blazing-fast outfielder who showed up to spring training uninvited and earned his spot.", quote: "I hit like Mays, and I run like Hayes.", athleticism: 98, clutch: 68, leadership: 55, heart: 75, skill: 72, intimidation: 45, teamwork: 70, charisma: 85 },
  { name: "Bobby Boucher", movie: "The Waterboy", movieYear: 1998, sport: "Football", actor: "Adam Sandler", archetype: "natural", bio: "Socially awkward waterboy whose suppressed rage made him the hardest hitter in football.", quote: "My Mama says that alligators are ornery because they got all them teeth and no toothbrush.", athleticism: 92, clutch: 78, leadership: 35, heart: 95, skill: 65, intimidation: 88, teamwork: 60, charisma: 72 },
  { name: "Ricky Vaughn", movie: "Major League", movieYear: 1989, sport: "Baseball", actor: "Charlie Sheen", archetype: "natural", bio: "Ex-con pitcher with a 100mph fastball and zero control -- until he got glasses.", quote: "Just a bit outside.", athleticism: 85, clutch: 88, leadership: 50, heart: 70, skill: 95, intimidation: 82, teamwork: 55, charisma: 90 },
  { name: "Michael Jordan", movie: "Space Jam", movieYear: 1996, sport: "Basketball", actor: "Michael Jordan", archetype: "natural", bio: "The GOAT himself, saving the Looney Tunes from alien enslavement through basketball.", quote: "Larry, I'm going to play basketball again.", athleticism: 99, clutch: 99, leadership: 85, heart: 80, skill: 99, intimidation: 78, teamwork: 72, charisma: 92 },
  { name: "Dottie Hinson", movie: "A League of Their Own", movieYear: 1992, sport: "Baseball", actor: "Geena Davis", archetype: "natural", bio: "Farm girl turned star catcher -- the best player in the women's league, period.", quote: "It's supposed to be hard. If it wasn't hard, everyone would do it.", athleticism: 88, clutch: 85, leadership: 80, heart: 78, skill: 95, intimidation: 60, teamwork: 82, charisma: 75 },
  { name: "Adonis Creed", movie: "Creed", movieYear: 2015, sport: "Boxing", actor: "Michael B. Jordan", archetype: "natural", bio: "Apollo Creed's son, forging his own legacy in the ring under Rocky's guidance.", quote: "I gotta prove it.", athleticism: 94, clutch: 88, leadership: 72, heart: 92, skill: 90, intimidation: 78, teamwork: 68, charisma: 85 },

  // UNDERDOGS (Round 3 picks - heart over talent)
  { name: "Rocky Balboa", movie: "Rocky", movieYear: 1976, sport: "Boxing", actor: "Sylvester Stallone", archetype: "underdog", bio: "A small-time Philly boxer who got a million-to-one shot and went the distance.", quote: "Yo, Adrian! I did it!", athleticism: 78, clutch: 92, leadership: 68, heart: 99, skill: 65, intimidation: 62, teamwork: 72, charisma: 88 },
  { name: "Rudy Ruettiger", movie: "Rudy", movieYear: 1993, sport: "Football", actor: "Sean Astin", archetype: "underdog", bio: "Undersized, overlooked, and told he'd never play -- then he dressed for Notre Dame.", quote: "Having a dream is what makes life tolerable.", athleticism: 55, clutch: 85, leadership: 75, heart: 99, skill: 45, intimidation: 35, teamwork: 90, charisma: 82 },
  { name: "Happy Gilmore", movie: "Happy Gilmore", movieYear: 1996, sport: "Golf", actor: "Adam Sandler", archetype: "underdog", bio: "Failed hockey player who discovered a monster golf drive and took on the PGA to save grandma's house.", quote: "The price is wrong, Bobby.", athleticism: 82, clutch: 85, leadership: 32, heart: 90, skill: 55, intimidation: 70, teamwork: 38, charisma: 95 },
  { name: "Shane Falco", movie: "The Replacements", movieYear: 2000, sport: "Football", actor: "Keanu Reeves", archetype: "underdog", bio: "Washed-up QB who got one last shot with a team of replacement players during a strike.", quote: "Pain heals. Chicks dig scars. Glory lasts forever.", athleticism: 75, clutch: 88, leadership: 78, heart: 85, skill: 72, intimidation: 55, teamwork: 85, charisma: 80 },
  { name: "Daniel LaRusso", movie: "The Karate Kid", movieYear: 1984, sport: "Martial Arts", actor: "Ralph Macchio", archetype: "underdog", bio: "Skinny Jersey kid who learned karate from a maintenance man and stood up to bullies.", quote: "Wax on, wax off.", athleticism: 65, clutch: 90, leadership: 60, heart: 95, skill: 75, intimidation: 40, teamwork: 72, charisma: 78 },
  { name: "Peter La Fleur", movie: "Dodgeball", movieYear: 2004, sport: "Dodgeball", actor: "Vince Vaughn", archetype: "underdog", bio: "Lovable slacker gym owner who enters a dodgeball tournament to save his business.", quote: "Nobody makes me bleed my own blood.", athleticism: 68, clutch: 78, leadership: 72, heart: 80, skill: 65, intimidation: 45, teamwork: 88, charisma: 92 },
  { name: "Jimmy Chitwood", movie: "Hoosiers", movieYear: 1986, sport: "Basketball", actor: "Maris Valainis", archetype: "underdog", bio: "The quiet star player who refused to play until his town rallied behind their coach.", quote: "I'll make it.", athleticism: 72, clutch: 98, leadership: 65, heart: 88, skill: 92, intimidation: 50, teamwork: 78, charisma: 60 },
  { name: "Benny Rodriguez", movie: "The Sandlot", movieYear: 1993, sport: "Baseball", actor: "Mike Vitar", archetype: "underdog", bio: "The best ballplayer in the neighborhood who outran a legendary junkyard dog.", quote: "Heroes get remembered, but legends never die.", athleticism: 90, clutch: 85, leadership: 82, heart: 88, skill: 88, intimidation: 55, teamwork: 85, charisma: 78 },
  { name: "Paul Crewe", movie: "The Longest Yard", movieYear: 2005, sport: "Football", actor: "Adam Sandler", archetype: "underdog", bio: "Disgraced former NFL quarterback who assembled a team of convicts to take on the guards.", quote: "It's not whether you win or lose, it's whether you win!", athleticism: 78, clutch: 82, leadership: 80, heart: 85, skill: 75, intimidation: 68, teamwork: 78, charisma: 85 },
  { name: "Roy McAvoy", movie: "Tin Cup", movieYear: 1996, sport: "Golf", actor: "Kevin Costner", archetype: "underdog", bio: "Driving range pro who qualified for the U.S. Open on sheer stubbornness and talent.", quote: "When a defining moment comes along, you define the moment... or the moment defines you.", athleticism: 70, clutch: 75, leadership: 55, heart: 92, skill: 88, intimidation: 45, teamwork: 50, charisma: 82 },

  // VETERANS (Round 4 picks - experience and wisdom)
  { name: "Crash Davis", movie: "Bull Durham", movieYear: 1988, sport: "Baseball", actor: "Kevin Costner", archetype: "veteran", bio: "Career minor leaguer brought in to mentor a wild young pitcher with a million-dollar arm.", quote: "I believe in the soul, the small of a woman's back, the hanging curveball.", athleticism: 62, clutch: 80, leadership: 88, heart: 82, skill: 78, intimidation: 55, teamwork: 90, charisma: 92 },
  { name: "Jake Taylor", movie: "Major League", movieYear: 1989, sport: "Baseball", actor: "Tom Berenger", archetype: "veteran", bio: "Aging catcher with bad knees brought back for one last shot at the pennant.", quote: "In case you haven't noticed, and judging by the attendance you haven't, the Indians have managed to win a few games.", athleticism: 55, clutch: 85, leadership: 88, heart: 80, skill: 75, intimidation: 60, teamwork: 92, charisma: 78 },
  { name: "Mr. Miyagi", movie: "The Karate Kid", movieYear: 1984, sport: "Martial Arts", actor: "Pat Morita", archetype: "veteran", bio: "Humble maintenance man and karate master who taught a boy to fight -- and to live.", quote: "Wax on, wax off.", athleticism: 58, clutch: 80, leadership: 90, heart: 88, skill: 95, intimidation: 72, teamwork: 85, charisma: 88 },
  { name: "Billy Beane", movie: "Moneyball", movieYear: 2011, sport: "Baseball", actor: "Brad Pitt", archetype: "veteran", bio: "Oakland A's GM who revolutionized baseball by using statistics to build a winning team on a budget.", quote: "How can you not be romantic about baseball?", athleticism: 68, clutch: 75, leadership: 92, heart: 78, skill: 85, intimidation: 65, teamwork: 80, charisma: 88 },
  { name: "Ray Kinsella", movie: "Field of Dreams", movieYear: 1989, sport: "Baseball", actor: "Kevin Costner", archetype: "veteran", bio: "Iowa farmer who heard a voice and built a baseball diamond in his cornfield.", quote: "If you build it, he will come.", athleticism: 55, clutch: 70, leadership: 72, heart: 95, skill: 60, intimidation: 35, teamwork: 82, charisma: 85 },
  { name: "Reggie Dunlop", movie: "Slap Shot", movieYear: 1977, sport: "Hockey", actor: "Paul Newman", archetype: "veteran", bio: "Aging player-coach of a failing minor league hockey team who turns them into brawling entertainers.", quote: "I'm putting on the old foil tonight.", athleticism: 60, clutch: 78, leadership: 85, heart: 75, skill: 72, intimidation: 68, teamwork: 80, charisma: 95 },
  { name: "Patches O'Houlihan", movie: "Dodgeball", movieYear: 2004, sport: "Dodgeball", actor: "Rip Torn", archetype: "veteran", bio: "Legendary dodgeball champion turned wheelchair-bound coach with unorthodox training methods.", quote: "If you can dodge a wrench, you can dodge a ball.", athleticism: 25, clutch: 85, leadership: 88, heart: 72, skill: 92, intimidation: 78, teamwork: 75, charisma: 90 },
  { name: "Chubbs Peterson", movie: "Happy Gilmore", movieYear: 1996, sport: "Golf", actor: "Carl Weathers", archetype: "veteran", bio: "Former golf pro whose career was cut short by an alligator, now mentoring Happy.", quote: "It's all in the hips.", athleticism: 45, clutch: 78, leadership: 82, heart: 85, skill: 88, intimidation: 50, teamwork: 80, charisma: 85 },

  // VILLAINS (Round 5 picks - antagonists)
  { name: "Ivan Drago", movie: "Rocky IV", movieYear: 1985, sport: "Boxing", actor: "Dolph Lundgren", archetype: "villain", bio: "Soviet super-soldier engineered to be the perfect fighting machine.", quote: "I must break you.", athleticism: 99, clutch: 75, leadership: 35, heart: 40, skill: 82, intimidation: 99, teamwork: 25, charisma: 78 },
  { name: "Shooter McGavin", movie: "Happy Gilmore", movieYear: 1996, sport: "Golf", actor: "Christopher McDonald", archetype: "villain", bio: "Arrogant, slimy golf pro who will do anything to win the tour championship.", quote: "I eat pieces of s*** like you for breakfast.", athleticism: 65, clutch: 72, leadership: 40, heart: 35, skill: 88, intimidation: 75, teamwork: 20, charisma: 90 },
  { name: "Clubber Lang", movie: "Rocky III", movieYear: 1982, sport: "Boxing", actor: "Mr. T", archetype: "villain", bio: "Brutal, hungry challenger who demolished Rocky and exposed his comfortable lifestyle.", quote: "I pity the fool!", athleticism: 95, clutch: 80, leadership: 45, heart: 55, skill: 85, intimidation: 98, teamwork: 25, charisma: 88 },
  { name: "White Goodman", movie: "Dodgeball", movieYear: 2004, sport: "Dodgeball", actor: "Ben Stiller", archetype: "villain", bio: "Narcissistic fitness guru who wants to crush the competition -- and a small gym -- with his corporate machine.", quote: "Nobody makes me bleed my own blood. Nobody!", athleticism: 78, clutch: 55, leadership: 60, heart: 30, skill: 72, intimidation: 65, teamwork: 35, charisma: 75 },
  { name: "Judge Smails", movie: "Caddyshack", movieYear: 1980, sport: "Golf", actor: "Ted Knight", archetype: "villain", bio: "Pompous country club judge who embodies everything wrong with elitist golf culture.", quote: "Well, the world needs ditch diggers, too.", athleticism: 35, clutch: 50, leadership: 55, heart: 25, skill: 60, intimidation: 72, teamwork: 30, charisma: 68 },
  { name: "Johnny Lawrence", movie: "The Karate Kid", movieYear: 1984, sport: "Martial Arts", actor: "William Zabka", archetype: "villain", bio: "Cobra Kai golden boy trained to show no mercy on or off the mat.", quote: "Get him a body bag!", athleticism: 85, clutch: 70, leadership: 55, heart: 45, skill: 82, intimidation: 88, teamwork: 40, charisma: 72 },
  { name: "Rachel Phelps", movie: "Major League", movieYear: 1989, sport: "Baseball", actor: "Margaret Whitton", archetype: "villain", bio: "Team owner who assembled the worst possible roster hoping the Indians would lose enough to relocate.", quote: "This is only the beginning.", athleticism: 20, clutch: 45, leadership: 50, heart: 15, skill: 40, intimidation: 82, teamwork: 15, charisma: 65 },
  { name: "Jean Girard", movie: "Talladega Nights", movieYear: 2006, sport: "Racing", actor: "Sacha Baron Cohen", archetype: "villain", bio: "French Formula One champion who came to NASCAR to prove his superiority.", quote: "I am the best there is, plain and simple.", athleticism: 80, clutch: 78, leadership: 45, heart: 50, skill: 92, intimidation: 70, teamwork: 30, charisma: 85 },

  // TEAMMATES (Round 6 picks - supporting cast)
  { name: "Julius Campbell", movie: "Remember the Titans", movieYear: 2000, sport: "Football", actor: "Wood Harris", archetype: "teammate", bio: "Star linebacker who broke down racial barriers by embracing his teammates as brothers.", quote: "I'm Julius.", athleticism: 88, clutch: 78, leadership: 82, heart: 88, skill: 85, intimidation: 80, teamwork: 95, charisma: 75 },
  { name: "Gerry Bertier", movie: "Remember the Titans", movieYear: 2000, sport: "Football", actor: "Ryan Hurst", archetype: "teammate", bio: "Team captain who overcame his own prejudice and became the heart of a united team.", quote: "I don't wear his number for me; I wear it for my brother.", athleticism: 82, clutch: 85, leadership: 88, heart: 95, skill: 80, intimidation: 72, teamwork: 98, charisma: 78 },
  { name: "Charlie Conway", movie: "The Mighty Ducks", movieYear: 1992, sport: "Hockey", actor: "Joshua Jackson", archetype: "teammate", bio: "Heart-and-soul center of the Ducks who kept the team together when it mattered most.", quote: "Quack... quack... quack.", athleticism: 75, clutch: 82, leadership: 80, heart: 90, skill: 78, intimidation: 50, teamwork: 95, charisma: 72 },
  { name: "Pedro Cerrano", movie: "Major League", movieYear: 1989, sport: "Baseball", actor: "Dennis Haysbert", archetype: "teammate", bio: "Cuban slugger who could crush fastballs but needed spiritual help with curveballs.", quote: "I am pissed off now, Jobu.", athleticism: 85, clutch: 70, leadership: 55, heart: 72, skill: 78, intimidation: 75, teamwork: 68, charisma: 82 },
  { name: "Timo Cruz", movie: "Coach Carter", movieYear: 2005, sport: "Basketball", actor: "Rick Gonzalez", archetype: "teammate", bio: "Street-hardened player who transformed from team cancer to its emotional backbone.", quote: "Our deepest fear is not that we are inadequate. Our deepest fear is that we are powerful beyond measure.", athleticism: 82, clutch: 80, leadership: 72, heart: 92, skill: 78, intimidation: 75, teamwork: 85, charisma: 78 },
  { name: "Mike Eruzione", movie: "Miracle", movieYear: 2004, sport: "Hockey", actor: "Patrick O'Brien Demsey", archetype: "teammate", bio: "Team captain of the 1980 U.S. Olympic hockey team who scored the game-winning goal against the Soviets.", quote: "I play for the United States of America!", athleticism: 78, clutch: 95, leadership: 85, heart: 92, skill: 80, intimidation: 55, teamwork: 95, charisma: 82 },
  { name: "Danny Bateman", movie: "The Replacements", movieYear: 2000, sport: "Football", actor: "Jon Favreau", archetype: "teammate", bio: "Unhinged SWAT cop turned linebacker who brought military intensity to a replacement squad.", quote: "I know this much -- winners always want the ball when the game is on the line.", athleticism: 85, clutch: 78, leadership: 60, heart: 80, skill: 72, intimidation: 90, teamwork: 75, charisma: 70 },
  { name: "Sunshine Bass", movie: "Remember the Titans", movieYear: 2000, sport: "Football", actor: "Kip Pardue", archetype: "teammate", bio: "California quarterback who brought unity to the Titans with talent and open-mindedness.", quote: "I just like to play football.", athleticism: 80, clutch: 82, leadership: 75, heart: 85, skill: 88, intimidation: 45, teamwork: 92, charisma: 80 },

  // WILDCARDS (Round 7 picks - unpredictable)
  { name: "Ricky Bobby", movie: "Talladega Nights", movieYear: 2006, sport: "Racing", actor: "Will Ferrell", archetype: "wildcard", bio: "NASCAR legend who lived by one rule: if you ain't first, you're last.", quote: "I wanna go fast!", athleticism: 75, clutch: 72, leadership: 55, heart: 65, skill: 78, intimidation: 60, teamwork: 45, charisma: 98 },
  { name: "Ty Webb", movie: "Caddyshack", movieYear: 1980, sport: "Golf", actor: "Chevy Chase", archetype: "wildcard", bio: "Wealthy, zen-like golfer who plays for the pure joy of it -- and never keeps score.", quote: "Be the ball.", athleticism: 60, clutch: 85, leadership: 45, heart: 70, skill: 90, intimidation: 35, teamwork: 55, charisma: 95 },
  { name: "Carl Spackler", movie: "Caddyshack", movieYear: 1980, sport: "Golf", actor: "Bill Murray", archetype: "wildcard", bio: "Deranged groundskeeper locked in an epic war with a gopher -- and reality.", quote: "Cinderella story, out of nowhere...", athleticism: 50, clutch: 65, leadership: 30, heart: 75, skill: 45, intimidation: 55, teamwork: 35, charisma: 99 },
  { name: "Billy Hoyle", movie: "White Men Can't Jump", movieYear: 1992, sport: "Basketball", actor: "Woody Harrelson", archetype: "wildcard", bio: "Streetball hustler who uses his unassuming appearance to con players out of their money.", quote: "You can put a cat in an oven, but that don't make it a biscuit.", athleticism: 78, clutch: 82, leadership: 55, heart: 70, skill: 85, intimidation: 45, teamwork: 65, charisma: 88 },
  { name: "Sidney Deane", movie: "White Men Can't Jump", movieYear: 1992, sport: "Basketball", actor: "Wesley Snipes", archetype: "wildcard", bio: "Trash-talking streetball legend who teams up with an unlikely partner for one big score.", quote: "You got any money?", athleticism: 90, clutch: 80, leadership: 65, heart: 72, skill: 88, intimidation: 70, teamwork: 72, charisma: 92 },
  { name: "Nuke LaLoosh", movie: "Bull Durham", movieYear: 1988, sport: "Baseball", actor: "Tim Robbins", archetype: "wildcard", bio: "Wild young pitcher with a rocket arm and the brain of a peanut.", quote: "I love winning. You know what I'm saying? It's like better than losing.", athleticism: 88, clutch: 55, leadership: 35, heart: 60, skill: 72, intimidation: 65, teamwork: 50, charisma: 78 },
  { name: "Ham Porter", movie: "The Sandlot", movieYear: 1993, sport: "Baseball", actor: "Patrick Renna", archetype: "wildcard", bio: "Loudmouthed catcher who never met a trash-talk he couldn't deliver.", quote: "You're killing me, Smalls!", athleticism: 55, clutch: 68, leadership: 50, heart: 75, skill: 62, intimidation: 65, teamwork: 80, charisma: 95 },
  { name: "Willie Beamen", movie: "Any Given Sunday", movieYear: 1999, sport: "Football", actor: "Jamie Foxx", archetype: "wildcard", bio: "Third-string QB who got his shot and let the spotlight go straight to his head.", quote: "I am the man.", athleticism: 92, clutch: 78, leadership: 45, heart: 55, skill: 85, intimidation: 68, teamwork: 40, charisma: 90 },
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

    const existingAthletes = await db.select().from(movieAthletes).limit(1);
    if (existingAthletes.length === 0) {
      console.log("Seeding movie athletes...");
      await db.insert(movieAthletes).values(sampleMovieAthletes);
      console.log(`Seeded ${sampleMovieAthletes.length} movie athletes`);
    } else {
      console.log("Movie athletes already exist, skipping seed");
    }

    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
