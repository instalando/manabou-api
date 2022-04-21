var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import knex from 'knex';
import pReduce from 'p-reduce';
// const pReduce = require('p-reduce');
const db = knex({
    client: 'sqlite3',
    connection: {
        filename: './src/database.db'
    },
    useNullAsDefault: true
});
const fetchWordData = (word) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield db('entry')
        .join('kanji', 'entry.id', '=', 'kanji.entry_id')
        .join('kana', 'entry.id', '=', 'kana.entry_id')
        .join('sense', 'entry.id', '=', 'sense.entry_id')
        .join('definition', 'sense.id', '=', 'definition.sense_id')
        .join('part_of_speech', 'sense.id', '=', 'part_of_speech.sense_id')
        .where('kanji.value', 'LIKE', `${word}%`)
        .orWhere('kana.value', 'LIKE', `${word}%`)
        .select({
        entry_id: 'entry.id',
        sense_id: 'sense.id',
        kanji: 'kanji.value',
        kana: 'kana.value',
        definition: 'definition.value',
        part_of_speech: 'part_of_speech.value'
    })
        .orderBy('kanji');
    return res;
});
const fetchEntryIds = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return data.map(item => item.entry_id)
        .filter((item, index, self) => self.indexOf(item) === index);
});
const fetchReadings = (data, entryId) => __awaiter(void 0, void 0, void 0, function* () {
    const entries = data.filter(item => item.entry_id === entryId);
    return yield pReduce(entries, (res, entry) => __awaiter(void 0, void 0, void 0, function* () {
        const checkIfReadingExists = res.filter(item => item.kanji === entry.kanji &&
            item.kana === entry.kana).length === 1;
        if (checkIfReadingExists)
            return res;
        res.push({
            kanji: entry.kanji,
            kana: entry.kana
        });
        return res;
    }), []);
});
const fetchDefinitions = (entry) => __awaiter(void 0, void 0, void 0, function* () {
    return entry
        .map(item => item.definition)
        .filter((item, index, self) => self.indexOf(item) === index)
        .join('; ');
});
const fetchPartOfSpeech = (entry) => __awaiter(void 0, void 0, void 0, function* () {
    return entry
        .map(item => item.part_of_speech)
        .filter((item, index, self) => self.indexOf(item) === index)
        .join(', ');
});
const fetchSense = (data, entryId) => __awaiter(void 0, void 0, void 0, function* () {
    const entries = data.filter(item => item.entry_id === entryId);
    return yield pReduce(entries, (res, entry) => __awaiter(void 0, void 0, void 0, function* () {
        const checkIfSenseExists = res.filter(item => item.id === entry.sense_id).length === 1;
        if (checkIfSenseExists)
            return res;
        const currentSense = entries
            .filter(item => item.sense_id === entry.sense_id);
        res.push({
            id: entry.sense_id,
            definition: yield fetchDefinitions(currentSense),
            part_of_speech: yield fetchPartOfSpeech(currentSense)
        });
        return res;
    }), []);
});
const fetchWord = (word) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield fetchWordData(word);
    const entryIds = yield fetchEntryIds(data);
    return yield pReduce(entryIds, (res, curr) => __awaiter(void 0, void 0, void 0, function* () {
        res.push({
            id: curr,
            readings: yield fetchReadings(data, curr),
            senses: yield fetchSense(data, curr)
        });
        return res;
    }), []);
});
export default fetchWord;
