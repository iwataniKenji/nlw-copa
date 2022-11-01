import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import cors from "@fastify/cors";
import { z } from "zod";
import ShortUniqueId from "short-unique-id";

const prisma = new PrismaClient({
  log: ["query"],
});

async function bootstrap() {
  const fastify = Fastify({
    logger: true, // logs para monitoramento da aplicação
  });

  await fastify.register(cors, {
    origin: true, // qualquer aplicação pode acessar a API
  });

  // rota get
  fastify.get("/pools/count", async () => {
    // prisma tem autocomplete das tabelas criadas
    const count = await prisma.pool.count();

    return { count };
  });

  // rota post
  fastify.post("/pools", async (request, reply) => {
    // validação
    const createPoolBody = z.object({
      title: z.string(),
    });

    const { title } = createPoolBody.parse(request.body);

    const generate = new ShortUniqueId({ length: 6 });
    const code = String(generate()).toUpperCase();

    await prisma.pool.create({
      data: {
        title,
        code,
      },
    });

    return reply.status(201).send({ code });
  });

  await fastify.listen({ port: 3333 /*host: "0.0.0.0"*/ });
}

bootstrap();
