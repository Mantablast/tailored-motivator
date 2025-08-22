const QUOTE_TOPICS = [
  "Self Esteem","Finance","Self Love","Biblical","Courage","Hope","Self Worth","Gratitude","Manifestation","Perseverance","Fitness"
];

// Map each topic to a local JSON file you'll create in /quotes
// Each file is an array of items: { text: string, author: string }
const TOPIC_FILES = {
  "Self Esteem": "quotes/self-esteem.json",
  "Finance": "quotes/finance.json",
  "Self Love": "quotes/self-love.json",
  "Biblical": "quotes/biblical-kjv.json", // Prefer KJV verses for PD safety
  "Courage": "quotes/courage.json",
  "Hope": "quotes/hope.json",
  "Self Worth": "quotes/self-worth.json",
  "Gratitude": "quotes/gratitude.json",
  "Manifestation": "quotes/manifestation.json",
  "Perseverance": "quotes/perseverance.json",
  "Fitness": "quotes/fitness.json"
};

// Optional: exclude politicians entirely
const EXCLUDE_AUTHORS = new Set([
  // Examples: add/remove to taste
  'Abraham Lincoln','Winston Churchill','Franklin D. Roosevelt','Theodore Roosevelt','Nelson Mandela','Mahatma Gandhi','Margaret Thatcher','Barack Obama','Ronald Reagan','Julius Caesar'
]);

// Fallback (small) in case JSON files missing; uses non-political or anonymous lines
const FALLBACK_QUOTES = [
  { text: "Begin where you are. Use what you have. Do what you can.", author: "Arthur Ashe", topics:["Perseverance"] },
  { text: "Act as if what you do makes a difference. It does.", author: "William James", topics:["Self Worth","Self Esteem"] },
  { text: "A gentle answer turneth away wrath.", author: "Proverbs 15:1 (KJV)", topics:["Biblical","Self Control"] },
  { text: "The more we value the things outside our control, the less control we have.", author: "Epictetus (tr. Long)", topics:["Courage","Perseverance"] },
  { text: "Gratitude is riches.", author: "Doris Day", topics:["Gratitude"] },
];
