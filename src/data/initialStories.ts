import { Story } from '../types';

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'The Celestial Archive of Oakhaven',
    author: 'Elena R. Vance',
    genre: 'Fantasy',
    tone: 'Cinematic',
    length: 'Short',
    language: 'en',
    coverImage: '/src/assets/images/story_celestial_library_1793523868966.jpg',
    imagePrompt: 'A mysterious girl holding a glowing blue lantern discovers a hidden doorway of starlight between ancient towering wooden bookshelves in an infinite arcane library, warm dust motes floating in celestial nebula light, 8k cinematic digital storybook illustration',
    createdAt: '2026-10-31T18:00:00.000Z',
    updatedAt: '2026-11-01T08:30:00.000Z',
    wordCount: 420,
    autoIllustrateEnabled: true,
    illustratedScenes: [
      {
        id: 'scene-1-1',
        sceneNumber: 1,
        title: 'The Starlight Threshold',
        textSnippet: 'Two massive oak uprights bent outward, curving into an archway filled not with stone or mortar, but a breathing vortex of starlight.',
        visualPrompt: 'A 19-year-old girl with dark auburn braided hair, alert hazel eyes, wearing a deep navy wool scholar cloak with silver piping holding a glowing blue lantern discovers a hidden doorway of starlight between ancient wooden bookshelves in an arcane library',
        imageUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
        layout: 'right-wrap',
        size: 'medium',
        style: 'cinematic digital storybook illustration',
        status: 'completed',
      },
    ],
    coverConfig: {
      title: 'The Celestial Archive of Oakhaven',
      subtitle: 'Where Memories of Tomorrow are Kept',
      author: 'Elena R. Vance',
      tagline: 'Some doors open only to starlight.',
      coverStyle: 'Epic Fantasy',
      coverImageUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
      accentColor: '#38bdf8',
      fontFamily: 'Cinzel',
    },
    characters: [
      {
        id: 'char-1',
        name: 'Mara Winter',
        role: 'Protagonist / Junior Archivist',
        age: '19',
        appearance: 'Slender, alert hazel eyes, slight freckling across bridge of nose, determined chin',
        hair: 'Dark auburn hair woven in a neat side braid with brass twine',
        clothing: 'Deep navy wool scholar cloak with silver piping, leather satchel, brass compass pinned to lapel',
        personality: 'Quietly observant, brave, stubborn in pursuit of truth, reverent of ancient texts',
        backstory: 'Orphaned during the Siege of Ash, raised inside the lower stacks of Oakhaven Archive.',
        visualAnchorPrompt: 'A 19-year-old girl with dark auburn braided hair, alert hazel eyes, wearing a deep navy wool scholar cloak with silver piping and carrying a glowing cobalt lantern',
      },
      {
        id: 'char-2',
        name: 'Master Caelum',
        role: 'Mentor / Grand Cartographer',
        age: '72',
        appearance: 'Weathered face etched with star-chart ink, silver beard, kind yet stern eyes behind brass spectacles',
        hair: 'Thick white hair swept back',
        clothing: 'Midnight velvet robes with astrolabe dials sewn into the cuffs',
        personality: 'Enigmatic, patient, speaks in navigational riddles',
        backstory: 'The sole living archivist who charted the Thirteenth Partition thirty winters ago.',
        visualAnchorPrompt: 'A 72-year-old scholar with long silver beard, brass astronomical spectacles, wearing midnight velvet embroidered robes',
      },
    ],
    worldLore: {
      id: 'world-1',
      worldName: 'Aethelgard',
      theme: 'Arcane Scholastic Fantasy',
      locations: [
        {
          id: 'loc-1',
          name: 'The Great Archive of Oakhaven',
          type: 'Arcane Sanctuary',
          climate: 'Temperate, cedar-scented, dustless',
          dangerLevel: 'Moderate (Forbidden Tomes)',
          description: 'A thousand-year-old labyrinth of concentric cedar rotundas holding every parchment ever penned in the northern realms.',
        },
        {
          id: 'loc-2',
          name: 'The Rift of Starlight',
          type: 'Dimensional Meridian',
          climate: 'Sub-zero vacuum infused with warm stellar auroras',
          dangerLevel: 'Extreme',
          description: 'A doorway of pure cosmos hidden between partitions XII and XIII.',
        },
      ],
      magicSystem: {
        name: 'Scriptum Astral',
        source: 'Constellations etched onto vellum using luminescent squid ink',
        rules: [
          'Words spoken in darkness retain heat.',
          'A star catalogued cannot shift its orbit without the reader\'s consent.',
        ],
        limitations: 'Spells degrade when exposed to direct sunlight.',
        cost: 'Each celestial doorway consumes five minutes of the archivist\'s own memory.',
      },
      factions: [
        {
          id: 'fac-1',
          name: 'The Guild of Silent Quill',
          alignment: 'Lawful Neutral',
          goals: 'Preserve history unedited, prevent emperors from burning uncomfortable truth.',
          insignia: 'A brass feather piercing an eclipse',
        },
      ],
      creatures: [
        {
          id: 'cre-1',
          name: 'Ink Moth',
          habitat: 'Upper ceilings of Oakhaven',
          traits: 'Feeds on forgotten footnotes, emits soft cerulean glow in the presence of lies',
          threat: 'Harmless',
        },
      ],
      historicalEras: [
        {
          id: 'era-1',
          era: 'The Great Burning of the Third Dynasty',
          description: 'When the eastern wing turned to silver ash, and seven secret partitions were sealed behind celestial wards.',
        },
      ],
    },
    chapters: [
      {
        id: 'chap-1',
        chapterNumber: 1,
        title: 'The Whispering Door',
        wordCount: 220,
        illustrationUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
        illustrationPrompt: 'A mysterious girl holding a glowing blue lantern discovers a hidden doorway of starlight between ancient towering wooden bookshelves in an arcane library',
        content: `The Great Archive of Oakhaven had survived seven sieges, three dynasties, and a fire that turned its eastern wing into silver ash. Yet the silence inside remained older than all of them.

Mara stepped past the towering cedar shelves, the scent of dried bergamot and powdered gallnut clinging to the air. Her fingers brushed the leather spines of centuries: forgotten treaties, star navigation ledgers, and grimoires bound in midnight calfskin. In her left hand, the cobalt lantern hummed—a faint, vibration like a sleeping bumblebee.

"The thirteenth partition does not exist on the map," Master Caelum had warned her that morning, not looking up from his astrolabe. "If you find it, young Mara, do not knock. The door listens, but it does not open to fists."`,
      },
      {
        id: 'chap-2',
        chapterNumber: 2,
        title: 'Threshold of Starlight',
        wordCount: 200,
        illustrationUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
        illustrationPrompt: 'Nebulae swirling within an arched wooden doorframe of pure starlight in an arcane library with floating dust motes',
        content: `At the deepest bend of the hall, where shadows normally settled like pooled ink, the wooden grain shifted. Two massive oak uprights bent outward, curving into an archway filled not with stone or mortar, but a breathing vortex of starlight.

Nebulae swirled within the doorframe—violet, gold, and sapphire dust spinning in slow, weightless rings. Constellations Mara had never seen in any earthly almanac blinked in the depths.

As she raised her lantern, a soft breeze smelling of cold ozone and sea spray rippled her cloak. A single whispered voice echoed from the light:

*“Enter, Archivist. The memories of tomorrow are uncatalogued.”*

Mara tightened her satchel strap, took a deep breath, and stepped through the threshold.`,
      },
    ],
    versionHistory: [
      {
        id: 'v-1',
        timestamp: '2026-10-31T18:00:00.000Z',
        title: 'The Celestial Archive of Oakhaven',
        content: 'Original draft of chapter 1 opening.',
        wordCount: 210,
        summary: 'Initial inception of Mara and the archive.',
      },
      {
        id: 'v-2',
        timestamp: '2026-11-01T08:30:00.000Z',
        title: 'The Celestial Archive of Oakhaven',
        content: 'Expanded with chapter 2 and starlight doorway threshold sequence.',
        wordCount: 420,
        summary: 'Added Master Caelum dialog and the starlight portal.',
      },
    ],
    content: `# The Celestial Archive of Oakhaven

The Great Archive of Oakhaven had survived seven sieges, three dynasties, and a fire that turned its eastern wing into silver ash. Yet the silence inside remained older than all of them.

Mara stepped past the towering cedar shelves, the scent of dried bergamot and powdered gallnut clinging to the air. Her fingers brushed the leather spines of centuries: forgotten treaties, star navigation ledgers, and grimoires bound in midnight calfskin. In her left hand, the cobalt lantern hummed—a faint, vibration like a sleeping bumblebee.

"The thirteenth partition does not exist on the map," Master Caelum had warned her that morning, not looking up from his astrolabe. "If you find it, young Mara, do not knock. The door listens, but it does not open to fists."

At the deepest bend of the hall, where shadows normally settled like pooled ink, the wooden grain shifted. Two massive oak uprights bent outward, curving into an archway filled not with stone or mortar, but a breathing vortex of starlight.

Nebulae swirled within the doorframe—violet, gold, and sapphire dust spinning in slow, weightless rings. Constellations Mara had never seen in any earthly almanac blinked in the depths.

As she raised her lantern, a soft breeze smelling of cold ozone and sea spray rippled her cloak. A single whispered voice echoed from the light:

*“Enter, Archivist. The memories of tomorrow are uncatalogued.”*

Mara tightened her satchel strap, took a deep breath, and stepped through the threshold.`,
  },
  {
    id: 'story-2',
    title: 'The Whisper of the Moss Golem',
    author: 'Siddharth M.',
    genre: 'Fairy Tale',
    tone: 'Emotional',
    length: 'Short',
    language: 'en',
    coverImage: '/src/assets/images/story_forest_whisper_1793523869337.jpg',
    imagePrompt: 'A gentle moss-covered stone forest creature leaning down to offer a glowing bioluminescent flower to a young traveler in an enchanted misty woodland, twilight atmosphere, painterly fantasy illustration with magical lighting',
    createdAt: '2026-10-30T14:15:00.000Z',
    updatedAt: '2026-11-01T07:10:00.000Z',
    wordCount: 385,
    autoIllustrateEnabled: true,
    illustratedScenes: [
      {
        id: 'scene-2-1',
        sceneNumber: 1,
        title: 'The Forest Gift',
        textSnippet: 'Two eyes carved from smooth river quartz opened in a face of living granite. The forest golem knelt with the patient grace of falling water.',
        visualPrompt: 'A gentle moss-covered stone forest creature leaning down to offer a glowing bioluminescent flower to a 16-year-old girl with honey-brown braids in an enchanted misty woodland',
        imageUrl: '/src/assets/images/story_forest_whisper_1793523869337.jpg',
        layout: 'left-wrap',
        size: 'medium',
        style: 'painterly fantasy illustration',
        status: 'completed',
      },
    ],
    coverConfig: {
      title: 'The Whisper of the Moss Golem',
      subtitle: 'A Tale of the Elderwood Bloom',
      author: 'Siddharth M.',
      tagline: 'Even stone can learn to blossom.',
      coverStyle: 'Epic Fantasy',
      coverImageUrl: '/src/assets/images/story_forest_whisper_1793523869337.jpg',
      accentColor: '#4ade80',
      fontFamily: 'Playfair Display',
    },
    characters: [
      {
        id: 'char-2-1',
        name: 'Althea',
        role: 'Protagonist / Wandering Herbalist',
        age: '16',
        appearance: 'Petite, warm brown eyes, hands stained faintly with sage and elderberry',
        hair: 'Honey-brown hair tied in two loose braids',
        clothing: 'Weathered linen tunic, leather boots with fir needles caught in the laces',
        personality: 'Empathic, observant, courageous in the face of quiet wonder',
        backstory: 'Raised in Oakhaven village, determined to save her grandmother from the creeping frost sickness.',
        visualAnchorPrompt: 'A 16-year-old girl with honey-brown braids, wearing a simple traveler tunic and leather boots, kneeling in an enchanted mossy forest',
      },
    ],
    chapters: [
      {
        id: 'chap-2-1',
        chapterNumber: 1,
        title: 'The Root Path',
        wordCount: 385,
        illustrationUrl: '/src/assets/images/story_forest_whisper_1793523869337.jpg',
        illustrationPrompt: 'A gentle moss-covered stone forest creature leaning down to offer a glowing bioluminescent flower to a young traveler in an enchanted misty woodland',
        content: `The villagers said the Elderwood was hungry, that it swallowed travelers and spat out their wooden buttons. But Althea knew trees did not hunger for flesh; they hungered for quiet.

Her boots sank into deep emerald moss as twilight settled between ancient birch trunks. Fog rolled in like cold silk around her knees. In her pocket, her grandmother’s winterblight remedy was incomplete, missing the crucial Luminous Orchid that only grew where the heart of the forest dreamed.

A tremor shook the ground—not the sharp snap of an earthquake, but the slow, ponderous grinding of ancient stone.

Before her, the hill rose.

Vines pulled taut. Lichen cracked. Two eyes carved from smooth river quartz opened in a face of living granite. The forest golem knelt with the patient grace of falling water. Its shoulders were home to ferns and small blue mushrooms that trembled in the dusk.

Slowly, the colossus extended a massive stone palm. Its fingers were rough with shale, yet balanced upon its palm bloomed a single violet flower, radiating a calm, azure luminescence that bathed both child and titan in sapphire warmth.

"For the village?" Althea whispered, reaching out with both hands.

The golem bowed its head, and the wind through its mossy crown sounded like laughter.`,
      },
    ],
    content: `# The Whisper of the Moss Golem

The villagers said the Elderwood was hungry, that it swallowed travelers and spat out their wooden buttons. But Althea knew trees did not hunger for flesh; they hungered for quiet.

Her boots sank into deep emerald moss as twilight settled between ancient birch trunks. Fog rolled in like cold silk around her knees. In her pocket, her grandmother’s winterblight remedy was incomplete, missing the crucial Luminous Orchid that only grew where the heart of the forest dreamed.

A tremor shook the ground—not the sharp snap of an earthquake, but the slow, ponderous grinding of ancient stone.

Before her, the hill rose.

Vines pulled taut. Lichen cracked. Two eyes carved from smooth river quartz opened in a face of living granite. The forest golem knelt with the patient grace of falling water. Its shoulders were home to ferns and small blue mushrooms that trembled in the dusk.

Slowly, the colossus extended a massive stone palm. Its fingers were rough with shale, yet balanced upon its palm bloomed a single violet flower, radiating a calm, azure luminescence that bathed both child and titan in sapphire warmth.

"For the village?" Althea whispered, reaching out with both hands.

The golem bowed its head, and the wind through its mossy crown sounded like laughter.`,
  },
  {
    id: 'story-3',
    title: 'Rain Over Neo-Kyoto',
    author: 'Kaelen Cross',
    genre: 'Cyberpunk',
    tone: 'Suspenseful',
    length: 'Medium',
    language: 'en',
    coverImage: '/src/assets/images/story_cyber_drifter_1793523869513.jpg',
    imagePrompt: 'A wanderer in a weathered hooded coat standing atop a rain-soaked rooftop looking out at a sprawling futuristic megacity with flying airships and vibrant neon reflections in puddles through soft rain mist, cinematic concept art',
    createdAt: '2026-10-29T21:40:00.000Z',
    updatedAt: '2026-10-31T19:20:00.000Z',
    wordCount: 510,
    coverConfig: {
      title: 'Rain Over Neo-Kyoto',
      subtitle: 'The Memory Courier',
      author: 'Kaelen Cross',
      tagline: 'Some memories are too dangerous to forget.',
      coverStyle: 'Cinematic Noir',
      coverImageUrl: '/src/assets/images/story_cyber_drifter_1793523869513.jpg',
      accentColor: '#38bdf8',
      fontFamily: 'Space Grotesk',
    },
    characters: [
      {
        id: 'char-3-1',
        name: 'Ren Vance',
        role: 'Protagonist / Memory Courier',
        age: '28',
        appearance: 'Cybernetic cranial socket behind right ear, sharp jawline, quick observant dark eyes',
        hair: 'Asymmetrical cropped black hair damp with neon rain',
        clothing: 'Charcoal waterproof trench coat with insulated carbon fiber weave, combat boots',
        personality: 'Stoic, calculating, runs on caffeine and adrenaline',
        backstory: 'Former sysadmin who went off-grid when the megacorp began neural extraction on civilians.',
        visualAnchorPrompt: 'A 28-year-old courier in a hooded carbon-weave trench coat with a glowing cybernetic port behind his ear standing on a rain-slicked Tokyo roof',
      },
    ],
    chapters: [
      {
        id: 'chap-3-1',
        chapterNumber: 1,
        title: 'Sector 9 Downpour',
        wordCount: 510,
        illustrationUrl: '/src/assets/images/story_cyber_drifter_1793523869513.jpg',
        illustrationPrompt: 'A wanderer in a weathered hooded coat standing atop a rain-soaked rooftop looking out at a sprawling futuristic megacity with flying airships and vibrant neon reflections',
        content: `The rain in Sector 9 tasted like copper and burned ozone.

Ren pulled his hood forward, watching the skyway traffic slide across the mist like glowing orange beetles on a wet wire. Fifty stories below, the neon billboards of Mega-Corp synthetic noodle shops flickered in scarlet and electric teal, painting iridescent ribbons across the rain puddles on the rooftop.

The titanium drive in his inner pocket felt unnaturally warm against his ribs.

It contained thirty seconds of encrypted memory from inside the Satori Orbital Facility—an unedited feed showing the moment the automated weather grids began choosing which districts to drown.

A low sonic whistle sliced through the downpour.

Ren turned. A surveillance drone, sleek and matte-black like a polished obsidian beetle, hovered ten paces away near the ventilation shaft. Its tri-sensor lens flared amber, cycling through facial recognition algorithms.

Ren didn't run. Running gave the targeting predictive models an easy trajectory. Instead, he reached into his sleeve, crushed a miniature EMP popper between two synthetic finger pads, and flicked the spark into the rain-slick grate between them.`,
      },
    ],
    content: `# Rain Over Neo-Kyoto

The rain in Sector 9 tasted like copper and burned ozone.

Ren pulled his hood forward, watching the skyway traffic slide across the mist like glowing orange beetles on a wet wire. Fifty stories below, the neon billboards of Mega-Corp synthetic noodle shops flickered in scarlet and electric teal, painting iridescent ribbons across the rain puddles on the rooftop.

The titanium drive in his inner pocket felt unnaturally warm against his ribs.

It contained thirty seconds of encrypted memory from inside the Satori Orbital Facility—an unedited feed showing the moment the automated weather grids began choosing which districts to drown.

A low sonic whistle sliced through the downpour.

Ren turned. A surveillance drone, sleek and matte-black like a polished obsidian beetle, hovered ten paces away near the ventilation shaft. Its tri-sensor lens flared amber, cycling through facial recognition algorithms.

Ren didn't run. Running gave the targeting predictive models an easy trajectory. Instead, he reached into his sleeve, crushed a miniature EMP popper between two synthetic finger pads, and flicked the spark into the rain-slick grate between them.`,
  },
  {
    id: 'story-4',
    title: 'The Clockwork Sea of Aetherius',
    author: 'Arthur Pendelton',
    genre: 'Steampunk',
    tone: 'Cinematic',
    length: 'Short',
    language: 'en',
    coverImage: '/src/assets/images/story_clockwork_sea_1793523869882.jpg',
    imagePrompt: 'A majestic vintage brass clockwork vessel cutting through bioluminescent turquoise ocean waves under twin moons, steampunk nautical fantasy, rich painterly lighting, wide atmospheric composition',
    createdAt: '2026-10-28T12:00:00.000Z',
    updatedAt: '2026-10-30T16:45:00.000Z',
    wordCount: 460,
    coverConfig: {
      title: 'The Clockwork Sea of Aetherius',
      subtitle: 'Voyage Beyond the Meridian',
      author: 'Arthur Pendelton',
      tagline: 'Steam, brass, and bioluminescent abysses.',
      coverStyle: 'Vintage Graphic',
      coverImageUrl: '/src/assets/images/story_clockwork_sea_1793523869882.jpg',
      accentColor: '#f59e0b',
      fontFamily: 'Cinzel',
    },
    chapters: [
      {
        id: 'chap-4-1',
        chapterNumber: 1,
        title: 'Twin Moons Rising',
        wordCount: 460,
        illustrationUrl: '/src/assets/images/story_clockwork_sea_1793523869882.jpg',
        illustrationPrompt: 'A majestic vintage brass clockwork vessel cutting through bioluminescent turquoise ocean waves under twin moons',
        content: `The twin moons of Aetherius—one silver as a fresh sovereign, the other pearl-white and scarred—hung in a velvet sky punctured by salt spray.

Below, the water didn't merely reflect the moons; it burned with its own cold phosphorescent flame. Turquoise swells crashed against the reinforced brass bow of the *Aetherius*, churning the sea into a foam of emerald stars.

"Main cog pressure holding at four hundred kilopascals, Captain!" shouted the first engineer above the steady, rhythmic heartbeat of the triple-expansion piston engine.

Gideon Vance tapped his knuckle against the copper barometer mounted beside the helm. The needle stood rigid in the red arc.

"Feed the auxiliary firebox with coal-peat," Gideon ordered, his hand steady on the teak wheel. "The Leviathan Trench doesn't wait for vessels running on half-chambers."

Along the portside walkway, giant mechanical paddle wheels churned the luminous tide, kicking up glowing spray that illuminated the rigging like holiday lanterns. Far on the horizon, where the sea met the archipelago cliffs, the gas lamps of New Bristol flickered—the last outpost of civilization before the edge of the known meridian.`,
      },
    ],
    content: `# The Clockwork Sea of Aetherius

The twin moons of Aetherius—one silver as a fresh sovereign, the other pearl-white and scarred—hung in a velvet sky punctured by salt spray.

Below, the water didn't merely reflect the moons; it burned with its own cold phosphorescent flame. Turquoise swells crashed against the reinforced brass bow of the *Aetherius*, churning the sea into a foam of emerald stars.

"Main cog pressure holding at four hundred kilopascals, Captain!" shouted the first engineer above the steady, rhythmic heartbeat of the triple-expansion piston engine.

Gideon Vance tapped his knuckle against the copper barometer mounted beside the helm. The needle stood rigid in the red arc.

"Feed the auxiliary firebox with coal-peat," Gideon ordered, his hand steady on the teak wheel. "The Leviathan Trench doesn't wait for vessels running on half-chambers."

Along the portside walkway, giant mechanical paddle wheels churned the luminous tide, kicking up glowing spray that illuminated the rigging like holiday lanterns. Far on the horizon, where the sea met the archipelago cliffs, the gas lamps of New Bristol flickered—the last outpost of civilization before the edge of the known meridian.`,
  },
  {
    id: 'story-ml-1',
    title: 'നീലവെളിച്ചത്തിന്റെ കാവൽക്കാരൻ',
    author: 'സിദ്ധാർത്ഥ് എം.',
    genre: 'Fantasy',
    tone: 'Cinematic',
    length: 'Short',
    language: 'ml',
    coverImage: '/src/assets/images/story_celestial_library_1793523868966.jpg',
    imagePrompt: 'A mystical ancient wooden library bathed in glowing blue lantern light with floating starlight dust, Malayalam literary fantasy concept',
    createdAt: '2026-11-01T01:00:00.000Z',
    updatedAt: '2026-11-01T01:10:00.000Z',
    wordCount: 280,
    coverConfig: {
      title: 'നീലവെളിച്ചത്തിന്റെ കാവൽക്കാരൻ',
      subtitle: 'നക്ഷത്രങ്ങളുടെ പുസ്തകശാല',
      author: 'സിദ്ധാർത്ഥ് എം.',
      tagline: 'തുറക്കപ്പെടാത്ത വാതിലുകൾക്ക് പിറകിലെ പ്രപഞ്ചം.',
      coverStyle: 'Epic Fantasy',
      coverImageUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
      accentColor: '#38bdf8',
      fontFamily: 'Noto Sans Malayalam',
    },
    chapters: [
      {
        id: 'chap-ml-1',
        chapterNumber: 1,
        title: 'നക്ഷത്ര ലിപികൾ',
        wordCount: 280,
        illustrationUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
        illustrationPrompt: 'Mystical library with Malayalam script scrolls and glowing celestial door',
        content: `പഴയ മാളികയുടെ മച്ചിൽ സൂക്ഷിച്ചിരുന്ന ആ താളിയോലകളിൽ നിന്നാണ് നീലവെളിച്ചം ആദ്യം ഉയർന്നുവന്നത്.

മാര പതിയെ ആ പുസ്തകത്താളുകൾ മറിച്ചു. നൂറ്റാണ്ടുകളുടെ ഗന്ധമുള്ള ആ മുറിയിൽ ചന്ദനത്തിരിയുടെയും പഴയ കടലാസിന്റെയും മണം തങ്ങിനിന്നു. അവളുടെ കൈയിലിരുന്ന വിളക്ക് ഒരു മിന്നാമിനുങ്ങിനെപ്പോലെ ചിമ്മിത്തുറന്നു.

"പതിമൂന്നാമത്തെ വാതിൽ അടയാളപ്പെടുത്തിയിട്ടില്ല," മാസ്റ്റർ കേലം അന്ന് രാവിലെ പറഞ്ഞിരുന്നു. "അത് കാണുമ്പോൾ മുട്ടരുത്. അത് തുറക്കുന്നത് ശബ്ദത്തിനല്ല, മൗനത്തിനാണ്."

പെട്ടെന്നാണ് അലമാരകൾക്കിടയിലെ തടിവഴികൾ വശങ്ങളിലേക്ക് മാറിയത്. അവിടെ നക്ഷത്രങ്ങൾ തിളങ്ങുന്ന ഒരു പുതിയ ആകാശം തെളിഞ്ഞുവന്നു.`,
      },
    ],
    content: `# നീലവെളിച്ചത്തിന്റെ കാവൽക്കാരൻ

പഴയ മാളികയുടെ മച്ചിൽ സൂക്ഷിച്ചിരുന്ന ആ താളിയോലകളിൽ നിന്നാണ് നീലവെളിച്ചം ആദ്യം ഉയർന്നുവന്നത്.

മാര പതിയെ ആ പുസ്തകത്താളുകൾ മറിച്ചു. നൂറ്റാണ്ടുകളുടെ ഗന്ധമുള്ള ആ മുറിയിൽ ചന്ദനത്തിരിയുടെയും പഴയ കടലാസിന്റെയും മണം തങ്ങിനിന്നു. അവളുടെ കൈയിലിരുന്ന വിളക്ക് ഒരു മിന്നാമിനുങ്ങിനെപ്പോലെ ചിമ്മിത്തുറന്നു.

"പതിമൂന്നാമത്തെ വാതിൽ അടയാളപ്പെടുത്തിയിട്ടില്ല," മാസ്റ്റർ കേലം അന്ന് രാവിലെ പറഞ്ഞിരുന്നു. "അത് കാണുമ്പോൾ മുട്ടരുത്. അത് തുറക്കുന്നത് ശബ്ദത്തിനല്ല, മൗനത്തിനാണ്."

പെട്ടെന്നാണ് അലമാരകൾക്കിടയിലെ തടിവഴികൾ വശങ്ങളിലേക്ക് മാറിയത്. അവിടെ നക്ഷത്രങ്ങൾ തിളങ്ങുന്ന ഒരു പുതിയ ആകാശം തെളിഞ്ഞുവന്നു.`,
  },
  {
    id: 'story-ar-1',
    title: 'حارس مكتبة النجوم',
    author: 'طارق الأندلسي',
    genre: 'Fantasy',
    tone: 'Cinematic',
    length: 'Short',
    language: 'ar',
    coverImage: '/src/assets/images/story_celestial_library_1793523868966.jpg',
    imagePrompt: 'A vast grand ancient Arabian fantasy library with starry portal and lantern',
    createdAt: '2026-11-01T01:15:00.000Z',
    updatedAt: '2026-11-01T01:20:00.000Z',
    wordCount: 260,
    coverConfig: {
      title: 'حارس مكتبة النجوم',
      subtitle: 'أسرار الباب الثالث عشر',
      author: 'طارق الأندلسي',
      tagline: 'حيث تُقرأ أقدار الغد تحت ضوء القناديل.',
      coverStyle: 'Gilded Classic',
      coverImageUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
      accentColor: '#f59e0b',
      fontFamily: 'Amiri',
    },
    chapters: [
      {
        id: 'chap-ar-1',
        chapterNumber: 1,
        title: 'الباب الخفي',
        wordCount: 260,
        illustrationUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
        illustrationPrompt: 'Grand library with Arabic calligraphy scrolls and glowing starlight archway',
        content: `صمدت دار الحكمة العظمى أمام سبعة حصارات وثلاث سلالات، وظل الصمت في أروقتها أقدم من كل التواريخ المكتوبة.

كانت خطى "مارا" تخترق ممرات الأرز العتيقة، ورائحة البخور وجلود المخطوطات تعبق في الأفق. في يدها اليسرى، كان القنديل الفيروزي يهمس بنبض خافت يشبه تسبيح الرياح في ليلة صحراوية هادئة.

"الرواق الثالث عشر لا يظهر على أي خريطة"، هكذا حذرها المعلم قبل الفجر، دون أن يرفع عينيه عن الأسطرلاب النحاسي. "إذا وجدته يا ابنتي، فلا تطرقي الباب. الأبواب السماوية تُفتح للقلوب الصافية، لا للقبضات."

وفجأة، انشقت الأعمدة الخشبية العملاقة، وظهر قوس عظيم من النور يفيض بغبار المجرات والشهب اللامعة.`,
      },
    ],
    content: `# حارس مكتبة النجوم

صمدت دار الحكمة العظمى أمام سبعة حصارات وثلاث سلالات، وظل الصمت في أروقتها أقدم من كل التواريخ المكتوبة.

كانت خطى "مارا" تخترق ممرات الأرز العتيقة، ورائحة البخور وجلود المخطوطات تعبق في الأفق. في يدها اليسرى، كان القنديل الفيروزي يهمس بنبض خافت يشبه تسبيح الرياح في ليلة صحراوية هادئة.

"الرواق الثالث عشر لا يظهر على أي خريطة"، هكذا حذرها المعلم قبل الفجر، دون أن يرفع عينيه عن الأسطرلاب النحاسي. "إذا وجدته يا ابنتي، فلا تطرقي الباب. الأبواب السماوية تُفتح للقلوب الصافية، لا للقبضات."

وفجأة، انشقت الأعمدة الخشبية العملاقة، وظهر قوس عظيم من النور يفيض بغبار المجرات والشهب اللامعة.`,
  },
  {
    id: 'story-kn-1',
    title: 'ನಕ್ಷತ್ರ ಭಂಡಾರದ ರಹಸ್ಯ',
    author: 'ರವೀಂದ್ರ ಹೆಗಡೆ',
    genre: 'Fantasy',
    tone: 'Cinematic',
    length: 'Short',
    language: 'kn',
    coverImage: '/src/assets/images/story_celestial_library_1793523868966.jpg',
    imagePrompt: 'Ancient celestial library in glowing blue starry nebula light, glowing lantern, Indian fantasy aesthetic, 8k',
    createdAt: '2026-11-01T01:30:00.000Z',
    updatedAt: '2026-11-01T01:35:00.000Z',
    wordCount: 240,
    autoIllustrateEnabled: true,
    illustratedScenes: [
      {
        id: 'scene-kn-1',
        sceneNumber: 1,
        title: 'ಬೆಳಕಿನ ಬಾಗಿಲು',
        textSnippet: 'ಪುರಾತನ ಮರದ ಕಪಾಟುಗಳ ನಡುವೆ ಇದ್ದ ಜಾಗವು ನಿಧಾನವಾಗಿ ತೆರೆದುಕೊಂಡಿತು. ಅಲ್ಲಿ ಕಲ್ಲು ಅಥವಾ ಗೋಡೆಯಿರಲಿಲ್ಲ, ಬದಲಾಗಿ ಮಿನುಗುವ ನೀಲಿ ನಕ್ಷತ್ರಗಳ ಹೊನಲು ಹರಿಯುತ್ತಿತ್ತು.',
        visualPrompt: 'A glowing blue starlight threshold inside an ancient wooden mystic library, dust motes floating in cosmic lights, 8k fantasy art',
        imageUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
        layout: 'right-wrap',
        size: 'medium',
        style: 'cinematic digital storybook illustration',
        status: 'completed',
      },
    ],
    coverConfig: {
      title: 'ನಕ್ಷತ್ರ ಭಂಡಾರದ ರಹಸ್ಯ',
      subtitle: 'ನಾಳೆಯ ನೆನಪುಗಳು ಜೀವ ಪಡೆಯುವ ತಾಣ',
      author: 'ರವೀಂದ್ರ ಹೆಗಡೆ',
      tagline: 'ಬೆಳಕಿನ ಕಿರಣಗಳು ಮಾತ್ರ ತೆರೆಯಬಲ್ಲ ಪುರಾತನ ರಹಸ್ಯ.',
      coverStyle: 'Epic Fantasy',
      coverImageUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
      accentColor: '#38bdf8',
      fontFamily: 'Noto Sans Kannada',
    },
    chapters: [
      {
        id: 'chap-kn-1',
        chapterNumber: 1,
        title: 'ಹದಿಮೂರನೇ ದ್ವಾರ',
        wordCount: 240,
        illustrationUrl: '/src/assets/images/story_celestial_library_1793523868966.jpg',
        illustrationPrompt: 'Mystical starlight doorway in an ancient archive',
        content: `ಓಕ್‌ಹೇವನ್ ಮಹಾಗ್ರಂಥಾಲಯವು ನೂರಾರು ವರ್ಷಗಳಿಂದಲೂ ಜ್ಞಾನದ ಪವಿತ್ರ ನೆಲೆಯಾಗಿ ಉಳಿದುಕೊಂಡಿತ್ತು. ಅದರ ಎತ್ತರದ ತೇಗದ ಕಂಬಗಳು ಮತ್ತು ತಾಳೆಗರಿಗಳ ಸುವಾಸನೆ ಕಾಲಾತೀತವಾದ ಶಾಂತಿಯನ್ನು ಹರಡಿದ್ದವು.

ಮೀರಾ ತನ್ನ ಕೈಯಲ್ಲಿದ್ದ ನೀಲಿ ಗಾಜಿನ ದೀಪವನ್ನು ಎತ್ತಿ ಹಿಡಿದು ನಿಧಾನವಾಗಿ ಮುಂದೆ ಹೆಜ್ಜೆ ಹಾಕಿದಳು. ಅವಳ ಕೈಯಲ್ಲಿದ್ದ ದೀಪದ ಬೆಳಕು ಪುಸ್ತಕಗಳ ಹಳೆಯ ಬಣ್ಣದ ಮೇಲೆ ನರ್ತಿಸುತ್ತಿತ್ತು.

"ಹದಿಮೂರನೇ ಮಾರ್ಗವು ಯಾವುದೇ ನಕಾಶೆಯಲ್ಲಿ ಕಾಣಿಸುವುದಿಲ್ಲ," ಎಂದು ಹಿರಿಯ ಗುರುಗಳು ಎಚ್ಚರಿಸಿದ್ದರು. "ಅದು ನಕ್ಷತ್ರಗಳ ಕೃಪೆಯಿಂದ ಮಾತ್ರ ತನ್ನ ಬಾಗಿಲನ್ನು ತೆರೆಯುತ್ತದೆ."

ಪುರಾತನ ಮರದ ಕಪಾಟುಗಳ ನಡುವೆ ಇದ್ದ ಜಾಗವು ನಿಧಾನವಾಗಿ ತೆರೆದುಕೊಂಡಿತು. ಅಲ್ಲಿ ಕಲ್ಲು ಅಥವಾ ಗೋಡೆಯಿರಲಿಲ್ಲ, ಬದಲಾಗಿ ಮಿನುಗುವ ನೀಲಿ ನಕ್ಷತ್ರಗಳ ಹೊನಲು ಹರಿಯುತ್ತಿತ್ತು.`,
      },
    ],
    content: `# ನಕ್ಷತ್ರ ಭಂಡಾರದ ರಹಸ್ಯ

ಓಕ್‌ಹೇವನ್ ಮಹಾಗ್ರಂಥಾಲಯವು ನೂರಾರು ವರ್ಷಗಳಿಂದಲೂ ಜ್ಞಾನದ ಪವಿತ್ರ ನೆಲೆಯಾಗಿ ಉಳಿದುಕೊಂಡಿತ್ತು. ಅದರ ಎತ್ತರದ ತೇಗದ ಕಂಬಗಳು ಮತ್ತು ತಾಳೆಗರಿಗಳ ಸುವಾಸನೆ ಕಾಲಾತೀತವಾದ ಶಾಂತಿಯನ್ನು ಹರಡಿದ್ದವು.

ಮೀರಾ ತನ್ನ ಕೈಯಲ್ಲಿದ್ದ ನೀಲಿ ಗಾಜಿನ ದೀಪವನ್ನು ಎತ್ತಿ ಹಿಡಿದು ನಿಧಾನವಾಗಿ ಮುಂದೆ ಹೆಜ್ಜೆ ಹಾಕಿದಳು. ಅವಳ ಕೈಯಲ್ಲಿದ್ದ ದೀಪದ ಬೆಳಕು ಪುಸ್ತಕಗಳ ಹಳೆಯ ಬಣ್ಣದ ಮೇಲೆ ನರ್ತಿಸುತ್ತಿತ್ತು.

"ಹದಿಮೂರನೇ ಮಾರ್ಗವು ಯಾವುದೇ ನಕಾಶೆಯಲ್ಲಿ ಕಾಣಿಸುವುದಿಲ್ಲ," ಎಂದು ಹಿರಿಯ ಗುರುಗಳು ಎಚ್ಚರಿಸಿದ್ದರು. "ಅದು ನಕ್ಷತ್ರಗಳ ಕೃಪೆಯಿಂದ ಮಾತ್ರ ತನ್ನ ಬಾಗಿಲನ್ನು ತೆರೆಯುತ್ತದೆ."

ಪುರಾತನ ಮರದ ಕಪಾಟುಗಳ ನಡುವೆ ಇದ್ದ ಜಾಗವು ನಿಧಾನವಾಗಿ ತೆರೆದುಕೊಂಡಿತು. ಅಲ್ಲಿ ಕಲ್ಲು ಅಥವಾ ಗೋಡೆಯಿರಲಿಲ್ಲ, ಬದಲಾಗಿ ಮಿನುಗುವ ನೀಲಿ ನಕ್ಷತ್ರಗಳ ಹೊನಲು ಹರಿಯುತ್ತಿತ್ತು.`,
  },
];
