const messages = [
  "Checking if anyone actually reads the terms and conditions...",
  "Feeding the hamsters 🐹 that power our servers...",
  "Brewing fresh hot takes and spicy opinions...",
  "Untangling the internet cables...",
  "Warming up the debate arena...",
  "Polishing our upvote buttons for maximum clickability...",
  "Teaching our servers to count votes without getting political...",
  "Checking if anyone actually reads the terms and conditions...",
  "Collecting brilliant ideas from parallel universes...",
  "Deflating overinflated egos in the comments section...",
  "Loading validation you didn't know you needed...",
  "Calculating how many votes your idea needs to quit your day job...",
  "Getting the vote counters their energy drinks...",
  "Polishing the upvote button for your clicking pleasure...",
  "Calculating your idea's chances of world domination...",
  "Sorting brilliant ideas from shower thoughts... sometimes they're the same!",
  "Checking if your idea will get more votes than that cat video...",
  "Preparing to launch your idea into the Votewise stratosphere..."
];

export function getLoadingMessage() {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}
