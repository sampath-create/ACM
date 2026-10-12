// 3 Distinct Sets of Question Trials for Round 1 (Door 1, Door 2, Door 3)

export const QUESTION_SETS = [
  {
    id: 'set-1',
    name: 'The Classic Vault Ciphers',
    doors: [
      {
        id: 'q1-1',
        title: '2 Eggs & 100 Floors',
        shortTitle: '2 Eggs & 100 Floors',
        bodyText: [
          'You are given a building with 100 floors and 2 identical enchanted eggs.',
          'There is an unknown floor F such that:',
          '• If an egg is dropped from floor F or any floor above it, the egg breaks.',
          '• If an egg is dropped from any floor below F, it does not break.',
          '• Once an egg breaks, you cannot use it again; if it survives, you can reuse it.',
          '• You must determine the highest floor from which an egg can be dropped without breaking.'
        ],
        taskQuestion: 'What is the minimum number of drops required in the worst case?',
        correctAnswer: '14',
        explanation: 'Minimum drops required in the worst case is 14 (using drops at 14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100).',
        errorFeedback: 'Incorrect! Balance the worst-case drops: n + (n-1) + ... + 1 ≥ 100. Solve for n.',
        hints: 'Solve n(n+1)/2 ≥ 100 for the smallest positive integer n.'
      },
      {
        id: 'q1-2',
        title: '1,000 Bottles of Wine & Poison',
        shortTitle: '1,000 Bottles',
        bodyText: [
          'You are given 1,000 bottles of wine, exactly one of which is laced with deadly poison.',
          'You have a group of test subjects. The poison takes effect exactly 24 hours after consumption.',
          'You only have 24 hours to conduct the trial (meaning you can only run a single round of simultaneous tests).',
          'A test subject can sip from any combination of bottles mixed together.'
        ],
        taskQuestion: 'What is the minimum number of test subjects needed to identify the exact poisoned bottle?',
        correctAnswer: '10',
        explanation: '10 test subjects are required because each subject represents 1 binary bit and 2¹⁰ = 1024 ≥ 1000.',
        errorFeedback: 'Incorrect! Think in binary bits: each subject represents 1 bit (drank vs did not drink).',
        hints: 'Find the smallest integer n such that 2ⁿ ≥ 1000.'
      },
      {
        id: 'q1-3',
        title: '5 Rational Pirates & 100 Gold Coins',
        shortTitle: '5 Pirates & 100 Coins',
        bodyText: [
          '5 strictly rational, greedy, and bloodthirsty pirates (ranked 1 to 5) must divide 100 gold coins.',
          'The most senior pirate (Captain 1) proposes a split. All remaining pirates vote.',
          'If at least 50% vote YES (including the proposer), the coins are distributed as proposed.',
          'If fewer than 50% vote YES, the proposer is thrown overboard to the sharks, and Pirate 2 proposes next.',
          'Pirates value: (1) Survival, (2) Maximizing gold, (3) Seeing rivals thrown overboard in ties.'
        ],
        taskQuestion: 'How many gold coins can the fiercest pirate (Captain 1) keep for himself?',
        correctAnswer: '98',
        explanation: 'By backward induction, Captain 1 keeps 98 coins and offers 1 coin each to Pirates 3 and 5 (Distribution: 98, 0, 1, 0, 1), securing a 3/5 majority!',
        errorFeedback: 'Incorrect! Work backward from 2 surviving pirates up to 5 to find how many coins you must offer.',
        hints: 'Captain 1 only needs 2 other votes out of 5 to reach a majority of 3.'
      }
    ]
  },
  {
    id: 'set-2',
    name: "The Navigator's Logic Trials",
    doors: [
      {
        id: 'q2-1',
        title: '4 Pirates & 1 Lantern Bridge Crossing',
        shortTitle: '4 Pirates & 1 Lantern',
        bodyText: [
          '4 pirates must cross a fragile rope bridge in the pitch black of night.',
          'They only have 1 oil lantern. The bridge can only hold at most 2 pirates at the same time.',
          'Any crossing (single or pair) requires carrying the lantern. When two cross together, they move at the slower pirate’s pace.',
          'Individual crossing speeds: Pirate A takes 1 min, Pirate B takes 2 mins, Pirate C takes 7 mins, and Pirate D takes 10 mins.'
        ],
        taskQuestion: 'What is the absolute minimum total time (in minutes) for all 4 pirates to reach the other side?',
        correctAnswer: '17',
        explanation: '17 minutes! (A&B cross in 2, A returns in 1, C&D cross in 10, B returns in 2, A&B cross in 2: 2 + 1 + 10 + 2 + 2 = 17).',
        errorFeedback: 'Incorrect! Pair the two slowest pirates (7 and 10) together so their travel times overlap!',
        hints: 'Send A and B first, return with A. Then send C and D together, return with B.'
      },
      {
        id: 'q2-2',
        title: '27 Gold Doubloons & The Counterfeit Coin',
        shortTitle: '27 Gold Doubloons',
        bodyText: [
          'A pirate hoard contains 27 golden doubloons that look completely identical.',
          'However, exactly 1 doubloon is counterfeit and slightly LIGHTER than the genuine coins (all genuine coins have the exact same weight).',
          'You are equipped with a mechanical balance scale with two weighing pans.',
          'You can place any number of coins on each side in a single weighing.'
        ],
        taskQuestion: 'What is the minimum number of weighings in the worst case required to guarantee finding the counterfeit coin?',
        correctAnswer: '3',
        explanation: 'Exactly 3 weighings! Using a 3-way split (9-9-9, then 3-3-3, then 1-1-1), 3³ = 27 coins are resolved.',
        errorFeedback: 'Incorrect! A balance scale has 3 possible outcomes per test (left tilt, right tilt, balanced). Think in powers of 3!',
        hints: 'Divide coins into 3 equal groups of 9 for the first weighing.'
      },
      {
        id: 'q2-3',
        title: 'The Enchanted Water Lily of Siren Bay',
        shortTitle: 'Enchanted Water Lily',
        bodyText: [
          'In a hidden pirate bay, an enchanted water lily doubles in surface area every single day.',
          'Left unchecked, the lily grows exponentially until it completely covers the entire bay surface.',
          'It takes exactly 48 days for the single lily to cover 100% of the bay.',
          'The pirate captain needs to anchor when the lagoon is half-covered (50% coverage).'
        ],
        taskQuestion: 'On which day was exactly 50% (half) of the pirate bay covered by the lily?',
        correctAnswer: '47',
        explanation: 'Day 47! Because the lily doubles every day, the day before full coverage (day 48) it was at exactly 50%!',
        errorFeedback: 'Incorrect! Do not divide 48 by 2! Remember that the surface area DOUBLES every single day.',
        hints: 'If it is 100% on day 48, what was its size just one day earlier?'
      }
    ]
  },
  {
    id: 'set-3',
    name: 'The Aztec Temple Mysteries',
    doors: [
      {
        id: 'q3-1',
        title: 'The Golden Scarab & The 30-Foot Well',
        shortTitle: 'Golden Scarab & Well',
        bodyText: [
          'A sacred golden scarab falls into a dark stone well that is exactly 30 feet deep.',
          'Each day during sunlight, the scarab climbs up exactly 3 feet.',
          'Each night while sleeping, the scarab slides back down 2 feet.',
          'Once the scarab reaches the top rim of the well (30 feet), it immediately climbs out into freedom.'
        ],
        taskQuestion: 'On which day will the golden scarab reach the top and escape the well?',
        correctAnswer: '28',
        explanation: 'Day 28! By the end of day 27 it has gained 27 feet. On day 28 it climbs 3 feet, reaching 30 feet and escaping before nightfall!',
        errorFeedback: 'Incorrect! Be careful: once it reaches 30 feet during the daytime, it climbs out before it can slide down at night!',
        hints: 'Calculate its height at the end of night 27, then add the next day’s 3 feet.'
      },
      {
        id: 'q3-2',
        title: 'The Master Gunner’s Cannonball Pyramid',
        shortTitle: 'Cannonball Pyramid',
        bodyText: [
          'The ship’s gunner stacks heavy iron cannonballs into a square-base pyramid with 4 horizontal layers.',
          'The top layer has 1 cannonball (1×1).',
          'The second layer has 4 cannonballs (2×2).',
          'The third layer has 9 cannonballs (3×3).',
          'The bottom base layer has 16 cannonballs (4×4).'
        ],
        taskQuestion: 'What is the total number of cannonballs in this 4-layer pyramid?',
        correctAnswer: '30',
        explanation: '30 cannonballs! Sum of squares: 1² + 2² + 3² + 4² = 1 + 4 + 9 + 16 = 30.',
        errorFeedback: 'Incorrect! Sum the squares of layers 1 through 4: 1 + 4 + 9 + 16.',
        hints: '1 + 4 = 5; 5 + 9 = 14; 14 + 16 = ?'
      },
      {
        id: 'q3-3',
        title: 'The 100 Treasure Chests & The 100 Pirates',
        shortTitle: '100 Chests & Pirates',
        bodyText: [
          'There are 100 closed treasure chests numbered 1 to 100 along the temple corridor.',
          '100 pirates walk past them in order:',
          '• Pirate 1 flips the lock on every chest (opening all 100).',
          '• Pirate 2 flips the lock on every 2nd chest (closing 2, 4, 6, ...).',
          '• Pirate k flips the lock on every k-th chest (if open, closes it; if closed, opens it).',
          'A chest only remains open if it has an odd number of factors (i.e., perfect square numbers).'
        ],
        taskQuestion: 'After all 100 pirates have walked past, how many treasure chests will remain OPEN?',
        correctAnswer: '10',
        explanation: 'Exactly 10 chests remain open! Only perfect squares (1, 4, 9, 16, 25, 36, 49, 64, 81, 100) have an odd number of divisors.',
        errorFeedback: 'Incorrect! Count the number of perfect squares between 1 and 100 (1², 2², ..., 10²).',
        hints: 'The open chests are 1², 2², 3², ... up to 10².'
      }
    ]
  }
];

// Fisher-Yates shuffle
export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Generate a randomized set configured for Door 1, Door 2, and Door 3
export function getRandomQuestionSet(shuffleDoors = true) {
  const setIndex = Math.floor(Math.random() * QUESTION_SETS.length);
  const chosenSet = QUESTION_SETS[setIndex];

  let rawDoors = [...chosenSet.doors];
  if (shuffleDoors) {
    rawDoors = shuffleArray(rawDoors);
  }

  const doorMeta = [
    {
      doorKey: 'door1',
      headerIcon: '🔥',
      headerTitle: 'DOOR 1: THE CRIMSON RUNES',
      tag: 'TRIAL 01',
      questionNum: 'Question 1',
      themeClass: '',
      accentColor: '#ff4d4d',
      successTransition: 'Door 2 is unlocked!'
    },
    {
      doorKey: 'door2',
      headerIcon: '🗝️',
      headerTitle: 'DOOR 2: THE ANCIENT TRIAL',
      tag: 'TRIAL 02',
      questionNum: 'Question 2',
      themeClass: 'gold-theme',
      accentColor: '#ffd24c',
      successTransition: 'Door 3 is unlocked!'
    },
    {
      doorKey: 'door3',
      headerIcon: '⚡',
      headerTitle: 'DOOR 3: THE AZURE CIPHER',
      tag: 'TRIAL 03',
      questionNum: 'Question 3',
      themeClass: 'azure-theme',
      accentColor: '#5ce1e6',
      successTransition: 'Advancing directly to Round 2...'
    }
  ];

  const doors = rawDoors.map((item, idx) => {
    const meta = doorMeta[idx];
    return {
      ...item,
      ...meta,
      successFeedback: `Correct! ${item.explanation} ${meta.successTransition}`
    };
  });

  return {
    id: chosenSet.id,
    name: chosenSet.name,
    setIndex: setIndex + 1,
    doors
  };
}
