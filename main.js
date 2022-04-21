"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const server = (0, fastify_1.default)();
server.register(require('fastify-formbody'));
server.register(require('fastify-cors'), {});
server.get('/fetch_word', async (request, reply) => {
    reply.send('Hello World!');
});
server.listen(process.env.PORT || 3000, '0.0.0.0', (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
