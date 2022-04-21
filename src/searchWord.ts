import knex from 'knex'
import pReduce from 'p-reduce';

type entry = {
    entry_id: number
    sense_id: number
    kanji: string
    kana: string
    definition: string
    part_of_speech: string
}

type reading = {
    kanji: string
    kana: string
}

type sense = {
    id: number,
    definition: string,
    part_of_speech: string
}

type word = {
    id: number
    readings: reading[],
    senses: sense[]
}

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: './src/database.db'
    },
    useNullAsDefault: true
})

const fetchWordData = async (word: string) => {
    const res = await db('entry')
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
        .orderBy('kanji')

    return res
}

const fetchEntryIds = async (data: entry[]): Promise<number[]> => {
    return data.map(item => item.entry_id)
        .filter((item, index, self) => self.indexOf(item) === index)
}

const fetchReadings = async (data: entry[], entryId: number): Promise<reading[]> => {
    const entries = data.filter(item => item.entry_id === entryId)

    return await pReduce(entries, async (res: reading[], entry: entry): Promise<reading[]> => {
        const checkIfReadingExists = res.filter(item =>
            item.kanji === entry.kanji &&
            item.kana === entry.kana
        ).length === 1

        if (checkIfReadingExists) return res

        res.push({
            kanji: entry.kanji,
            kana: entry.kana
        })

        return res
    }, [])
}

const fetchDefinitions = async (entry: entry[]): Promise<string> => {
    return entry
        .map(item => item.definition)
        .filter((item, index, self) => self.indexOf(item) === index)
        .join('; ')
}

const fetchPartOfSpeech = async (entry: entry[]): Promise<string> => {
    return entry
        .map(item => item.part_of_speech)
        .filter((item, index, self) => self.indexOf(item) === index)
        .join(', ')
}

const fetchSense = async (data: entry[], entryId: number): Promise<sense[]> => {
    const entries = data.filter(item => item.entry_id === entryId)

    return await pReduce(entries, async (res: sense[], entry: entry): Promise<sense[]> => {
        const checkIfSenseExists = res.filter(item =>
            item.id === entry.sense_id
        ).length === 1

        if (checkIfSenseExists) return res
        const currentSense = entries
            .filter(item => item.sense_id === entry.sense_id)

        res.push({
            id: entry.sense_id,
            definition: await fetchDefinitions(currentSense),
            part_of_speech: await fetchPartOfSpeech(currentSense)
        })

        return res
    }, [])
}

const fetchWord = async (word: string): Promise<word[]> => {
    const data = await fetchWordData(word)
    const entryIds = await fetchEntryIds(data)

    return await pReduce(entryIds, async (res: word[], id: number) => {
        res.push({
            id,
            readings: await fetchReadings(data, id),
            senses: await fetchSense(data, id)
        })

        return res
    }, [])
}

export default fetchWord
