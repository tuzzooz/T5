/*
  Ficheiro: backend/src/app.ts
  Versão completa com todas as rotas CRUD.
*/
import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Bem-vindo à API do Petshop PetLovers!' });
});

// --- ROTAS DE CLIENTES ---
app
  .route('/api/clientes')
  .post(async (req: Request, res: Response) => {
    const { nome, email, telefone, pet } = req.body;
    if (!nome || !email || !pet || !pet.nome || !pet.tipo || !pet.raca) {
      res.status(400).json({ error: 'Dados do cliente e de pelo menos um pet são obrigatórios.' });
      return;
    }
    try {
      const novoClienteComPet = await prisma.cliente.create({
        data: {
          nome, email, telefone,
          pets: { create: { nome: pet.nome, tipo: pet.tipo, raca: pet.raca } },
        },
        include: { pets: true },
      });
      res.status(201).json(novoClienteComPet);
    } catch (error) {
      res.status(500).json({ error: 'Não foi possível criar o cliente e seu pet.' });
    }
  })
  .get(async (req: Request, res: Response) => {
    const clientes = await prisma.cliente.findMany({ include: { pets: true } });
    res.status(200).json(clientes);
  });

app
  .route('/api/clientes/:id')
  .put(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;
    const clienteAtualizado = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: { nome, email, telefone },
    });
    res.status(200).json(clienteAtualizado);
  })
  .delete(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.consumo.deleteMany({ where: { clienteId: parseInt(id) } });
    await prisma.pet.deleteMany({ where: { donoId: parseInt(id) } });
    await prisma.cliente.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  });


// --- ROTAS DE PRODUTOS ---
app
  .route('/api/produtos')
  .post(async (req: Request, res: Response) => {
    const { nome, descricao, preco, estoque } = req.body;
    const novoProduto = await prisma.produto.create({
      data: { nome, descricao, preco, estoque },
    });
    res.status(201).json(novoProduto);
  })
  .get(async (req: Request, res: Response) => {
    const produtos = await prisma.produto.findMany();
    res.status(200).json(produtos);
  });

app
  .route('/api/produtos/:id')
  .put(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, descricao, preco, estoque } = req.body;
    const produtoAtualizado = await prisma.produto.update({
        where: { id: parseInt(id) },
        data: { nome, descricao, preco, estoque },
    });
    res.status(200).json(produtoAtualizado);
  })
  .delete(async (req: Request, res: Response) => {
      const { id } = req.params;
      await prisma.consumo.deleteMany({ where: { produtoId: parseInt(id) }});
      await prisma.produto.delete({ where: { id: parseInt(id) } });
      res.status(204).send();
  });

// --- ROTAS DE SERVIÇOS ---
app
  .route('/api/servicos')
  .post(async (req: Request, res: Response) => {
    const { nome, descricao, preco } = req.body;
    const novoServico = await prisma.servico.create({
        data: { nome, descricao, preco },
    });
    res.status(201).json(novoServico);
  })
  .get(async (req: Request, res: Response) => {
    const servicos = await prisma.servico.findMany();
    res.status(200).json(servicos);
  });

app
  .route('/api/servicos/:id')
  .put(async (req: Request, res: Response) => {
      const { id } = req.params;
      const { nome, descricao, preco } = req.body;
      const servicoAtualizado = await prisma.servico.update({
          where: { id: parseInt(id) },
          data: { nome, descricao, preco },
      });
      res.status(200).json(servicoAtualizado);
  })
  .delete(async (req: Request, res: Response) => {
      const { id } = req.params;
      await prisma.consumo.deleteMany({ where: { servicoId: parseInt(id) }});
      await prisma.servico.delete({ where: { id: parseInt(id) } });
      res.status(204).send();
  });

// --- ROTA DE REGISTO DE CONSUMO ---
app.post('/api/consumos', async (req: Request, res: Response) => {
  try {
    const { clienteId, items } = req.body; 
    if (!clienteId || !items || items.length === 0) {
      res.status(400).json({ error: 'Dados inválidos para registar consumo.' });
      return; 
    }
    const consumoPromises = items.map(async (item: any) => {
      let precoUnitario = 0;
      let consumoData: any = {
        clienteId: clienteId,
        quantidade: item.quantidade,
      };
      if (item.tipo === 'produto') {
        const produto = await prisma.produto.findUnique({ where: { id: item.id } });
        if (!produto) throw new Error(`Produto com id ${item.id} não encontrado.`);
        precoUnitario = produto.preco;
        consumoData.produtoId = item.id;
        await prisma.produto.update({
            where: { id: item.id },
            data: { estoque: { decrement: item.quantidade } },
        });
      } else if (item.tipo === 'servico') {
        const servico = await prisma.servico.findUnique({ where: { id: item.id } });
        if (!servico) throw new Error(`Serviço com id ${item.id} não encontrado.`);
        precoUnitario = servico.preco;
        consumoData.servicoId = item.id;
      }
      consumoData.precoTotal = precoUnitario * item.quantidade;
      return prisma.consumo.create({ data: consumoData });
    });
    await Promise.all(consumoPromises);
    res.status(201).json({ message: 'Consumo registado com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Não foi possível registar o consumo.', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor a ser executado na porta ${PORT}`);
});
