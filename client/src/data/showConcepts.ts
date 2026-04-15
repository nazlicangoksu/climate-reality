export interface ShowConcept {
  id: string;
  number: string;
  title: string;
  tagline: string;
  logline: string;
  narrative: string[];
  castExamples: { label: string; description: string }[];
  mechanics: { title: string; body: string }[];
  closingQuote: string;
  discussionQuestions: string[];
  videoUrl?: string;
}

export interface DesignPrinciple {
  number: string;
  title: string;
  body: string;
}

export interface BrainstormPrompt {
  section: string;
  rule: string;
  questions: { label: string; hint: string }[];
}

export const hero = {
  supertitle: 'Stanford Graduate School of Business',
  title: 'Climate &\nReality TV',
  subtitle: 'Building a climate reality TV show without saying climate. Plot twist: it is real.',
  authors: 'Daniel Etzioni & Nazlican Goksu',
  course: 'GEN 390 Independent Research Study · 2026',
};

export const designPrinciples: DesignPrinciple[] = [
  {
    number: '01',
    title: 'Reach the non-climate audience',
    body: "Don't lead with climate. Don't preach to the choir. The viewer who has never watched a climate documentary is our audience.",
  },
  {
    number: '02',
    title: 'Change the narrative',
    body: 'No doom. Complex people in real conditions.',
  },
  {
    number: '03',
    title: 'Diversify the heroes',
    body: 'The oil worker can be right. The scientist can be wrong.',
  },
  {
    number: '04',
    title: 'Build the on-ramp',
    body: 'Every viewer should feel like they could be in this show.',
  },
];

export const showConcepts: ShowConcept[] = [
  {
    id: 'is-this-a-good-business',
    number: '001',
    title: 'Is This a Good Business?',
    tagline: 'Ten million dollars. One island. Find the business nobody else can see.',
    logline:
      'Ten entrepreneurs are chosen to go on an island with no pitch, no plan, and no idea what they are looking for. A local investor puts up $10 million for whoever builds the best business. The only rule: it has to come from the island and help the island.',
    narrative: [
      'No pitch decks. No business plans. Ten entrepreneurs show up and are told: find a problem worth solving. Talk to people. Walk around. Your idea has to come from here.',
      'The investor grew up on this island. He knows what the water table looked like thirty years ago. He has one criterion: will this still work in twenty years without him?',
      'A contestant talks to fishermen. The catch dropped forty percent in a decade. She builds an aquaculture business. Another notices the wells running dry and designs a desalination system a local co-op can maintain. Someone else sees the same houses flooding every storm season and creates parametric insurance that pays out before the damage hits.',
      'The entrepreneurs who impose solutions from the outside fail. The ones who listen to the community build businesses that work. Nobody says "climate." The island says it for them.',
    ],
    castExamples: [
      {
        label: 'Rosa, oil field engineer, West Texas',
        description: 'Knows more about water scarcity than most scientists. Everything she knows about extraction turns out to be expertise in conservation. Underestimated by everyone until episode four.',
      },
      {
        label: 'James, Wall Street risk analyst',
        description: 'Prices catastrophic risk for hedge funds. Not an environmentalist. Arrives with a fintech pitch. By episode three he is building parametric insurance for fishing villages because the math is better.',
      },
      {
        label: 'Diana, grain farmer, Midwest, 4th generation',
        description: 'Watched thirty percent of her topsoil disappear. The investor asks: "Who told you the soil was broken?" She says: "Nobody had to tell me. I watched it happen."',
      },
    ],
    mechanics: [
      {
        title: 'The island is the pitch',
        body: 'No one arrives with an idea. The island is the brief. The contestants who talk to locals find opportunities everywhere. The ones who sit in their rooms thinking get nothing.',
      },
      {
        title: 'The investor walks, not talks',
        body: 'No boardroom. No panel. Walks through the village, conversations on the dock, dinners with families. He asks: who did you talk to today? What surprised you? The contestants who only talk to each other lose.',
      },
      {
        title: 'The jury',
        body: 'A rotating panel of people who\'ve actually built businesses in places like this. Emerging economy operators, island-born entrepreneurs, people who know what works when supply chains are thin, infrastructure is fragile, and the weather is the biggest variable. They pressure-test every idea. Can you source this locally? What happens when the port closes for a week? Who runs this after you leave? The jury doesn\'t judge ambition. They judge whether the idea survives reality.',
      },
      {
        title: 'Competency porn',
        body: 'The show makes it cool to understand how an aquifer works, why parametric insurance beats traditional, how a desalination membrane functions. Chef\'s Table for climate solutions. The audience feels smarter, not lectured.',
      },
    ],
    closingQuote:
      'The best business on the island is the one the island needed all along.',
    discussionQuestions: [
      'Who is the right investor figure? What does getting that casting wrong look like?',
      'If you had a magic wand and could change one thing about this show, what would it be?',
      'What happens when a contestant builds something the community actually wants versus what they think the community needs?',
    ],
  },
  {
    id: 'one-last-thing',
    number: '002',
    title: 'One Last Thing',
    tagline: 'The last thing you learn about someone used to be the first thing.',
    logline:
      'When you meet someone, the first thing you ask is what they do. And the people you date almost always share your politics. You don\'t even think about it. You just end up with people who see the world the way you do. Here, that\'s the last thing.',
    narrative: [
      'Twelve singles move into a house. They date. They flirt. They do challenges. They form love triangles. They break hearts. All the usual mess.',
      'Two rules: you cannot talk about politics, and you cannot talk about what you do for a living. You can talk about your family, your childhood, your dreams, your fears, what makes you laugh, what keeps you up at night. Everything that actually makes someone fall in love. Just not the two things that would make them judge you before they got the chance.',
      'When a couple commits, they sit down together. One last thing. "I\'m a Republican. I work on an oil rig." "I don\'t vote. I\'m a fishing guide." "I\'m a Democrat. I work for the EPA." "I voted for Trump twice. I\'m a rancher." "I\'ve never voted. I install solar panels." "I\'m a Democrat. I\'m a conservation biologist." Whatever it is, it all comes out at once.',
      'Then they go live in each other\'s worlds. His hometown. Her hometown. His friends. Her family. His Sunday morning. Her Tuesday night. That\'s where the show actually starts.',
    ],
    castExamples: [
      {
        label: 'The Ducks Unlimited member',
        description: 'Spent twenty years restoring wetlands but would never call himself a climate activist. Paired with the conservation biologist who\'d never set foot in a hunting lodge. He takes her to the marsh at dawn and she realizes he knows more about that ecosystem than anyone in her office. She takes him to a conference and he realizes half the room is talking about the same land he\'s been protecting his whole life.',
      },
      {
        label: 'The rancher',
        description: 'Manages water because she has to. Paired with the guy who campaigns for water rights from an office she\'d never visit.',
      },
      {
        label: 'The firefighter',
        description: 'Been fighting longer seasons every year. Paired with the woman who\'s never seen a wildfire but has strong opinions about them.',
      },
      {
        label: 'The cop and the public defender',
        description: 'Not every couple is about climate. Some are about justice, immigration, guns. Every couple is two people who care deeply about the same thing from completely different worlds.',
      },
    ],
    mechanics: [
      {
        title: 'The two rules',
        body: 'No politics. No jobs. These are the first two things you normally learn about someone. Here, they\'re the last. Everything in between is just two people figuring out if they actually like each other.',
      },
      {
        title: 'The reveal',
        body: 'When a couple commits, they sit down and say one last thing. Politics and job, all at once. No moderator. No debate stage. Just two people who are already falling for each other, hearing the thing they were never allowed to ask.',
      },
      {
        title: 'Living in each other\'s worlds',
        body: 'After the reveal, each couple goes and lives in each other\'s actual lives. His week, her week. The drama is all post-reveal. Moving in together. Meeting families. Going to each other\'s workplaces. Nobody explains anything. They just live each other\'s lives.',
      },
    ],
    closingQuote:
      'The last thing you learn about someone used to be the first thing. When you flip the order, everything feels different.',
    discussionQuestions: [
      'How do you cast regular people whose lives tell the climate story without them being "climate people"?',
      'If you had a magic wand and could change one thing about this show, what would it be?',
      'What happens at the altar when someone says no? What does that moment tell the audience?',
    ],
  },
];

export const brainstormPrompts: BrainstormPrompt[] = [
  {
    section: 'The Hook',
    rule: "Don't lead with climate. Lead with the thing that makes someone change the channel to watch this instead of anything else on television.",
    questions: [
      { label: 'What is the show actually about?', hint: 'Competition? Status? Money? Survival? Name the human drive, not the issue.' },
      { label: 'What is the one-line pitch to a skeptic?', hint: 'Someone who has never thought about climate once. Why do they watch episode one?' },
      { label: 'What format does it borrow from?', hint: "Every great show is a familiar format with one thing changed. What's the familiar part?" },
    ],
  },
  {
    section: 'The World',
    rule: 'The location is a character. It should be somewhere already changing in ways the audience will feel, even if they don\'t name it.',
    questions: [
      { label: 'Where does it take place?', hint: 'Be specific. A region, a city, an island, a landscape. Generic locations make generic shows.' },
      { label: 'What is the place already losing?', hint: "Water? Land? A way of life? A season? Don't explain it -- just name it." },
      { label: 'Who already lives there?', hint: "And what do they know that the audience doesn't?" },
    ],
  },
  {
    section: 'The Cast',
    rule: 'Cast for maximum friction and minimum predictability. The audience should not be able to predict who they will root for by episode two.',
    questions: [
      { label: 'Who is the person everyone underestimates?', hint: '' },
      { label: 'Who carries the emotional weight?', hint: 'The person viewers follow home in their heads after the episode ends.' },
      { label: 'Who is the audience surrogate?', hint: 'Most like the viewer at home. Asking the same questions the audience is asking.' },
      { label: 'Who is the local with the most to lose?', hint: 'Name them. Give them a job. One specific thing they are trying to protect.' },
    ],
  },
  {
    section: 'The On-Ramp',
    rule: 'Every viewer should feel like they could be in this show -- or do something because of it. Not a donation link. A real action.',
    questions: [
      { label: 'What does a viewer do after watching episode one?', hint: "Be specific. Not 'care more.' A thing they can actually do." },
      { label: "What is the show's relationship to the real world?", hint: 'Does it fund something? Connect to a community? Create a submission pipeline? Name the mechanism.' },
    ],
  },
  {
    section: 'The Hard Questions',
    rule: 'Every show has a version of itself that goes wrong. Name yours before someone else does.',
    questions: [
      { label: 'What is the version that accidentally becomes a savior story or a lecture?', hint: '' },
      { label: 'What is the one casting decision that makes or breaks this concept?', hint: 'The wrong investor. The wrong celebrity. The wrong local character. Name the risk.' },
      { label: 'If this show works perfectly, what does a skeptical viewer do differently one year later?', hint: '' },
    ],
  },
];

export const principlesChecklist = [
  'Reaches the non-climate audience',
  "Doesn't lead with climate",
  'Changes the narrative',
  'Diversifies the heroes',
  'Builds an on-ramp',
  'Someone unexpected could be right',
];
