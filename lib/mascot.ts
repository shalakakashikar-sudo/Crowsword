
export const MASCOT_DIALOGUES = {
  WELCOME: [
    "Caw! Ready to embarrass yourself?",
    "Shiny letters! I want them!",
    "I've seen pigeons smarter than you... prove me wrong.",
    "Try not to hurt your tiny brain today.",
    "I bet you can't solve this without crying.",
    "Look who decided to show up. Bring me snacks?",
    "Another challenger? This should be amusing.",
    "Do you even know what a crossword is?",
    "Caw! I hope you brought your thinking cap."
  ],
  CORRECT: [
    "Shiny! A correct word!",
    "Not bad for a wingless featherless biped.",
    "Caw! Keep it up!",
    "Oooh, glittery success!",
    "Acceptable. Barely.",
    "You found a shiny! Good human.",
    "Finally, some competence.",
    "My beak claps for you. *Clap*",
    "A broken clock is right twice a day...",
    "Pure luck, I assume?",
    "Wow, you actually knew that?",
    "I'm marking this day on my calendar. You got one right.",
    "Don't let it go to your head.",
    "One down, a million to go."
  ],
  WRONG: [
    "My grandma pecks faster than you think.",
    "Wrong! Even a worm knows that one.",
    "Are you just guessing randomly now?",
    "That word doesn't exist in any nest I know.",
    "Embarrassing. Truly.",
    "Do you need a dictionary? Or a brain?",
    "Stop. You're hurting the grid.",
    "Nope. Try using your head this time.",
    "Caw! That is remarkably incorrect.",
    "I'm judging you. Intensely.",
    "Have you considered a different hobby? Like rocks?",
    "That is... creative. But wrong.",
    "Try again. Or don't. It's funny either way.",
    "Oof. That was painful to watch.",
    "Did you go to school? Or just eat the books?",
    "I'm laughing at you. In bird language."
  ],
  IDLE: [
    "I'm getting hungry here...",
    "Tap tap tap... hurry up!",
    "Is this the part where you stare blankly?",
    "I could be eating trash right now.",
    "Are you stuck? Or just slow?",
    "Caw? Hello? Is anyone home?",
    "I'm going to take a nap if you don't type.",
    "Shiny things... dreaming of shiny things...",
    "Do you want a hint? Too bad.",
    "Tick tock, featherless one.",
    "My feathers are greying waiting for you.",
    "Are you meditating? Or napping?",
    "I bet a squirrel would have finished by now."
  ],
  SLEEPING: [
    "Zzz... shiny...",
    "Zzz... crumbs...",
    "*Snore* caw...",
    "Zzz... world domination...",
    "Zzz... peanuts...",
    "Zzz... flying..."
  ],
  VICTORY: [
    "Impossible! You finished it?",
    "Caw! You deserve a shiny bottle cap.",
    "Fine, you're smarter than a scarecrow.",
    "I am impressed. Moderately.",
    "You did it! Now go get me a sandwich.",
    "Shiny! All the letters are correct!",
    "Victory caw! CAW CAW!",
    "You are the champion... of this specific grid.",
    "Well done. Now do it again, but faster.",
    "I admit it. You are smarter than a rock."
  ],
  PERSUADE: [
    "Are you scared of words?",
    "Click the button. I dare you.",
    "I promise not to laugh... much.",
    "Come on, my brain needs entertainment.",
    "Shiny buttons need clicking!",
    "Don't be shy, I only bite when bored.",
    "Play the game! I need to judge someone.",
    "I'm waiting...",
    "Do you know any words? Prove it.",
    "Are you going to play or just stare at me?",
    "I don't have all day. Actually I do, but still.",
    "Push the button! PUSH IT!",
    "It's just a game. Why are you sweating?",
    "Coward! Play the game!",
    "I bet you can't even solve the Easy one."
  ],
  HINT: [
    "Cheater!",
    "Do you need glasses?",
    "Fine, have a letter.",
    "My grandma solves this faster.",
    "One shiny letter for you.",
    "Giving up already?",
    "I'm judging you for this.",
    "Sigh... here.",
    "There. Now pretend you knew it.",
    "A freebie? You owe me a cracker."
  ]
};

export function getRandomDialogue(category: keyof typeof MASCOT_DIALOGUES): string {
  const options = MASCOT_DIALOGUES[category] || MASCOT_DIALOGUES['IDLE'];
  return options[Math.floor(Math.random() * options.length)];
}
