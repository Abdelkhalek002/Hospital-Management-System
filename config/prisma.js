import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaMariaDB } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDB(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

export default prisma;
