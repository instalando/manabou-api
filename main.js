var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fastify from 'fastify';
import searchWord from './src/searchWord.js';
import fastifyFormbody from 'fastify-formbody';
import fastifyCors from 'fastify-cors';
const server = fastify();
server.register(fastifyFormbody);
server.register(fastifyCors, {});
server.get('/fetch_word', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { word } = request.query;
    reply.send(yield searchWord(word));
}));
server.listen(process.env.PORT || 3000, '0.0.0.0', (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
