import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { EditServiceModal } from '../components/editServicomodal';

const API_URL_SERVICOS = 'http://localhost:3001/api';

interface Servico { id: number; nome: string; descricao: string | null; preco: number; }

const fetchServicos = async (): Promise<Servico[]> => (await axios.get(`${API_URL_SERVICOS}/servicos`)).data;
const createServico = async (data: Omit<Servico, 'id'>) => (await axios.post(`${API_URL_SERVICOS}/servicos`, data)).data;
const updateServico = async (data: Servico) => (await axios.put(`${API_URL_SERVICOS}/servicos/${data.id}`, data)).data;
const deleteServico = async (id: number) => (await axios.delete(`${API_URL_SERVICOS}/servicos/${id}`));

const ServicosPage: React.FC = () => {
    const queryClientS = useQueryClient();
    const [nomeS, setNomeS] = useState('');
    const [descricaoS, setDescricaoS] = useState('');
    const [precoS, setPrecoS] = useState('');
    const [showEditModalS, setShowEditModalS] = useState(false);
    const [editingServico, setEditingServico] = useState<Servico | null>(null);

    const { data: servicos, isLoading: isLoadingS } = useQuery({ queryKey: ['servicos'], queryFn: fetchServicos });
    const { mutate: createMutateS, isPending: isCreatingS } = useMutation({ mutationFn: createServico, onSuccess: () => {
        queryClientS.invalidateQueries({queryKey:['servicos']});
        setNomeS(''); setDescricaoS(''); setPrecoS('');
    }});
    const { mutate: updateMutateS } = useMutation({ mutationFn: updateServico, onSuccess: () => {
        queryClientS.invalidateQueries({queryKey:['servicos']});
        setShowEditModalS(false);
    }});
    const { mutate: deleteMutateS } = useMutation({ mutationFn: deleteServico, onSuccess: () => queryClientS.invalidateQueries({queryKey:['servicos']}) });
    
    const handleCreateSubmitS = (e: React.FormEvent) => {
        e.preventDefault();
        createMutateS({ nome: nomeS, descricao: descricaoS, preco: parseFloat(precoS) });
    };
    const handleEditClickS = (servico: Servico) => { setEditingServico(servico); setShowEditModalS(true); };
    const handleDeleteClickS = (id: number) => { if (window.confirm('Excluir este serviço?')) deleteMutateS(id); };
    
    if (isLoadingS) return <div>A carregar...</div>;

    return (
        <>
            <EditServiceModal show={showEditModalS} handleClose={() => setShowEditModalS(false)} servico={editingServico} onSave={updateMutateS} />

            <h1 className="text-3xl font-bold mb-6">Gestão de Serviços</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Adicionar Novo Serviço</h2>
                <form onSubmit={handleCreateSubmitS} className="row g-3">
                    <div className="col-md-5"><input type="text" placeholder="Nome" value={nomeS} onChange={(e) => setNomeS(e.target.value)} className="form-control" required/></div>
                    <div className="col-md-4"><input type="text" placeholder="Descrição" value={descricaoS} onChange={(e) => setDescricaoS(e.target.value)} className="form-control"/></div>
                    <div className="col-md-2"><input type="number" step="0.01" placeholder="Preço" value={precoS} onChange={(e) => setPrecoS(e.target.value)} className="form-control" required/></div>
                    <div className="col-md-1"><button type="submit" className="btn btn-primary w-100" disabled={isCreatingS}>{isCreatingS ? '...' : 'Add'}</button></div>
                </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr><th>Nome</th><th>Descrição</th><th>Preço</th><th className="text-end">Ações</th></tr>
                    </thead>
                    <tbody>
                        {servicos?.map((servico: Servico) => (
                            <tr key={servico.id}>
                                <td>{servico.nome}</td>
                                <td>{servico.descricao || '-'}</td>
                                <td>R$ {servico.preco.toFixed(2)}</td>
                                <td className="text-end">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditClickS(servico)}>Editar</button>
                                    <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleDeleteClickS(servico.id)}>Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ServicosPage;