export const AYANAMSA_LABEL = "Lahiri (Chitrapaksha)";
export const CHART_STYLE = "North Indian";

export const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
export const SIGNS_SANSKRIT = ["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];

export const NAKSHATRAS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
  "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati",
];

export const PLANET_ORDER = ["sun","moon","mars","mercury","jupiter","venus","saturn","rahu","ketu"];
export const PLANET_LABEL = { sun:"Sun", moon:"Moon", mars:"Mars", mercury:"Mercury", jupiter:"Jupiter", venus:"Venus", saturn:"Saturn", rahu:"Rahu", ketu:"Ketu" };
export const PLANET_ABBR  = { sun:"Su", moon:"Mo", mars:"Ma", mercury:"Me", jupiter:"Ju", venus:"Ve", saturn:"Sa", rahu:"Ra", ketu:"Ke" };

export const DASHA_ORDER = ["ketu","venus","sun","moon","mars","rahu","jupiter","saturn","mercury"];
export const DASHA_YEARS = { ketu:7, venus:20, sun:6, moon:10, mars:7, rahu:18, jupiter:16, saturn:19, mercury:17 };

export const SECTION_KEYS = ["overview","personality","strengths","challenges","career","finance","marriage","education","family","wellbeing","lifePeriods","dasha","yogas","summary","guidance"];
export const SECTION_LABELS_FALLBACK = ["Kundali Overview","Personality","Strengths","Challenges","Career","Finance","Marriage & Relationships","Education","Family","General Wellbeing","Major Life Periods","Dasha Interpretation","Important Yogas","Summary","General Guidance"];
export const SECTION_LABELS = {
  en: ["Overview","Personality","Strengths","Challenges","Career","Finance","Marriage","Education","Family","Wellbeing","Life Periods","Dasha","Yogas","Summary","Guidance"],
  hi: ["अवलोकन","व्यक्तित्व","शक्तियाँ","चुनौतियाँ","करियर","वित्त","विवाह","शिक्षा","परिवार","स्वास्थ्य","जीवन काल","दशा","योग","सारांश","मार्गदर्शन"],
  gu: ["ઝાંખી","વ્યક્તિત્વ","શક્તિઓ","પડકારો","કારકિર્દી","નાણાં","લગ્ન","શિક્ષણ","કુટુંબ","સુખાકારી","જીવન ગાળા","દશા","યોગ","સારાંશ","માર્ગદર્શન"],
};
export const UI_LABELS = {
  en: { overview:"Kundali Overview", planetary:"Planetary Positions", dasha:"Vimshottari Dasha", interpretation:"Detailed Interpretation", lagna:"Lagna", rashi:"Moon Rashi", nakshatra:"Birth Nakshatra", generating:"Calculating…" },
  hi: { overview:"कुंडली अवलोकन", planetary:"ग्रह स्थिति", dasha:"विंशोत्तरी दशा", interpretation:"विस्तृत व्याख्या", lagna:"लग्न", rashi:"चंद्र राशि", nakshatra:"जन्म नक्षत्र", generating:"गणना हो रही है…" },
  gu: { overview:"કુંડળી ઝાંખી", planetary:"ગ્રહ સ્થિતિ", dasha:"વિંશોત્તરી દશા", interpretation:"વિગતવાર અર્થઘટન", lagna:"લગ્ન", rashi:"ચંદ્ર રાશિ", nakshatra:"જન્મ નક્ષત્ર", generating:"ગણતરી થઈ રહી છે…" },
};
export const LANG_NAMES = { en: "English", hi: "Hindi", gu: "Gujarati" };
