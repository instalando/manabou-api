import knex from 'knex'
import pReduce from 'p-reduce';

type Entry = {
    entry_id: number
    kanji: string
    kana: string
    kanji_priority: number | null
    kana_priority: number | null
}

type Reading = {
    kanji: string
    kana: string
}

type Sense = {
    sense_id: number
    entry_id: number
    definition: string
    part_of_speech: string
}

type Senses = {
    id: number
    definition: string
    part_of_speech: string
}

type Word = {
    id: number
    readings: Reading[]
    senses: Senses[],

}

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: './src/database.db'
    },
    useNullAsDefault: true
})

const fetchWordData = async (word: string): Promise<Entry[]> => {
    const res: Entry[] = await db('entry')
        .leftJoin('kanji', 'entry.id', '=', 'kanji.entry_id')
        .leftJoin('kana', 'entry.id', '=', 'kana.entry_id')
        .leftJoin('kanji_common', 'kanji.id', '=', 'kanji_common.kanji_id')
        .leftJoin('kana_common', 'kana.id', '=', 'kana_common.kana_id')
        .where('kanji.value', 'LIKE', `${word}%`)
        .orWhere('kana.value', `${word}`)
        .select({
            entry_id: 'entry.id',
            kanji: 'kanji.value',
            kana: 'kana.value',
            kanji_priority: 'kanji_common.priority',
            kana_priority: 'kana_common.priority'
        })
        .orderByRaw('kanji_common.priority ASC NULLS LAST, kana_common.priority ASC NULLS LAST')

    return res
}

const fetchEntryIds = async (data: Entry[]): Promise<number[]> => {
    return data.map(item => item.entry_id)
        .filter((item, index, self) => self.indexOf(item) === index)
}

const fetchSenses = async (entryIds: number[]): Promise<Sense[]> => {
    const res = await db('entry')
        .leftJoin('sense', 'entry.id', 'sense.entry_id')
        .leftJoin('definition', 'sense.id', 'definition.sense_id')
        .leftJoin('part_of_speech', 'sense.id', 'part_of_speech.sense_id')
        .whereIn('entry.id', entryIds)
        .select({
            entry_id: 'entry.id',
            sense_id: 'sense.id',
            definition: 'definition.value',
            part_of_speech: 'part_of_speech.value'
        })
        .distinct('definition.value')

    return res
}

const fetchReadings = async (data: Entry[], entryId: number): Promise<Reading[]> => {
    const entries = data.filter(item => item.entry_id === entryId)

    return await pReduce(entries, async (res: Reading[], entry: Entry): Promise<Reading[]> => {
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

const fetchDefinitions = async (senses: Sense[]): Promise<string> => {
    return senses
        .map(item => item.definition)
        .filter((item, index, self) => self.indexOf(item) === index)
        .join('; ')
}

const fetchPartOfSpeech = async (senses: Sense[]): Promise<string> => {
    return senses
        .map(item => item.part_of_speech)
        .filter((item, index, self) => self.indexOf(item) === index)
        .join(', ')
}

const fetchSense = async (data: Sense[], entryId: number): Promise<Senses[]> => {
    const entries = data.filter(item => item.entry_id === entryId)

    return await pReduce(entries, async (res: any[], entry: any): Promise<any[]> => {
        const checkIfSenseExists = res.filter(item =>
            item.id === entry.sense_id
        ).length === 1

        if (checkIfSenseExists) return res
        const currentSense = entries
            .filter(item => item.sense_id === entry.sense_id)

        res.push({
            id: entry.sense_id,
            entry_id: entry.entry_id,
            definition: await fetchDefinitions(currentSense),
            part_of_speech: await fetchPartOfSpeech(currentSense)
        })

        return res
    }, [])
}

const fetchWord = async (word: string): Promise<Word[]> => {
    const data: Entry[] = await fetchWordData(word)
    const entryIds = await fetchEntryIds(data)
    const senses: Sense[] = await fetchSenses(entryIds)

    return await pReduce(entryIds, async (res: Word[], id: number) => {
        res.push({
            id,
            readings: await fetchReadings(data, id),
            senses: await fetchSense(senses, id)
        })

        return res
    }, [])
}

export default fetchWord
