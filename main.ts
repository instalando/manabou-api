import fastify from 'fastify'
import searchWord from './src/searchWord.js'
import fastifyFormbody from 'fastify-formbody'
import fastifyCors from 'fastify-cors'
const server = fastify()

server.register(fastifyFormbody)
server.register(fastifyCors, {})

server.get<{
  Querystring: {
    word: string
  }
}>('/fetch_word', async (request, reply) => {
  const { word } = request.query

  reply.send(await searchWord(word))
})

server.listen(process.env.PORT || 3000, '0.0.0.0', (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
