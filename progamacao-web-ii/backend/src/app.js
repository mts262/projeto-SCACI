import express from "express";
import prisma from "./database.js";
import clienteRoutes from "./cliente/clienteRoutes.js";
import cors from "cors";


const app = express();

app.use(cors());
app.use(express.json());
app.use(clienteRoutes);
app.use("/uploads", express.static("uploads"));


app.listen(3000, async () => {
    console.log("Servidor rodando na porta 3000");

    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("Banco de dados conectado!");
    } catch (error) {
        console.error("Erro ao acessar o banco:", error);
    }
});