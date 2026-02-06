import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Film, Trophy, DollarSign, Clapperboard, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const gameModesData = [
  {
    id: "trivia",
    title: "Trivia Quiz",
    description: "Test your movie knowledge with challenging questions across various categories and difficulty levels.",
    icon: Film,
    color: "from-red-500 to-rose-600",
    href: "/trivia",
    stats: "38K+ Questions",
  },
  {
    id: "draft",
    title: "Movie Draft",
    description: "Build your dream team of movie characters! Draft athletes by archetype, then battle it out War-style with weighted stats.",
    icon: Trophy,
    color: "from-amber-500 to-yellow-600",
    href: "/draft",
    stats: "Team Battle",
  },
  {
    id: "boxoffice",
    title: "Box Office Heads Up",
    description: "Which movie had the bigger opening weekend? Test your box office knowledge!",
    icon: DollarSign,
    color: "from-emerald-500 to-green-600",
    href: "/boxoffice",
    stats: "Opening Weekend",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <Clapperboard className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-serif">CineGame</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Movie Gaming Experience
            </span>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6">
            Test Your <span className="text-primary">Movie</span> Knowledge
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three exciting game modes to challenge your inner film buff. From trivia to box office battles, prove you're the ultimate cinephile.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {gameModesData.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <motion.div key={mode.id} variants={cardVariants} className="h-full">
                <Link href={mode.href} className="h-full">
                  <Card
                    className="group cursor-pointer h-full flex flex-col hover-elevate active-elevate-2 overflow-visible transition-all duration-300"
                    data-testid={`card-gamemode-${mode.id}`}
                  >
                    <CardHeader className="pb-4 flex-1">
                      <div className={`w-14 h-14 rounded-md bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                        <IconComponent className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-xl font-serif">{mode.title}</CardTitle>
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
                          {mode.stats}
                        </span>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {mode.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button className="w-full" data-testid={`button-play-${mode.id}`}>
                        <Star className="mr-2 h-4 w-4" />
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-md bg-card border border-card-border">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Thousands of movies</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Track your scores</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">New challenges daily</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
