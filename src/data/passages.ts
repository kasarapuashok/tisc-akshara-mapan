import { Language, Passage, ReadingLevelIndex } from '../types';

export const PASSAGE_BANK: Passage[] = [
  // ==========================================
  // TELUGU — LEVEL 0: అక్షరాలు (Letters)
  // ==========================================
  {
    id: 'te-l0-1',
    language: 'telugu',
    level: 0,
    titleTe: 'అచ్చులు & హల్లులు — 1',
    titleEn: 'Telugu Letters Set 1',
    text: 'అ ఆ ఇ ఈ ఉ ఊ క గ చ ట త ప మ ర ల',
    wordCount: 15,
  },
  {
    id: 'te-l0-2',
    language: 'telugu',
    level: 0,
    titleTe: 'అచ్చులు & హల్లులు — 2',
    titleEn: 'Telugu Letters Set 2',
    text: 'ఎ ఏ ఐ ఒ ఓ క ఖ జ డ ద న బ య వ స',
    wordCount: 15,
  },
  {
    id: 'te-l0-3',
    language: 'telugu',
    level: 0,
    titleTe: 'గుణింత అక్షరాలు — 3',
    titleEn: 'Telugu Letters Set 3',
    text: 'కా కి కు గా గి చా చి తా తి పా పి మా మి రా ల',
    wordCount: 15,
  },

  // ==========================================
  // TELUGU — LEVEL 1: పదాలు (Words)
  // ==========================================
  {
    id: 'te-l1-1',
    language: 'telugu',
    level: 1,
    titleTe: 'ఇంటి పదాలు',
    titleEn: 'Everyday Words',
    text: 'అమ్మ నాన్న ఇల్లు పండు పాలు నీరు బడి పలక కలం పుస్తకం',
    wordCount: 10,
  },
  {
    id: 'te-l1-2',
    language: 'telugu',
    level: 1,
    titleTe: 'ప్రకృతి పదాలు',
    titleEn: 'Nature Words',
    text: 'చెట్టు పువ్వు ఆకు వాన ఎండ నది కొండ పక్షి చేప ఆవు',
    wordCount: 10,
  },
  {
    id: 'te-l1-3',
    language: 'telugu',
    level: 1,
    titleTe: 'ఊరు & ఆటలు',
    titleEn: 'Village & Play Words',
    text: 'బంతి ఆట ఊరు తోట రోడ్డు బస్సు గుడి చెరువు పంట రైతు',
    wordCount: 10,
  },

  // ==========================================
  // TELUGU — LEVEL 2: వాక్యాలు (Sentences)
  // ==========================================
  {
    id: 'te-l2-1',
    language: 'telugu',
    level: 2,
    titleTe: 'మా బడి',
    titleEn: 'My School Sentences',
    text: 'ఇది మా బడి. మా బడి చాలా బాగుంది. నేను రోజూ బడికి వెళ్తాను. మా ఉపాధ్యాయులు బాగా చెబుతారు.',
    wordCount: 15,
  },
  {
    id: 'te-l2-2',
    language: 'telugu',
    level: 2,
    titleTe: 'పచ్చని తోట',
    titleEn: 'Green Garden Sentences',
    text: 'మా ఇంటి ముందు పెద్ద చెట్టు ఉంది. చెట్టు మీద చిన్న పక్షులు కూర్చుంటాయి. ఉదయం పక్షులు తియ్యగా పాడతాయి. నేను వాటికి నీళ్ళు పెడతాను.',
    wordCount: 20,
  },
  {
    id: 'te-l2-3',
    language: 'telugu',
    level: 2,
    titleTe: 'వాన వచ్చింది',
    titleEn: 'Rainy Day Sentences',
    text: 'ఆకాశంలో నల్లని మబ్బులు వచ్చాయి. చల్లని గాలి వీచింది. జోరుగా వాన పడింది. పిల్లలు కాగితపు పడవలు చేసి ఆడుకున్నారు.',
    wordCount: 17,
  },

  // ==========================================
  // TELUGU — LEVEL 3: పేరా (Paragraph)
  // ==========================================
  {
    id: 'te-l3-1',
    language: 'telugu',
    level: 3,
    titleTe: 'మా ఊరి చెరువు',
    titleEn: 'Our Village Lake',
    text: 'మా ఊరి చివర ఒక పెద్ద చెరువు ఉంది. వర్షాకాలంలో ఆ చెరువు నిండా నీరు చేరుతుంది. చెరువు గట్టున వేప చెట్లు, తాడి చెట్లు ఎత్తుగా పెరిగాయి. సాయంత్రం రైతులు తమ పశువులను నీళ్ళు తాగించడానికి అక్కడికి తీసుకువస్తారు. చెరువులో తెల్లని కొంగలు, చిన్న చేపలు కనిపిస్తాయి.',
    wordCount: 40,
  },
  {
    id: 'te-l3-2',
    language: 'telugu',
    level: 3,
    titleTe: 'బడిలో తోటపని',
    titleEn: 'School Garden',
    text: 'మా ప్రభుత్వ పాఠశాల ఆవరణలో అందమైన కూరగాయల తోట ఉంది. ప్రతి శనివారం పిల్లలందరం కలిసి మొక్కలకు నీరు పోస్తాము. మా తోటలో టమాటా, బెండకాయ, గోంగూర బాగా పండుతాయి. ఆ తాజా కూరగాయలతో మధ్యాహ్న భోజనం రుచిగా వండుతారు. తోటపని చేయడం మా అందరికీ ఎంతో ఇష్టం.',
    wordCount: 40,
  },
  {
    id: 'te-l3-3',
    language: 'telugu',
    level: 3,
    titleTe: 'బతుకమ్మ పండుగ',
    titleEn: 'Bathukamma Festival',
    text: 'తెలంగాణలో బతుకమ్మ పండుగను ఎంతో సంతోషంగా జరుపుకుంటారు. తంగేడు, గునుగు, బంతి పువ్వులతో అందంగా బతుకమ్మను పేరుస్తారు. సాయంత్రం ఆడపిల్లలు, మహిళలు కొత్త బట్టలు వేసుకుని చప్పట్లు కొడుతూ పాటలు పాడతారు. చివరి రోజు చెరువులో బతుకమ్మను నిమజ్జనం చేసి ప్రసాదం పంచుకుంటారు.',
    wordCount: 36,
  },

  // ==========================================
  // TELUGU — LEVEL 4: కథ (Story)
  // ==========================================
  {
    id: 'te-l4-1',
    language: 'telugu',
    level: 4,
    titleTe: 'తెలివైన కాకి',
    titleEn: 'The Clever Crow',
    text: 'ఒక ఎండాకాలం మధ్యాహ్నం ఒక కాకికి విపరీతంగా దాహం వేసింది. నీళ్ళ కోసం ఊరంతా తిరిగినా ఎక్కడా చుక్క నీరు దొరకలేదు. చివరకు ఒక తోటలో దానికి ఒక మట్టి కుండ కనిపించింది. ఆ కుండ అడుగున చాలా కొద్దిగా నీళ్ళు ఉన్నాయి. కాకి ముక్కు ఆ నీళ్ళకు అందలేదు. అప్పుడు కాకి చుట్టూ చూసి చిన్న చిన్న రాళ్ళను ఏరి ఒకొక్కటిగా కుండలో వేసింది. రాళ్ళు వేయగానే నీళ్ళు నెమ్మదిగా పైకి వచ్చాయి. కాకి కడుపునిండా నీళ్ళు తాగి సంతోషంగా ఎగిరిపోయింది. కష్టంలో ఉన్నప్పుడు తెలివిగా ఆలోచిస్తే తప్పక దారి దొరుకుతుంది.',
    wordCount: 73,
  },
  {
    id: 'te-l4-2',
    language: 'telugu',
    level: 4,
    titleTe: 'రెండు మేకలు',
    titleEn: 'Two Wise Goats',
    text: 'ఒక చిన్న వాగు మీద సన్నని చెక్క వంతెన ఉండేది. దాని మీద ఒకసారి ఒక్కరు మాత్రమే నడవగలరు. ఒకరోజు రెండు మేకలు చెరో వైపు నుండి వంతెన పైకి ఎక్కాయి. సరిగ్గా మధ్యలో అవి ఎదురుపడ్డాయి. ముందు రెండూ కోపంగా ఒకదానికొకటి చూసుకున్నాయి. కానీ గొడవ పడితే ఇద్దరూ వాగులో పడిపోతామని చిన్న మేక గ్రహించింది. వెంటనే అది వంతెన మీద కిందకు పడుకుంది. రెండో మేక జాగ్రత్తగా దాని మీదుగా దాటి ఆవలి ఒడ్డుకు చేరింది. తర్వాత చిన్న మేక కూడా లేచి సురక్షితంగా వెళ్ళిపోయింది. సహనం ఉంటే ఎటువంటి సమస్య అయినా సులువుగా తీరుతుంది.',
    wordCount: 78,
  },
  {
    id: 'te-l4-3',
    language: 'telugu',
    level: 4,
    titleTe: 'రాము నిజాయితీ',
    titleEn: 'Ramu’s Honesty',
    text: 'రాము నాలుగో తరగతి చదువుతున్నాడు. ఒకరోజు బడి నుండి ఇంటికి వెళ్తుండగా దారిలో ఒక చిన్న సంచి కనిపించింది. దానిని తెరిచి చూస్తే అందులో కొంత డబ్బు, ఒక బడి గుర్తింపు కార్డు ఉన్నాయి. ఆ కార్డు మీద పక్క ఊరి రంగయ్య తాత పేరు ఉంది. రాము వెంటనే ఆ సంచిని తన ఉపాధ్యాయురాలికి చూపించాడు. ఇద్దరూ కలిసి రంగయ్య తాత ఇంటికి వెళ్ళి సంచిని తిరిగి ఇచ్చారు. పోయిన డబ్బు దొరికినందుకు తాత కళ్ళలో ఆనందం నిండింది. ఆయన రామును మనసారా మెచ్చుకున్నారు. నిజాయితీ ఎప్పుడూ మనిషికి గౌరవాన్ని తెస్తుంది.',
    wordCount: 74,
  },

  // ==========================================
  // ENGLISH — LEVEL 0: Letters
  // ==========================================
  {
    id: 'en-l0-1',
    language: 'english',
    level: 0,
    titleTe: 'ఇంగ్లీష్ అక్షరాలు — 1',
    titleEn: 'Uppercase Letters Set 1',
    text: 'A B D E G H K M P R S T W',
    wordCount: 13,
  },
  {
    id: 'en-l0-2',
    language: 'english',
    level: 0,
    titleTe: 'ఇంగ్లీష్ అక్షరాలు — 2',
    titleEn: 'Lowercase Letters Set 2',
    text: 'a c e f i l n o q u v y z',
    wordCount: 13,
  },
  {
    id: 'en-l0-3',
    language: 'english',
    level: 0,
    titleTe: 'ఇంగ్లీష్ అక్షరాలు — 3',
    titleEn: 'Mixed Letters Set 3',
    text: 'B d F g J m N p Q r T u Y',
    wordCount: 13,
  },

  // ==========================================
  // ENGLISH — LEVEL 1: Words
  // ==========================================
  {
    id: 'en-l1-1',
    language: 'english',
    level: 1,
    titleTe: 'చిన్న పదాలు — 1',
    titleEn: 'Simple Sight Words',
    text: 'cat dog sun tree book fish ball milk hand star',
    wordCount: 10,
  },
  {
    id: 'en-l1-2',
    language: 'english',
    level: 1,
    titleTe: 'బడి పదాలు — 2',
    titleEn: 'Classroom Words',
    text: 'pen bag desk bell chalk slate map water friend smile',
    wordCount: 10,
  },
  {
    id: 'en-l1-3',
    language: 'english',
    level: 1,
    titleTe: 'ప్రకృతి పదాలు — 3',
    titleEn: 'Nature & Home Words',
    text: 'rain bird leaf mango river house goat flower road moon',
    wordCount: 10,
  },

  // ==========================================
  // ENGLISH — LEVEL 2: Sentences
  // ==========================================
  {
    id: 'en-l2-1',
    language: 'english',
    level: 2,
    titleTe: 'నా స్నేహితుడు',
    titleEn: 'My Friend',
    text: 'This is my school bag. I have a red pen. My friend sits next to me. We like to read books.',
    wordCount: 21,
  },
  {
    id: 'en-l2-2',
    language: 'english',
    level: 2,
    titleTe: 'మామిడి చెట్టు',
    titleEn: 'The Mango Tree',
    text: 'There is a big mango tree near our home. Green parrots sit on its branches. Sweet yellow mangoes grow in summer. We share them with our friends.',
    wordCount: 27,
  },
  {
    id: 'en-l2-3',
    language: 'english',
    level: 2,
    titleTe: 'ఉదయం వేళ',
    titleEn: 'Morning Time',
    text: 'The bright sun rises in the east. Cool wind blows across the green fields. Farmers walk to their farms early. Children get ready and walk to school.',
    wordCount: 27,
  },

  // ==========================================
  // ENGLISH — LEVEL 3: Paragraph
  // ==========================================
  {
    id: 'en-l3-1',
    language: 'english',
    level: 3,
    titleTe: 'పాఠశాల గ్రంథాలయం',
    titleEn: 'Our School Library',
    text: 'Our government school has a bright reading corner with many colourful storybooks. Every afternoon after lunch, we sit on mats and pick a book to read. Some books have stories about brave animals and kind farmers. When I finish a story, I tell it to my younger sister at home. Reading new words makes me feel proud and happy.',
    wordCount: 59,
  },
  {
    id: 'en-l3-2',
    language: 'english',
    level: 3,
    titleTe: 'వర్షాకాలం రోజు',
    titleEn: 'A Rainy Afternoon',
    text: 'Dark clouds filled the sky above our village after school. Soon, big raindrops began to fall on the dusty road and green neem leaves. The smell of wet earth was fresh and lovely. Ravi and Meena made paper boats and floated them in the small stream near the gate. Everyone laughed as the little boats sailed away.',
    wordCount: 58,
  },
  {
    id: 'en-l3-3',
    language: 'english',
    level: 3,
    titleTe: 'రైతు కష్టం',
    titleEn: 'The Helpful Farmer',
    text: 'Venkat works hard in his paddy field every single day. Early in the morning, he checks the water canal and removes weeds from the young green plants. His children help him carry fresh drinking water and lunch under the shade of a banyan tree. Because of farmers like Venkat, every family gets healthy rice and vegetables to eat.',
    wordCount: 59,
  },

  // ==========================================
  // ENGLISH — LEVEL 4: Story
  // ==========================================
  {
    id: 'en-l4-1',
    language: 'english',
    level: 4,
    titleTe: 'చిన్న ఉడుత సాయం',
    titleEn: 'The Little Squirrel’s Seed',
    text: 'One sunny morning, a little squirrel found a shiny tamarind seed near the school playground. Instead of eating it right away, she dug a small hole in the soft soil near the fence and planted it carefully. Every week, she watched the rain fall and the warm sun shine on that spot. Soon, a tiny green sprout pushed through the ground. The school children noticed the baby plant and watered it every day. Years later, it grew into a tall shady tree where children played and birds built nests. Even the smallest kind action can grow into something wonderful.',
    wordCount: 100,
  },
  {
    id: 'en-l4-2',
    language: 'english',
    level: 4,
    titleTe: 'తెలివైన చిలుక',
    titleEn: 'The Kind Parrot',
    text: 'Deep inside a mango orchard lived a bright green parrot named Chintu. One afternoon, a fierce wind shook the trees and knocked a tiny sparrow out of its nest. The little sparrow was scared and could not fly back up. Chintu heard its soft cries and flew down at once. He called his friend, a gentle monkey, to help lift the baby bird safely back into the warm nest. The mother sparrow returned and thanked them both with joyful songs. From that day, all the birds in the orchard looked out for one another like one big family.',
    wordCount: 100,
  },
  {
    id: 'en-l4-3',
    language: 'english',
    level: 4,
    titleTe: 'మీనా కొత్త సైకిల్',
    titleEn: 'Meena’s Library Bicycle',
    text: 'Meena loved reading more than anything else in her village. Her teacher noticed how fast she finished every storybook in class five. One Saturday, Meena borrowed five picture books and placed them neatly in the basket of her older brother’s bicycle. She rode to the houses of younger children who lived far from school and read stories aloud under the courtyard tree. Soon, ten children waited eagerly every weekend for Meena’s little book basket. Her teacher smiled and said that sharing knowledge makes the whole village shine brighter.',
    wordCount: 91,
  },
];

export function getPassagesByLanguageAndLevel(
  language: Language,
  level: ReadingLevelIndex
): Passage[] {
  return PASSAGE_BANK.filter((p) => p.language === language && p.level === level);
}
