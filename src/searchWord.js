"use strict";

// ! WIP !
// import knex from 'knex'
// const db = knex({
//     client: 'sqlite3',
//     connection: {
//         filename: './database.db'
//     },
//     useNullAsDefault: true
// })
// const fetchWordData = async word => {
//     const res = await db('entry')
//         .join('kanji', 'entry.id', '=', 'kanji.entry_id')
//         .join('kana', 'entry.id', '=', 'kana.entry_id')
//         .join('sense', 'entry.id', '=', 'sense.entry_id')
//         .join('definition', 'sense.id', '=', 'definition.sense_id')
//         .join('part_of_speech', 'sense.id', '=', 'part_of_speech.sense_id')
//         .where('kanji.value', 'LIKE', `${word}%`)
//         .orWhere('kana.value', 'LIKE', `${word}%`)
//         .select({
//             entry_id: 'entry.id',
//             sense_id: 'sense.id',
//             kanji: 'kanji.value',
//             kana: 'kana.value',
//             definition: 'definition.value',
//             part_of_speech: 'part_of_speech.value'
//         })
//         .orderBy('kanji')
//     return res
// }
// const fetchEntryIds = async data => {
//     return data.map(item => item.entry_id)
//         .filter((item, index, self) => self.indexOf(item) === index)
// }
// const fetchReadings = async (data, entryId) => {
//     const entries = data.filter(item => item.entry_id === entryId)
//     const readings = []
//     for (const entry of entries) {
//         if (readings.filter(item =>
//             item.kanji === entry.kanji &&
//             item.kana === entry.kana
//         ).length === 1) continue
//         readings.push({
//             kanji: entry.kanji,
//             kana: entry.kana
//         })
//     }
//     return readings
// }
// const fetchDefinitions = async sense => {
//     return sense
//         .map(item => item.definition)
//         .filter((item, index, self) => self.indexOf(item) === index)
//         .join('; ')
// }
// const fetchPartOfSpeech = async sense => {
//     return sense
//         .map(item => item.part_of_speech)
//         .filter((item, index, self) => self.indexOf(item) === index)
//         .join(', ')
// }
// const fetchSense = async (data, entryId) => {
//     const entries = data.filter(item => item.entry_id === entryId)
//     const sense = []
//     for (const entry of entries) {
//         if (sense.filter(item => item.id === entry.sense_id).length === 1) continue
//         const currentSense = entries
//             .filter(item => item.sense_id === entry.sense_id)
//         sense.push({
//             id: entry.sense_id,
//             definition: await fetchDefinitions(currentSense),
//             part_of_speech: await fetchPartOfSpeech(currentSense)
//         })
//     }
//     return sense
// }
// const fetchWord = async word => {
//     const data = await fetchWordData(word)
//     const entryIds = await fetchEntryIds(data)
//     const res = []
//     for (const entryId of entryIds) {
//         res.push({
//             id: entryId,
//             readings: await fetchReadings(data, entryId),
//             senses: await fetchSense(data, entryId)
//         })
//     }
//     return res
// }
// export default fetchWord
