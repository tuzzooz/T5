/*
  Ficheiro: backend/src/app.ts
  Versão final com CRUD completo para todas as entidades.
*/
import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Rota de Teste
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Bem-vindo à API do Petlovers !' });
});

// --- ROTAS DE CLIENTES ---
app.route('/api/clientes')
  .post(async (req: Request, res: Response) => {
    const { nome, email, telefone, pet } = req.body;
    if (!nome || !email || !pet || !pet.nome) {
      res.status(400).json({ error: 'Dados do cliente e do pet são obrigatórios.' });
      return;
    }
    try {
      const novoCliente = await prisma.cliente.create({
        data: { nome, email, telefone, pets: { create: { nome: pet.nome, tipo: pet.tipo, raca: pet.raca } } },
        include: { pets: true },
      });
      res.status(201).json(novoCliente);
    } catch (error) {
      res.status(500).json({ error: 'Não foi possível criar o cliente.' });
    }
  })
  .get(async (req: Request, res: Response) => {
    const clientes = await prisma.cliente.findMany({ include: { pets: true } });
    res.status(200).json(clientes);
  });

app.route('/api/clientes/:id')
  .put(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;
    const cliente = await prisma.cliente.update({ where: { id: parseInt(id) }, data: { nome, email, telefone } });
    res.status(200).json(cliente);
  })
  .delete(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.consumo.deleteMany({ where: { clienteId: parseInt(id) } });
    await prisma.pet.deleteMany({ where: { donoId: parseInt(id) } });
    await prisma.cliente.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  });

// --- ROTAS PARA PETS ---
app.route('/api/pets')
    .post(async (req: Request, res: Response) => {
        const { nome, tipo, raca, donoId } = req.body;
        if (!nome || !tipo || !raca || !donoId) {
            res.status(400).json({ error: 'Todos os campos do pet e o ID do dono são obrigatórios.' });
            return;
        }
        const novoPet = await prisma.pet.create({ data: { nome, tipo, raca, donoId: parseInt(donoId) } });
        res.status(201).json(novoPet);
    });

app.route('/api/pets/:id')
    .put(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { nome, tipo, raca } = req.body;
        const petAtualizado = await prisma.pet.update({
            where: { id: parseInt(id) },
            data: { nome, tipo, raca },
        });
        res.status(200).json(petAtualizado);
    })
    .delete(async (req: Request, res: Response) => {
        const { id } = req.params;
        await prisma.consumo.deleteMany({ where: { petId: parseInt(id) }});
        await prisma.pet.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    });

// --- ROTAS DE PRODUTOS ---
app.route('/api/produtos')
  .post(async (req, res) => { 
    const { nome, descricao, preco, estoque } = req.body;
    const novoProduto = await prisma.produto.create({
      data: { nome, descricao, preco, estoque },
    });
    res.status(201).json(novoProduto);
   })
  .get(async (req, res) => {
    const produtos = await prisma.produto.findMany();
    res.status(200).json(produtos);
  });
app.route('/api/produtos/:id')
  .put(async (req, res) => { 
    const { id } = req.params;
    const { nome, descricao, preco, estoque } = req.body;
    const produtoAtualizado = await prisma.produto.update({
        where: { id: parseInt(id) },
        data: { nome, descricao, preco, estoque },
    });
    res.status(200).json(produtoAtualizado);
   })
  .delete(async (req, res) => { 
    const { id } = req.params;
    await prisma.consumo.deleteMany({ where: { produtoId: parseInt(id) }});
    await prisma.produto.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
   });

// --- ROTAS DE SERVIÇOS ---
app.route('/api/servicos')
  .post(async (req, res) => { 
    const { nome, descricao, preco } = req.body;
    const novoServico = await prisma.servico.create({
        data: { nome, descricao, preco },
    });
    res.status(201).json(novoServico);
   })
  .get(async (req, res) => {
    const servicos = await prisma.servico.findMany();
    res.status(200).json(servicos);
  });
app.route('/api/servicos/:id')
  .put(async (req, res) => { 
    const { id } = req.params;
    const { nome, descricao, preco } = req.body;
    const servicoAtualizado = await prisma.servico.update({
        where: { id: parseInt(id) },
        data: { nome, descricao, preco },
    });
    res.status(200).json(servicoAtualizado);
   })
  .delete(async (req, res) => { 
    const { id } = req.params;
    await prisma.consumo.deleteMany({ where: { servicoId: parseInt(id) }});
    await prisma.servico.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
   });

// --- ROTA DE REGISTO DE CONSUMO ---
app.post('/api/consumos', async (req, res) => { 
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
        console.error(error);
        res.status(500).json({ error: 'Não foi possível registar o consumo.', details: error.message });
    }
 });

 // --- ROTAS DE RELATÓRIOS ---
app.get('/api/relatorios/top-clientes-quantidade', async (req: Request, res: Response) => {
    try {
        const topConsumos = await prisma.consumo.groupBy({
            by: ['clienteId'],
            _sum: {
                quantidade: true,
            },
            orderBy: {
                _sum: {
                    quantidade: 'desc',
                },
            },
            take: 10,
        });

        const clienteIds = topConsumos.map(item => item.clienteId);
        const clientes = await prisma.cliente.findMany({
            where: { id: { in: clienteIds } },
            select: { id: true, nome: true },
        });
        const clienteMap = new Map(clientes.map(c => [c.id, c.nome]));

        const relatorioFinal = topConsumos.map(item => ({
            clienteId: item.clienteId,
            clienteNome: clienteMap.get(item.clienteId) || 'Desconhecido',
            totalQuantidade: item._sum.quantidade,
        }));

        res.status(200).json(relatorioFinal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Não foi possível gerar o relatório.' });
    }
});

// ROTA DE RELATÓRIO
app.get('/api/relatorios/top-itens-consumidos', async (req: Request, res: Response) => {
    try {
        const topProdutos = await prisma.consumo.groupBy({
            by: ['produtoId'],
            where: { produtoId: { not: null } },
            _sum: {
                quantidade: true,
            },
            orderBy: {
                _sum: {
                    quantidade: 'desc',
                },
            },
        });

        const topServicos = await prisma.consumo.groupBy({
            by: ['servicoId'],
            where: { servicoId: { not: null } },
            _sum: {
                quantidade: true,
            },
            orderBy: {
                _sum: {
                    quantidade: 'desc',
                },
            },
        });

        const produtoIds = topProdutos.map(p => p.produtoId).filter((id): id is number => id !== null);
        const servicoIds = topServicos.map(s => s.servicoId).filter((id): id is number => id !== null);

        const produtos = await prisma.produto.findMany({ where: { id: { in: produtoIds } }, select: { id: true, nome: true } });
        const servicos = await prisma.servico.findMany({ where: { id: { in: servicoIds } }, select: { id: true, nome: true } });

        const produtoMap = new Map(produtos.map(p => [p.id, p.nome]));
        const servicoMap = new Map(servicos.map(s => [s.id, s.nome]));

        const relatorioProdutos = topProdutos.map(item => ({
            nome: produtoMap.get(item.produtoId!) || 'Desconhecido',
            quantidade: item._sum.quantidade,
        }));

        const relatorioServicos = topServicos.map(item => ({
            nome: servicoMap.get(item.servicoId!) || 'Desconhecido',
            quantidade: item._sum.quantidade,
        }));

        res.status(200).json({ produtos: relatorioProdutos, servicos: relatorioServicos });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Não foi possível gerar o relatório de itens.' });
    }
});

// RELATORIO TOP CLIENTES VALOR

app.get('/api/relatorios/top-clientes-valor', async (req: Request, res: Response) => {
    try {
        const topConsumosValor = await prisma.consumo.groupBy({
            by: ['clienteId'],
            _sum: { precoTotal: true },
            orderBy: { _sum: { precoTotal: 'desc' } },
            take: 5,
        });

        const clienteIds = topConsumosValor.map(item => item.clienteId);
        const clientes = await prisma.cliente.findMany({
            where: { id: { in: clienteIds } },
            select: { id: true, nome: true },
        });
        const clienteMap = new Map(clientes.map(c => [c.id, c.nome]));

        const relatorio = topConsumosValor.map(item => ({
            clienteId: item.clienteId,
            clienteNome: clienteMap.get(item.clienteId) || 'Desconhecido',
            totalValor: item._sum.precoTotal,
        }));

        res.status(200).json(relatorio);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível gerar o relatório de valor.' });
    }
});

// RELATORIO DE ITENS POR PET
app.get('/api/relatorios/top-itens-por-pet', async (req: Request, res: Response) => {
    try {
        const consumosComPet = await prisma.consumo.findMany({
            where: { petId: { not: null } },
            include: {
                pet: { select: { tipo: true, raca: true } },
                produto: { select: { nome: true } },
                servico: { select: { nome: true } },
            }
        });

        const stats: { [key: string]: { [key: string]: number } } = {};

        for (const consumo of consumosComPet) {
            if (!consumo.pet) continue;
            const key = `${consumo.pet.tipo} - ${consumo.pet.raca}`;
            const itemName = consumo.produto?.nome || consumo.servico?.nome;

            if (itemName) {
                if (!stats[key]) stats[key] = {};
                stats[key][itemName] = (stats[key][itemName] || 0) + consumo.quantidade;
            }
        }
        
        res.status(200).json(stats);

    } catch (error) {
        res.status(500).json({ error: 'Não foi possível gerar o relatório por pet.' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor a ser executado na porta ${PORT}`);
});
