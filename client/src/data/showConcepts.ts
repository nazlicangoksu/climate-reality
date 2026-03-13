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
    id: 'save-my-island',
    number: '001',
    title: 'Is This a Good Business?',
    tagline: 'Ten million dollars. One real problem killing a real place. Six strangers. One of them wins.',
    logline:
      'A legendary islander investor puts up $10 million to back one idea that solves the biggest problem facing his home island. Not a concept. A place. The money is real. The problem is real.',
    narrative: [
      'Six contestants are brought in to compete. They did not apply for a climate show. They applied for a $10 million business competition set on one of the most dramatic locations on earth.',
      "The challenges aren't about saving the planet. They're about building something people will actually pay for.",
      'Each episode, the teams pitch, test, and iterate on solutions to the specific problem of that island: a desalination system that a local cooperative can actually maintain, a heat-resilient crop that survives on thirty percent less water, a parametric insurance product that pays out before the damage happens instead of fighting you afterward.',
      'Between challenges, the investor checks in with each contestant one-on-one. Not a boardroom. A walk through the village, a conversation on the dock. He asks the questions a local would ask: who did you talk to today? What did they tell you that you didn\'t expect? These check-ins are where the real story lives. Some contestants crumble. Others reveal something they\'ve been holding back.',
      'The investor evaluates on one criterion: will this still be working in twenty years without him?',
      "The climate context is never explained to the audience. It emerges through the problems. By episode three, viewers understand why the aquifer matters -- not because anyone lectured them, but because they watched a team's entire business model collapse when the numbers didn't work.",
    ],
    castExamples: [
      {
        label: 'Oil field engineer, West Texas',
        description: 'Knows more about water scarcity than most scientists. Underestimated by everyone.',
      },
      {
        label: 'Wall Street risk analyst',
        description: 'Prices climate risk for a living. Does not consider herself an environmentalist.',
      },
      {
        label: 'Grain farmer, Midwest. 4th generation',
        description: "Watched 30% of her topsoil disappear. Furious in ways that don't map to any political category.",
      },
    ],
    mechanics: [
      {
        title: 'The Investor',
        body: "He isn't a tech bro or a billionaire with a foundation. He's someone who grew up here, who knows what the water table looked like thirty years ago, who has cousins who still fish these waters.",
      },
      {
        title: 'The On-Ramp',
        body: 'Each episode surfaces one real problem from a real place. The contestants are trying to find problems to solve and people to collaborate with to build businesses. Some take a "savior" approach and fail. Others build really good connections but no ideas.',
      },
      {
        title: 'The Signal',
        body: 'Viewers tune in for personalities and prize money. They absorb the reality of climate challenges that an island faces, from sargassum overload to extreme heat.',
      },
    ],
    closingQuote:
      "By episode three, viewers understand aquifer depletion -- not because anyone lectured them, but because they watched a team's entire business model collapse when the numbers didn't work.",
    discussionQuestions: [
      'Who is the right investor figure? What does getting that casting wrong look like?',
      'If you had a magic wand and could change one thing about this show, what would it be?',
      'What other shows can be designed on islands affected by climate without saying climate?',
    ],
  },
  {
    id: 'the-paradise',
    number: '002',
    title: 'The Paradise',
    tagline: 'Twelve strangers. One paradise. Then the storm comes. And you have a choice.',
    logline:
      'A luxury social experiment on a real island. Twelve strangers, cast for friction, with prize money on the line. Then the storm hits. It was always going to.',
    narrative: [
      'ACT ONE: A luxury social experiment. Real resort, real location -- the Maldives, a Pacific island that makes the news every hurricane season. Twelve strangers, cast for friction, with prize money on the line. Weekly challenges, alliances forming, couples pairing off, petty drama. New romance blooms. Exactly what they applied for.',
      'ACT TWO: The storm hits. It was always going to. The production team offers a choice: we can move everyone to another island, or you can stay. Some leave. Some stay. Part of the challenge is being ok with leaving someone behind that you have a love interest in. Both choices are valid. That tension is the show.',
      'THE CRITICAL DESIGN RULE: The community is already responding before the contestants decide anything. They have a plan, a structure, people who know what to do. The contestants who stay are not leading. They are asking where to show up or what to do.',
      'Some show up as pure "muscle" moving debris. Others try to help negotiate aid packages but fail. Some get backlash trying to be the "savior." At least two or three contestants must be from the Global South -- people who recognize the power dynamic immediately and name it. The discomfort that creates within the group is more interesting than any climate lecture.',
    ],
    castExamples: [
      {
        label: 'The Influencer',
        description: '8M followers, mostly travel. Built her brand on places like this. Stays, documents everything, and the community asks her to stop filming twice.',
      },
      {
        label: 'Appalachian Kentucky',
        description: "Skeptical of everyone. Leaves -- and the show doesn't frame this as cowardice.",
      },
      {
        label: 'Contestant from a flood-prone community',
        description: 'Becomes the de facto translator between the group and the community -- not because she was assigned to, but because she just starts doing it.',
      },
      {
        label: 'The dive instructor (local cast)',
        description: 'Has watched this reef for 30 years. Not a plot device. Probably the most formidable person there.',
      },
      {
        label: 'The nonprofit founder',
        description: "Runs a clean water org. Has been to twelve countries on 'impact trips.' Genuinely believes she's different from the influencer. The community sees them as the same person.",
      },
      {
        label: 'The tech guy with a climate fund',
        description: 'Raised $40M for climate solutions from his living room. Has never been in a storm. Stays, and immediately starts treating the situation like a pitch deck. The local dive instructor ignores him entirely.',
      },
    ],
    mechanics: [
      {
        title: 'Not a savior show',
        body: "The contestants staying doesn't fix the seawall that failed because the government diverted the funding. The show is honest that twelve strangers for two weeks doesn't fix any of that.",
      },
      {
        title: 'The real villain',
        body: "Not the storm. The insurance company that won't pay out. The international aid that arrives three weeks late. The contestants staying is a small human story inside a much larger structural failure.",
      },
      {
        title: 'The Global North / South tension',
        body: 'Characters from the island become even bigger cast than the original cast. They push back. Things fail.',
      },
    ],
    closingQuote: 'Who gets to decide what happens next to a place the whole world helped break?',
    discussionQuestions: [
      'How do we make the stay/leave choice feel real and not manufactured?',
      'If you had a magic wand and could change one thing about this show, what would it be?',
      'What other show ideas can be developed around sudden climate disasters?',
    ],
  },
  {
    id: 'the-race',
    number: '003',
    title: 'The Race',
    tagline: 'The celebrity is not the host. They are a contestant. And they are probably going to lose.',
    logline:
      'Six pairs. Six locations chosen because something real is happening there. The celebrity\'s job is to convince their partner to care about climate. The partner\'s job is to win.',
    narrative: [
      'Six pairs. Six locations chosen because something real is happening there -- the Colorado River delta, the Louisiana coast, the Australian outback in fire season. The prize is $500,000 to the winning pair.',
      "But every pair, win or lose, directs $100,000 to a local organization in the last place they raced through. The celebrity doesn't choose where the money goes. Their partner does. Whatever they've learned together, their partner gets to decide what it's worth.",
    ],
    castExamples: [
      {
        label: 'The true believer + the skeptic',
        description: 'Celebrity environmentalist meets retired oil roughneck. Both have watched the same thing disappear. Different vocabulary.',
      },
      {
        label: 'The performer + the pragmatist',
        description: "Activist celebrity paired with a farmer who's been adapting to weather chaos for a decade without calling it anything.",
      },
      {
        label: 'The scientist-adjacent + the operator',
        description: 'The one who has done the reading meets the contractor who builds in flood zones.',
      },
    ],
    mechanics: [
      {
        title: 'The reach mechanism',
        body: "Fans of the celebrity show up. They meet the partner. They watch someone they trusted get humbled. No lecture required. That's the conversion mechanism -- and it works because it's never announced as one.",
      },
      {
        title: 'The competence flip',
        body: "The NASCAR driver's understanding of airflow matters in a wind corridor challenge. The linebacker reading a defense maps onto supply chain logistics. The celebrity's twenty years of research is useful in three legs and wrong in two others.",
      },
      {
        title: 'The prize structure',
        body: "The $100,000 the partner directs isn't a charity moment tacked on at the end. It's what the whole race was building toward. The celebrity, who came in thinking they knew more, watches their partner make a decision they couldn't have made in episode one.",
      },
    ],
    closingQuote: "One person is trying to win a race. The other is trying to change a mind. Neither knows which one they are.",
    discussionQuestions: [
      'What would make the "convincing" more difficult and sticky to watch?',
      'If you had a magic wand and could change one thing about this show, what would it be?',
      'What other show ideas can be developed by leveraging celebrities and creating new climate heroes?',
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
