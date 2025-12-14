
import { DictionaryEntry } from '../types';
import { ANIMALS } from './dictionaries/animals';
import { FOOD } from './dictionaries/food';
import { HOUSEHOLD } from './dictionaries/household';
import { NATURE } from './dictionaries/nature';
import { PEOPLE } from './dictionaries/people';
import { VERBS } from './dictionaries/verbs';
import { ADJECTIVES } from './dictionaries/adjectives';
import { GENERAL } from './dictionaries/general';
import { NCERT_WORDS } from './dictionaries/ncert';

export const DICTIONARY: DictionaryEntry[] = [
  ...ANIMALS,
  ...FOOD,
  ...HOUSEHOLD,
  ...NATURE,
  ...PEOPLE,
  ...VERBS,
  ...ADJECTIVES,
  ...GENERAL,
  ...NCERT_WORDS
];
