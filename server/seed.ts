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
  // CAPTAINS - Leaders and coaches with high leadership
  { name: "Herman Boone", movie: "Remember the Titans", movieYear: 2000, sport: "Football", actor: "Denzel Washington", archetype: "captain", bio: "99 Leadership for integrating T.C. Williams; Unity for turning racial tension into a championship brotherhood.", quote: "I don't care if you like each other or not. But you will respect each other.", athleticism: 42, clutch: 88, leadership: 99, heart: 92, skill: 85, intimidation: 94, teamwork: 95, charisma: 82, wildcardName: "Unity", wildcardCategory: "Social", wildcardValue: 99 },
  { name: "Coach Norman Dale", movie: "Hoosiers", movieYear: 1986, sport: "Basketball", actor: "Gene Hackman", archetype: "captain", bio: "Low charisma (68) due to initial town friction; Fundamentals (96) for the 'four passes before a shot' discipline.", quote: "I love you guys.", athleticism: 35, clutch: 92, leadership: 94, heart: 88, skill: 90, intimidation: 75, teamwork: 98, charisma: 68, wildcardName: "Fundamentals", wildcardCategory: "Technical", wildcardValue: 96 },
  { name: "Ken Carter", movie: "Coach Carter", movieYear: 2005, sport: "Basketball", actor: "Samuel L. Jackson", archetype: "captain", bio: "The Contract represents his uncompromising stance on academic accountability over basketball.", quote: "Our deepest fear is not that we are inadequate.", athleticism: 40, clutch: 85, leadership: 97, heart: 91, skill: 84, intimidation: 92, teamwork: 90, charisma: 88, wildcardName: "The Contract", wildcardCategory: "Social", wildcardValue: 98 },
  { name: "Tony D'Amato", movie: "Any Given Sunday", movieYear: 1999, sport: "Football", actor: "Al Pacino", archetype: "captain", bio: "96 Charisma for his legendary oratory; 'Inch by Inch' reflects the most electric pregame speech in sports film history.", quote: "The inches we need are everywhere around us.", athleticism: 32, clutch: 90, leadership: 95, heart: 85, skill: 88, intimidation: 78, teamwork: 72, charisma: 96, wildcardName: "Inch by Inch", wildcardCategory: "Social", wildcardValue: 99 },
  { name: "Herb Brooks", movie: "Miracle", movieYear: 2004, sport: "Hockey", actor: "Kurt Russell", archetype: "captain", bio: "99 Teamwork for the 'Herbies' drills that built the Miracle team; Conditioning for 'The legs feed the wolf'.", quote: "Great moments are born from great opportunity.", athleticism: 38, clutch: 95, leadership: 98, heart: 96, skill: 94, intimidation: 88, teamwork: 99, charisma: 74, wildcardName: "Conditioning", wildcardCategory: "Physical", wildcardValue: 97 },
  { name: "Jimmy Dugan", movie: "A League of Their Own", movieYear: 1992, sport: "Baseball", actor: "Tom Hanks", archetype: "captain", bio: "High skill (92) as a former star; 'No Crying' for his blunt, tough-love management of the Peaches.", quote: "There's no crying in baseball!", athleticism: 30, clutch: 82, leadership: 85, heart: 78, skill: 92, intimidation: 88, teamwork: 75, charisma: 90, wildcardName: "No Crying", wildcardCategory: "Social", wildcardValue: 95 },
  { name: "Gordon Bombay", movie: "The Mighty Ducks", movieYear: 1992, sport: "Hockey", actor: "Emilio Estevez", archetype: "captain", bio: "Reflects his journey from selfish lawyer to Ducks mentor; Triple Axel for his unique figure-skating-to-hockey skill set.", quote: "Ducks fly together.", athleticism: 55, clutch: 88, leadership: 92, heart: 82, skill: 85, intimidation: 65, teamwork: 94, charisma: 84, wildcardName: "Triple Axel", wildcardCategory: "Technical", wildcardValue: 90 },
  { name: "Mickey Goldmill", movie: "Rocky", movieYear: 1976, sport: "Boxing", actor: "Burgess Meredith", archetype: "captain", bio: "25 Athleticism due to age; Old School Grit for chasing chickens and the 'staying in the basement' philosophy.", quote: "You're gonna eat lightnin' and you're gonna crap thunder!", athleticism: 25, clutch: 85, leadership: 96, heart: 94, skill: 90, intimidation: 92, teamwork: 70, charisma: 82, wildcardName: "Old School Grit", wildcardCategory: "Mental", wildcardValue: 98 },

  // NATURALS - Pure athletic talent
  { name: "Roy Hobbs", movie: "The Natural", movieYear: 1984, sport: "Baseball", actor: "Robert Redford", archetype: "natural", bio: "99 Skill and Clutch; Wonderboy for the literal 'lightning-struck' magic of his bat and home runs.", quote: "I coulda been better. I coulda broke every record in the book.", athleticism: 88, clutch: 99, leadership: 75, heart: 95, skill: 99, intimidation: 85, teamwork: 80, charisma: 92, wildcardName: "Wonderboy", wildcardCategory: "Intangible", wildcardValue: 99 },
  { name: "Apollo Creed", movie: "Rocky", movieYear: 1976, sport: "Boxing", actor: "Carl Weathers", archetype: "natural", bio: "99 Charisma for his Ali-inspired persona; Showmanship for his flamboyant, larger-than-life ring entrances.", quote: "I want you to promise me you're gonna stop this fight.", athleticism: 94, clutch: 88, leadership: 85, heart: 92, skill: 96, intimidation: 82, teamwork: 65, charisma: 99, wildcardName: "Showmanship", wildcardCategory: "Social", wildcardValue: 98 },
  { name: "Willie Mays Hayes", movie: "Major League", movieYear: 1989, sport: "Baseball", actor: "Wesley Snipes", archetype: "natural", bio: "98 Athleticism for elite speed; Base Thief for his 'hit like Mays, run like Hayes' specialty.", quote: "I hit like Mays, and I run like Hayes.", athleticism: 98, clutch: 72, leadership: 62, heart: 68, skill: 75, intimidation: 45, teamwork: 78, charisma: 94, wildcardName: "Base Thief", wildcardCategory: "Technical", wildcardValue: 97 },
  { name: "Bobby Boucher", movie: "The Waterboy", movieYear: 1998, sport: "Football", actor: "Adam Sandler", archetype: "natural", bio: "40 Skill due to poor technique; Water Boy Rage for his record 16 sacks fueled by 'visualizing and attacking'.", quote: "My Mama says that alligators are ornery because they got all them teeth and no toothbrush.", athleticism: 82, clutch: 90, leadership: 45, heart: 95, skill: 40, intimidation: 99, teamwork: 60, charisma: 85, wildcardName: "Water Boy Rage", wildcardCategory: "Mental", wildcardValue: 99 },
  { name: "Ricky Vaughn", movie: "Major League", movieYear: 1989, sport: "Baseball", actor: "Charlie Sheen", archetype: "natural", bio: "Low skill (65) for poor control; Wild Thing for the 100mph fastball once he got his glasses.", quote: "Just a bit outside.", athleticism: 92, clutch: 88, leadership: 52, heart: 82, skill: 65, intimidation: 94, teamwork: 62, charisma: 95, wildcardName: "Wild Thing", wildcardCategory: "Technical", wildcardValue: 98 },
  { name: "Michael Jordan", movie: "Space Jam", movieYear: 1996, sport: "Basketball", actor: "Michael Jordan", archetype: "natural", bio: "The ultimate athlete; Toon Physics for the half-court stretch dunk to defeat the Monstars.", quote: "Larry, I'm going to play basketball again.", athleticism: 99, clutch: 99, leadership: 94, heart: 96, skill: 99, intimidation: 92, teamwork: 88, charisma: 99, wildcardName: "Toon Physics", wildcardCategory: "Intangible", wildcardValue: 99 },
  { name: "Dottie Hinson", movie: "A League of Their Own", movieYear: 1992, sport: "Baseball", actor: "Geena Davis", archetype: "natural", bio: "98 Skill as the league's best; The Split Catch for her iconic flexibility and defensive dominance.", quote: "It's supposed to be hard. If it wasn't hard, everyone would do it.", athleticism: 85, clutch: 95, leadership: 96, heart: 90, skill: 98, intimidation: 75, teamwork: 92, charisma: 92, wildcardName: "The Split Catch", wildcardCategory: "Technical", wildcardValue: 97 },
  { name: "Adonis Creed", movie: "Creed", movieYear: 2015, sport: "Boxing", actor: "Michael B. Jordan", archetype: "natural", bio: "High athleticism and heart; Legacy for fighting to prove he wasn't a mistake and carving his own name.", quote: "I gotta prove it.", athleticism: 92, clutch: 90, leadership: 82, heart: 95, skill: 88, intimidation: 84, teamwork: 78, charisma: 88, wildcardName: "Legacy", wildcardCategory: "Intangible", wildcardValue: 95 },

  // UNDERDOGS - Heart over talent
  { name: "Rocky Balboa", movie: "Rocky", movieYear: 1976, sport: "Boxing", actor: "Sylvester Stallone", archetype: "underdog", bio: "99 Heart for never quitting; Iron Chin for absorbing elite punishment from Creed and Drago and staying up.", quote: "Yo, Adrian! I did it!", athleticism: 72, clutch: 94, leadership: 58, heart: 99, skill: 62, intimidation: 55, teamwork: 68, charisma: 85, wildcardName: "Iron Chin", wildcardCategory: "Physical", wildcardValue: 97 },
  { name: "Rudy Ruettiger", movie: "Rudy", movieYear: 1993, sport: "Football", actor: "Sean Astin", archetype: "underdog", bio: "Low athleticism (45) and skill (35); Inspiration for the walk-on effort that got him carried off the field.", quote: "Having a dream is what makes life tolerable.", athleticism: 45, clutch: 72, leadership: 65, heart: 99, skill: 35, intimidation: 40, teamwork: 92, charisma: 88, wildcardName: "Inspiration", wildcardCategory: "Social", wildcardValue: 99 },
  { name: "Happy Gilmore", movie: "Happy Gilmore", movieYear: 1996, sport: "Golf", actor: "Adam Sandler", archetype: "underdog", bio: "52 Skill for his 'graceless' form; Monster Drive for the 400-yard hockey-style slap shot drive.", quote: "The price is wrong, Bobby.", athleticism: 78, clutch: 82, leadership: 28, heart: 88, skill: 52, intimidation: 72, teamwork: 35, charisma: 92, wildcardName: "Monster Drive", wildcardCategory: "Technical", wildcardValue: 99 },
  { name: "Shane Falco", movie: "The Replacements", movieYear: 2000, sport: "Football", actor: "Keanu Reeves", archetype: "underdog", bio: "Reflects his comeback; Footsteps represents his ability to finally tune out past failure and lead the replacements.", quote: "Pain heals. Chicks dig scars. Glory lasts forever.", athleticism: 84, clutch: 95, leadership: 88, heart: 92, skill: 82, intimidation: 65, teamwork: 94, charisma: 82, wildcardName: "Footsteps", wildcardCategory: "Mental", wildcardValue: 85 },
  { name: "Daniel LaRusso", movie: "The Karate Kid", movieYear: 1984, sport: "Martial Arts", actor: "Ralph Macchio", archetype: "underdog", bio: "96 Heart for fighting through injury; Crane Kick for the 'if do right, no can defense' finishing move.", quote: "Wax on, wax off.", athleticism: 70, clutch: 95, leadership: 62, heart: 96, skill: 82, intimidation: 55, teamwork: 75, charisma: 82, wildcardName: "Crane Kick", wildcardCategory: "Technical", wildcardValue: 98 },
  { name: "Peter La Fleur", movie: "Dodgeball", movieYear: 2004, sport: "Dodgeball", actor: "Vince Vaughn", archetype: "underdog", bio: "High teamwork for the gym's bond; Average Joe for his relatable, underdog charisma that rallies the misfits.", quote: "Nobody makes me bleed my own blood.", athleticism: 72, clutch: 90, leadership: 85, heart: 82, skill: 75, intimidation: 55, teamwork: 92, charisma: 88, wildcardName: "Average Joe", wildcardCategory: "Social", wildcardValue: 94 },
  { name: "Jimmy Chitwood", movie: "Hoosiers", movieYear: 1986, sport: "Basketball", actor: "Maris Valainis", archetype: "underdog", bio: "99 Clutch; Pure Stroke for the 'I'll make it' moment that won the state championship.", quote: "I'll make it.", athleticism: 78, clutch: 99, leadership: 65, heart: 85, skill: 98, intimidation: 72, teamwork: 82, charisma: 70, wildcardName: "Pure Stroke", wildcardCategory: "Technical", wildcardValue: 99 },
  { name: "Benny Rodriguez", movie: "The Sandlot", movieYear: 1993, sport: "Baseball", actor: "Mike Vitar", archetype: "underdog", bio: "96 Leadership for the Sandlot crew; 'The Beast' for his mental toughness to pickle the legendary dog.", quote: "Heroes get remembered, but legends never die.", athleticism: 95, clutch: 94, leadership: 96, heart: 92, skill: 92, intimidation: 72, teamwork: 95, charisma: 90, wildcardName: "The Beast", wildcardCategory: "Mental", wildcardValue: 96 },
  { name: "Paul Crewe", movie: "The Longest Yard", movieYear: 2005, sport: "Football", actor: "Adam Sandler", archetype: "underdog", bio: "95 Charisma; Convict Leader for his ability to turn hardened inmates into a cohesive football unit.", quote: "It's not whether you win or lose, it's whether you win!", athleticism: 88, clutch: 92, leadership: 94, heart: 85, skill: 92, intimidation: 82, teamwork: 88, charisma: 95, wildcardName: "Convict Leader", wildcardCategory: "Social", wildcardValue: 96 },
  { name: "Roy McAvoy", movie: "Tin Cup", movieYear: 1996, sport: "Golf", actor: "Kevin Costner", archetype: "underdog", bio: "99 Skill but 55 Clutch; 'Go For It' for his pathological refusal to lay up, even if it costs him the Open.", quote: "When a defining moment comes along, you define the moment... or the moment defines you.", athleticism: 72, clutch: 55, leadership: 45, heart: 85, skill: 99, intimidation: 62, teamwork: 40, charisma: 88, wildcardName: "Go For It", wildcardCategory: "Mental", wildcardValue: 98 },

  // VETERANS - Experience and wisdom
  { name: "Crash Davis", movie: "Bull Durham", movieYear: 1988, sport: "Baseball", actor: "Kevin Costner", archetype: "veteran", bio: "95 Skill; Baseball Wisdom for mentoring 'Nuke' and his deep adoration/knowledge of the game.", quote: "I believe in the soul, the small of a woman's back, the hanging curveball.", athleticism: 62, clutch: 85, leadership: 98, heart: 88, skill: 95, intimidation: 78, teamwork: 92, charisma: 85, wildcardName: "Baseball Wisdom", wildcardCategory: "Mental", wildcardValue: 99 },
  { name: "Jake Taylor", movie: "Major League", movieYear: 1989, sport: "Baseball", actor: "Tom Berenger", archetype: "veteran", bio: "High leadership/teamwork for the 1989 Indians; The Bunt for his game-winning sacrifice to beat the Yankees.", quote: "In case you haven't noticed, the Indians have managed to win a few games.", athleticism: 55, clutch: 88, leadership: 99, heart: 90, skill: 82, intimidation: 72, teamwork: 96, charisma: 85, wildcardName: "The Bunt", wildcardCategory: "Technical", wildcardValue: 94 },
  { name: "Mr. Miyagi", movie: "The Karate Kid", movieYear: 1984, sport: "Martial Arts", actor: "Pat Morita", archetype: "veteran", bio: "99 Skill; Wax On Wax Off for his unorthodox but effective legendary training methods.", quote: "Wax on, wax off.", athleticism: 52, clutch: 85, leadership: 92, heart: 90, skill: 99, intimidation: 68, teamwork: 88, charisma: 85, wildcardName: "Wax On Wax Off", wildcardCategory: "Technical", wildcardValue: 99 },
  { name: "Billy Beane", movie: "Moneyball", movieYear: 2011, sport: "Baseball", actor: "Brad Pitt", archetype: "veteran", bio: "88 Skill (front office); Moneyball for his revolutionary use of analytics to find value others ignored.", quote: "How can you not be romantic about baseball?", athleticism: 45, clutch: 65, leadership: 92, heart: 82, skill: 88, intimidation: 78, teamwork: 85, charisma: 82, wildcardName: "Moneyball", wildcardCategory: "Technical", wildcardValue: 98 },
  { name: "Ray Kinsella", movie: "Field of Dreams", movieYear: 1989, sport: "Baseball", actor: "Kevin Costner", archetype: "veteran", bio: "95 Heart for building the field; The Whisper for his connection to the baseball beyond.", quote: "If you build it, he will come.", athleticism: 50, clutch: 82, leadership: 65, heart: 95, skill: 45, intimidation: 35, teamwork: 70, charisma: 88, wildcardName: "The Whisper", wildcardCategory: "Intangible", wildcardValue: 99 },
  { name: "Reggie Dunlop", movie: "Slap Shot", movieYear: 1977, sport: "Hockey", actor: "Paul Newman", archetype: "veteran", bio: "94 Intimidation; Old Time Hockey for his passionate, rugged on-ice leadership and brawling style.", quote: "I'm putting on the old foil tonight.", athleticism: 65, clutch: 85, leadership: 96, heart: 92, skill: 88, intimidation: 94, teamwork: 82, charisma: 92, wildcardName: "Old Time Hockey", wildcardCategory: "Social", wildcardValue: 97 },
  { name: "Patches O'Houlihan", movie: "Dodgeball", movieYear: 2004, sport: "Dodgeball", actor: "Rip Torn", archetype: "veteran", bio: "99 Intimidation; Wrench Drill for 'If you can dodge a wrench, you can dodge a ball'.", quote: "If you can dodge a wrench, you can dodge a ball.", athleticism: 30, clutch: 85, leadership: 88, heart: 82, skill: 95, intimidation: 99, teamwork: 65, charisma: 84, wildcardName: "Wrench Drill", wildcardCategory: "Technical", wildcardValue: 98 },
  { name: "Chubbs Peterson", movie: "Happy Gilmore", movieYear: 1996, sport: "Golf", actor: "Carl Weathers", archetype: "veteran", bio: "98 Skill as a former pro; 'It's All in the Hips' for the fundamental secret to Happy's success.", quote: "It's all in the hips.", athleticism: 45, clutch: 82, leadership: 92, heart: 85, skill: 98, intimidation: 62, teamwork: 88, charisma: 95, wildcardName: "It's All in the Hips", wildcardCategory: "Technical", wildcardValue: 96 },

  // VILLAINS - Antagonists
  { name: "Ivan Drago", movie: "Rocky IV", movieYear: 1985, sport: "Boxing", actor: "Dolph Lundgren", archetype: "villain", bio: "99 Athleticism/Intimidation; Terminator for his cold, steroid-enhanced machine-like perfection.", quote: "I must break you.", athleticism: 99, clutch: 70, leadership: 32, heart: 38, skill: 85, intimidation: 99, teamwork: 25, charisma: 72, wildcardName: "Terminator", wildcardCategory: "Physical", wildcardValue: 98 },
  { name: "Shooter McGavin", movie: "Happy Gilmore", movieYear: 1996, sport: "Golf", actor: "Christopher McDonald", archetype: "villain", bio: "95 Skill but 30 Teamwork; Mind Games for his sneering arrogance and efforts to gatekeep the sport.", quote: "I eat pieces of s*** like you for breakfast.", athleticism: 72, clutch: 82, leadership: 55, heart: 42, skill: 95, intimidation: 85, teamwork: 30, charisma: 68, wildcardName: "Mind Games", wildcardCategory: "Mental", wildcardValue: 96 },
  { name: "Clubber Lang", movie: "Rocky III", movieYear: 1982, sport: "Boxing", actor: "Mr. T", archetype: "villain", bio: "99 Intimidation; 'Prediction: Pain' for his raw, hungry ferocity that exposed a 'civilized' Rocky.", quote: "I pity the fool!", athleticism: 94, clutch: 75, leadership: 42, heart: 65, skill: 82, intimidation: 99, teamwork: 35, charisma: 85, wildcardName: "Prediction: Pain", wildcardCategory: "Mental", wildcardValue: 97 },
  { name: "White Goodman", movie: "Dodgeball", movieYear: 2004, sport: "Dodgeball", actor: "Ben Stiller", archetype: "villain", bio: "High charisma/athleticism; Narcissism for his blinding self-obsession and psychological warfare.", quote: "Nobody makes me bleed my own blood. Nobody!", athleticism: 85, clutch: 78, leadership: 65, heart: 35, skill: 82, intimidation: 88, teamwork: 40, charisma: 92, wildcardName: "Narcissism", wildcardCategory: "Mental", wildcardValue: 95 },
  { name: "Judge Smails", movie: "Caddyshack", movieYear: 1980, sport: "Golf", actor: "Ted Knight", archetype: "villain", bio: "Low heart/teamwork; 'The Law' for his abuse of authority and country club status to bully opponents.", quote: "Well, the world needs ditch diggers, too.", athleticism: 35, clutch: 42, leadership: 45, heart: 30, skill: 75, intimidation: 82, teamwork: 25, charisma: 55, wildcardName: "The Law", wildcardCategory: "Social", wildcardValue: 90 },
  { name: "Johnny Lawrence", movie: "The Karate Kid", movieYear: 1984, sport: "Martial Arts", actor: "William Zabka", archetype: "villain", bio: "94 Intimidation; 'No Mercy' for the Cobra Kai strike-first philosophy.", quote: "Get him a body bag!", athleticism: 88, clutch: 85, leadership: 75, heart: 82, skill: 92, intimidation: 94, teamwork: 62, charisma: 85, wildcardName: "No Mercy", wildcardCategory: "Mental", wildcardValue: 96 },
  { name: "Rachel Phelps", movie: "Major League", movieYear: 1989, sport: "Baseball", actor: "Margaret Whitton", archetype: "villain", bio: "15 Teamwork for trying to make her team lose; 'The Villain' for her ruthless ownership to move the team.", quote: "This is only the beginning.", athleticism: 32, clutch: 65, leadership: 25, heart: 35, skill: 78, intimidation: 92, teamwork: 15, charisma: 40, wildcardName: "The Villain", wildcardCategory: "Social", wildcardValue: 94 },
  { name: "Jean Girard", movie: "Talladega Nights", movieYear: 2006, sport: "Racing", actor: "Sacha Baron Cohen", archetype: "villain", bio: "99 Skill for his F1 background; 'Crepes' for his sophisticated, mocking psychological dominance over Ricky Bobby.", quote: "I am the best there is, plain and simple.", athleticism: 95, clutch: 88, leadership: 68, heart: 82, skill: 99, intimidation: 92, teamwork: 52, charisma: 94, wildcardName: "Crepes", wildcardCategory: "Social", wildcardValue: 92 },

  // TEAMMATES - Supporting cast with high teamwork
  { name: "Julius Campbell", movie: "Remember the Titans", movieYear: 2000, sport: "Football", actor: "Wood Harris", archetype: "teammate", bio: "99 Teamwork for the Left Side/Strong Side bond with Bertier.", quote: "I'm Julius.", athleticism: 94, clutch: 88, leadership: 96, heart: 92, skill: 85, intimidation: 92, teamwork: 99, charisma: 88, wildcardName: "Strong Side", wildcardCategory: "Social", wildcardValue: 98 },
  { name: "Gerry Bertier", movie: "Remember the Titans", movieYear: 2000, sport: "Football", actor: "Ryan Hurst", archetype: "teammate", bio: "99 Heart/Leadership for leading the defense through racial barriers.", quote: "I don't wear his number for me; I wear it for my brother.", athleticism: 95, clutch: 90, leadership: 98, heart: 99, skill: 88, intimidation: 94, teamwork: 99, charisma: 90, wildcardName: "Left Side", wildcardCategory: "Social", wildcardValue: 98 },
  { name: "Charlie Conway", movie: "The Mighty Ducks", movieYear: 1992, sport: "Hockey", actor: "Joshua Jackson", archetype: "teammate", bio: "98 Leadership/99 Teamwork; The Triple Deke for his evolution into the ultimate Ducks leader.", quote: "Quack... quack... quack.", athleticism: 72, clutch: 94, leadership: 98, heart: 92, skill: 82, intimidation: 55, teamwork: 99, charisma: 90, wildcardName: "The Triple Deke", wildcardCategory: "Technical", wildcardValue: 95 },
  { name: "Pedro Cerrano", movie: "Major League", movieYear: 1989, sport: "Baseball", actor: "Dennis Haysbert", archetype: "teammate", bio: "94 Intimidation; Jobu for his reliance on his shrine to help him hit the curveball.", quote: "I am pissed off now, Jobu.", athleticism: 88, clutch: 82, leadership: 65, heart: 85, skill: 82, intimidation: 94, teamwork: 75, charisma: 85, wildcardName: "Jobu", wildcardCategory: "Intangible", wildcardValue: 99 },
  { name: "Timo Cruz", movie: "Coach Carter", movieYear: 2005, sport: "Basketball", actor: "Rick Gonzalez", archetype: "teammate", bio: "92 Heart; 'Our Deepest Fear' for his transformative growth and recital of the iconic poem.", quote: "Our deepest fear is not that we are inadequate.", athleticism: 85, clutch: 88, leadership: 72, heart: 92, skill: 82, intimidation: 85, teamwork: 85, charisma: 82, wildcardName: "Our Deepest Fear", wildcardCategory: "Mental", wildcardValue: 94 },
  { name: "Mike Eruzione", movie: "Miracle", movieYear: 2004, sport: "Hockey", actor: "Patrick O'Brien Demsey", archetype: "teammate", bio: "99 Clutch for the goal vs USSR; The Captain for being the soul of the 1980 Olympic team.", quote: "I play for the United States of America!", athleticism: 78, clutch: 99, leadership: 98, heart: 96, skill: 82, intimidation: 65, teamwork: 99, charisma: 88, wildcardName: "The Captain", wildcardCategory: "Social", wildcardValue: 97 },
  { name: "Danny Bateman", movie: "The Replacements", movieYear: 2000, sport: "Football", actor: "Jon Favreau", archetype: "teammate", bio: "99 Intimidation/95 Heart; 'The Red Dot' for his psychotic, unhinged game-day intensity.", quote: "I know this much -- winners always want the ball when the game is on the line.", athleticism: 85, clutch: 82, leadership: 60, heart: 95, skill: 78, intimidation: 99, teamwork: 75, charisma: 72, wildcardName: "The Red Dot", wildcardCategory: "Mental", wildcardValue: 98 },
  { name: "Sunshine Bass", movie: "Remember the Titans", movieYear: 2000, sport: "Football", actor: "Kip Pardue", archetype: "teammate", bio: "95 Teamwork/Charisma; Calm for his Zen-like ability to step in and execute the Titans' offense.", quote: "I just like to play football.", athleticism: 88, clutch: 88, leadership: 72, heart: 82, skill: 92, intimidation: 55, teamwork: 95, charisma: 95, wildcardName: "Calm", wildcardCategory: "Mental", wildcardValue: 90 },

  // WILDCARDS - Unpredictable players
  { name: "Ricky Bobby", movie: "Talladega Nights", movieYear: 2006, sport: "Racing", actor: "Will Ferrell", archetype: "wildcard", bio: "99 Charisma; Shake & Bake for his signature drafting/passing move with Cal Naughton Jr.", quote: "I wanna go fast!", athleticism: 92, clutch: 92, leadership: 72, heart: 85, skill: 94, intimidation: 82, teamwork: 65, charisma: 99, wildcardName: "Shake & Bake", wildcardCategory: "Technical", wildcardValue: 98 },
  { name: "Ty Webb", movie: "Caddyshack", movieYear: 1980, sport: "Golf", actor: "Chevy Chase", archetype: "wildcard", bio: "99 Skill/Charisma; 'Be The Ball' for his effortless, Zen-like mastery of golf without keeping score.", quote: "Be the ball.", athleticism: 75, clutch: 92, leadership: 55, heart: 62, skill: 99, intimidation: 55, teamwork: 42, charisma: 99, wildcardName: "Be The Ball", wildcardCategory: "Mental", wildcardValue: 99 },
  { name: "Carl Spackler", movie: "Caddyshack", movieYear: 1980, sport: "Golf", actor: "Bill Murray", archetype: "wildcard", bio: "95 Charisma; Gopher Vendetta for his all-consuming, destructive obsession with the gopher.", quote: "Cinderella story, out of nowhere...", athleticism: 45, clutch: 38, leadership: 15, heart: 65, skill: 42, intimidation: 25, teamwork: 20, charisma: 95, wildcardName: "Gopher Vendetta", wildcardCategory: "Mental", wildcardValue: 99 },
  { name: "Billy Hoyle", movie: "White Men Can't Jump", movieYear: 1992, sport: "Basketball", actor: "Woody Harrelson", archetype: "wildcard", bio: "96 Skill; The Hustle for his ability to look like a chump to draw bets before dominating.", quote: "You can put a cat in an oven, but that don't make it a biscuit.", athleticism: 82, clutch: 92, leadership: 62, heart: 88, skill: 96, intimidation: 75, teamwork: 78, charisma: 85, wildcardName: "The Hustle", wildcardCategory: "Social", wildcardValue: 97 },
  { name: "Sidney Deane", movie: "White Men Can't Jump", movieYear: 1992, sport: "Basketball", actor: "Wesley Snipes", archetype: "wildcard", bio: "96 Charisma; Trash Talk for his elite psychological warfare on the court.", quote: "You got any money?", athleticism: 88, clutch: 88, leadership: 85, heart: 82, skill: 92, intimidation: 88, teamwork: 82, charisma: 96, wildcardName: "Trash Talk", wildcardCategory: "Social", wildcardValue: 98 },
  { name: "Nuke LaLoosh", movie: "Bull Durham", movieYear: 1988, sport: "Baseball", actor: "Tim Robbins", archetype: "wildcard", bio: "99 Athleticism for his million-dollar arm; 'Meat' for having elite power but a 'five-cent head'.", quote: "I love winning. You know what I'm saying?", athleticism: 99, clutch: 72, leadership: 42, heart: 65, skill: 85, intimidation: 88, teamwork: 52, charisma: 88, wildcardName: "Meat", wildcardCategory: "Physical", wildcardValue: 97 },
  { name: "Ham Porter", movie: "The Sandlot", movieYear: 1993, sport: "Baseball", actor: "Patrick Renna", archetype: "wildcard", bio: "99 Charisma; 'The Great Hambino' for his iconic insults and 'You're killing me Smalls' personality.", quote: "You're killing me, Smalls!", athleticism: 65, clutch: 88, leadership: 72, heart: 85, skill: 82, intimidation: 55, teamwork: 94, charisma: 99, wildcardName: "The Great Hambino", wildcardCategory: "Social", wildcardValue: 96 },
  { name: "Willie Beamen", movie: "Any Given Sunday", movieYear: 1999, sport: "Football", actor: "Jamie Foxx", archetype: "wildcard", bio: "96 Charisma; 'Steamin' for his rapid rise to celebrity and flashy, playmaking dual-threat talent.", quote: "I am the man.", athleticism: 94, clutch: 92, leadership: 72, heart: 85, skill: 88, intimidation: 82, teamwork: 45, charisma: 96, wildcardName: "Steamin'", wildcardCategory: "Social", wildcardValue: 97 },
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
