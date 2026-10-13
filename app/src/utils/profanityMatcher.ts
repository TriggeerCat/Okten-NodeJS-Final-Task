import { englishDataset, englishRecommendedTransformers, RegExpMatcher } from "obscenity";

export const profanityMatcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers
});

// obscenity only ships an english dataset, the platform is ukrainian
// roots must start a word (optionally after a common prefix), so "застрахуйте" or "сукня" don't match
const CYRILLIC_PREFIXES = "(?:на|по|за|ни|не|о|об|от|раз|роз|до|про|при|с|з|у|ві|вы|ви|под|під|пере|недо)?";
const CYRILLIC_ROOTS = [
    "ху[йяеёію]",
    "п[иі]зд",
    "бля[дтх]?(?![\\p{L}])",
    "бляд",
    "[еєёї]б[аaуолн]",
    "[еєёї]бл",
    "сук(?:а|и|у|ою|ой|ам|ами)(?![\\p{L}])",
    "мудак",
    "мудил",
    "залуп",
    "гандон",
    "курв",
    "п[иі]д[оа]р(?:ас|аси|асы|ок|и|ы)?(?![\\p{L}])",
    "манд[аиу](?![\\p{L}])"
].join("|");

const cyrillicMatcher = new RegExp(`(?<![\\p{L}])${CYRILLIC_PREFIXES}(?:${CYRILLIC_ROOTS})`, "iu");

export const hasProfanity = (text: string) => profanityMatcher.hasMatch(text) || cyrillicMatcher.test(text);
