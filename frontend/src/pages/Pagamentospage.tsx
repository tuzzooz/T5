/*
  Crie este novo ficheiro em: frontend/src/pages/PagamentosPage.tsx
  Esta página servirá para registar o consumo de clientes.
*/
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Tipagens
interface Cliente { id: number; nome: string; }
interface Produto { id: number; nome: string; preco: number; }
interface Servico { id: number; nome: string; preco: number; }
interface ConsumoItem { tipo: 'produto' | 'servico'; id: number; nome: string; quantidade: number; precoUnitario: number; }

// Funções de fetch
const fetchClientes = async (): Promise<Cliente[]> => (await axios.get(`${API_URL}/clientes`)).data;
const fetchProdutos = async (): Promise<Produto[]> => (await axios.get(`${API_URL}/produtos`)).data;
const fetchServicos = async (): Promise<Servico[]> => (await axios.get(`${API_URL}/servicos`)).data;

// Função para submeter o consumo
const postConsumo = async (data: { clienteId: number; items: Omit<ConsumoItem, 'nome' | 'precoUnitario'>[] }) => {
    return axios.post(`${API_URL}/consumos`, data);
};

const PagamentosPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [items, setItems] = useState<ConsumoItem[]>([]);
    const [itemToAdd, setItemToAdd] = useState<{ tipo: string; id: string }>({ tipo: '', id: '' });
    const [quantity, setQuantity] = useState(1);

    // Queries para buscar os dados iniciais
    const { data: clientes } = useQuery({ queryKey: ['clientes'], queryFn: fetchClientes });
    const { data: produtos } = useQuery({ queryKey: ['produtos'], queryFn: fetchProdutos });
    const { data: servicos } = useQuery({ queryKey: ['servicos'], queryFn: fetchServicos });

    const consumoMutation = useMutation({
        mutationFn: postConsumo,
        onSuccess: () => {
            alert('Consumo registado com sucesso!');
            setItems([]);
            setSelectedClientId(null);
            queryClient.invalidateQueries({ queryKey: ['produtos'] }); // Para atualizar o estoque
        },
        onError: () => {
            alert('Erro ao registar o consumo.');
        }
    });

    const handleAddItem = () => {
        if (!itemToAdd.id || !itemToAdd.tipo) return;

        const { tipo, id } = itemToAdd;
        const itemId = parseInt(id);
        let itemDetails;
        if (tipo === 'produto') {
            itemDetails = produtos?.find(p => p.id === itemId);
        } else {
            itemDetails = servicos?.find(s => s.id === itemId);
        }

        if (itemDetails) {
            const newItem: ConsumoItem = {
                tipo: tipo as 'produto' | 'servico',
                id: itemId,
                nome: itemDetails.nome,
                quantidade: quantity,
                precoUnitario: itemDetails.preco
            };
            setItems(prevItems => [...prevItems, newItem]);
        }
    };
    
    const handleSubmit = () => {
        if (!selectedClientId || items.length === 0) {
            alert('Por favor, selecione um cliente e adicione pelo menos um item.');
            return;
        }
        const dataToPost = {
            clienteId: selectedClientId,
            items: items.map(({ tipo, id, quantidade }) => ({ tipo, id, quantidade }))
        };
        consumoMutation.mutate(dataToPost);
    };

    const totalCost = items.reduce((total, item) => total + (item.precoUnitario * item.quantidade), 0);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Registo de Consumo</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Novo Registo</h2>
                
                {/* Selecionar Cliente */}
                <div className="mb-4">
                    <label htmlFor="cliente-select" className="form-label">1. Selecione o Cliente</label>
                    <select id="cliente-select" className="form-select" onChange={e => setSelectedClientId(parseInt(e.target.value))}>
                        <option value="">Selecione...</option>
                        {clientes?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
                
                {/* Adicionar Itens */}
                <div className="mb-4">
                    <label className="form-label">2. Adicione Produtos ou Serviços</label>
                    <div className="row g-2 align-items-end">
                        <div className="col-md-5">
                            <select className="form-select" onChange={e => { const [tipo, id] = e.target.value.split('-'); setItemToAdd({ tipo, id }); }}>
                                <option value="">Selecione um item...</option>
                                <optgroup label="Produtos">
                                    {produtos?.map(p => <option key={`p-${p.id}`} value={`produto-${p.id}`}>{p.nome}</option>)}
                                </optgroup>
                                <optgroup label="Serviços">
                                    {servicos?.map(s => <option key={`s-${s.id}`} value={`servico-${s.id}`}>{s.nome}</option>)}
                                </optgroup>
                            </select>
                        </div>
                        <div className="col-md-3">
                             <input type="number" className="form-control" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} min="1" placeholder="Quantidade" />
                        </div>
                        <div className="col-md-4">
                            <button className="btn btn-outline-secondary w-100" type="button" onClick={handleAddItem}>Adicionar Item</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Consumo Atual */}
            {items.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-3">Itens a serem registados para: {clientes?.find(c=>c.id === selectedClientId)?.nome}</h3>
                    <table className="table">
                        <thead><tr><th>Item</th><th>Quantidade</th><th>Preço Unit.</th><th>Subtotal</th></tr></thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.nome}</td>
                                    <td>{item.quantidade}</td>
                                    <td>R$ {item.precoUnitario.toFixed(2)}</td>
                                    <td>R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="fw-bold">
                                <td colSpan={3} className="text-end">Total</td>
                                <td>R$ {totalCost.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <div className="d-grid">
                        <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={consumoMutation.isPending}>
                            {consumoMutation.isPending ? 'A registar...' : 'Confirmar e Registar Consumo'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagamentosPage;
