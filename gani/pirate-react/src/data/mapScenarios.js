// 3 Distinct Archipelago Treaty Scenarios for Round 3 (34-Region Map Coloring)

export const MAP_SCENARIOS = [
  {
    id: 'map-1',
    name: 'The Blank Chart of the High Seas',
    setIndex: 1,
    description: 'All 34 territories start uncharted. Full tactical freedom to partition the entire archipelago from a clean slate!',
    initialColors: {},
  },
  {
    id: 'map-2',
    name: 'The Four-Faction Armistice',
    setIndex: 2,
    description: '4 historic coastal strongholds have already hoisted their faction flags. Balance all remaining 30 territories around these legendary anchors!',
    initialColors: {
      t1: 'crimson',
      t6: 'sapphire',
      t20: 'emerald',
      t34: 'gold',
    },
  },
  {
    id: 'map-3',
    name: "The Corsair Strongholds Treaty",
    setIndex: 3,
    description: 'Strategic outposts across the archipelago are held by rival pirate barons. Claim and color the surrounding waters without igniting border disputes!',
    initialColors: {
      t4: 'gold',
      t16: 'sapphire',
      t25: 'crimson',
      t30: 'emerald',
    },
  },
];

export function getRandomMapScenario() {
  const idx = Math.floor(Math.random() * MAP_SCENARIOS.length);
  return MAP_SCENARIOS[idx];
}
