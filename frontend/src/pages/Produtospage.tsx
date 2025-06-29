import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { EditProductModal } from '../components/editProdutomodal';

const API_URL = 'http://localhost:3001/api';

interface Produto { id: number; nome: string; descricao: string | null; preco: number; estoque: number; }

const fetchProdutos = async (): Promise<Produto[]> => (await axios.get(`${API_URL}/produtos`)).data;
const createProduto = async (data: Omit<Produto, 'id'>) => (await axios.post(`${API_URL}/produtos`, data)).data;
const updateProduto = async (data: Produto) => (await axios.put(`${API_URL}/produtos/${data.id}`, data)).data;
const deleteProduto = async (id: number) => (await axios.delete(`${API_URL}/produtos/${id}`));

const ProdutosPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [estoque, setEstoque] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

    const { data: produtos, isLoading } = useQuery({ queryKey: ['produtos'], queryFn: fetchProdutos });
    
    const invalidateAndReset = () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    }

    const { mutate: createMutate, isPending: isCreating } = useMutation({ mutationFn: createProduto, onSuccess: () => {
        invalidateAndReset();
        setNome(''); setDescricao(''); setPreco(''); setEstoque('');
    }});
    const { mutate: updateMutate } = useMutation({ mutationFn: updateProduto, onSuccess: () => {
        invalidateAndReset();
        setShowEditModal(false);
    }});
    const { mutate: deleteMutate } = useMutation({ mutationFn: deleteProduto, onSuccess: invalidateAndReset });
    
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutate({ nome, descricao, preco: parseFloat(preco), estoque: parseInt(estoque) });
    };
    const handleEditClick = (produto: Produto) => { setEditingProduto(produto); setShowEditModal(true); };
    const handleDeleteClick = (id: number) => { if (window.confirm('Tem a certeza que deseja excluir este produto?')) deleteMutate(id); };
    
    if (isLoading) return <div>A carregar...</div>;

    return (
        <>
            <EditProductModal show={showEditModal} handleClose={() => setShowEditModal(false)} produto={editingProduto} onSave={updateMutate} />
            
            <h1 className="text-3xl font-bold mb-6">Gestão de Produtos</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Adicionar Novo Produto</h2>
                <form onSubmit={handleCreateSubmit} className="row g-3">
                    <div className="col-md-3"><input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="form-control" required/></div>
                    <div className="col-md-4"><input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="form-control"/></div>
                    <div className="col-md-2"><input type="number" step="0.01" placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} className="form-control" required/></div>
                    <div className="col-md-1"><input type="number" placeholder="Estoque" value={estoque} onChange={(e) => setEstoque(e.target.value)} className="form-control" required/></div>
                    <div className="col-md-2"><button type="submit" className="btn btn-primary w-100" disabled={isCreating}>{isCreating ? 'A adicionar...' : 'Adicionar'}</button></div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr><th>Nome</th><th>Preço</th><th>Estoque</th><th className="text-end">Ações</th></tr>
                    </thead>
                    <tbody>
                        {produtos?.map((produto: Produto) => (
                            <tr key={produto.id}>
                                <td>{produto.nome}</td>
                                <td>R$ {produto.preco.toFixed(2)}</td>
                                <td>{produto.estoque}</td>
                                <td className="text-end">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditClick(produto)}>Editar</button>
                                    <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleDeleteClick(produto.id)}>Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ProdutosPage;