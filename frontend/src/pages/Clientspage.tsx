import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import EditClientModal from '../components/editClientmodal'; 

const API_URL = 'http://localhost:3001/api';

interface Client {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  pets?: any[]; 
}

interface Pet {
    nome: string;
    tipo: string;
    raca: string;
}

interface NewClientData {
    nome: string;
    email: string;
    telefone: string | null;
    pet: Pet;
}

// --- Funções da API ---
const fetchClients = async (): Promise<Client[]> => (await axios.get(`${API_URL}/clientes`)).data;
const createClient = async (data: NewClientData) => (await axios.post(`${API_URL}/clientes`, data)).data;
const updateClient = async (client: Client) => (await axios.put(`${API_URL}/clientes/${client.id}`, client)).data;
const deleteClient = async (id: number) => (await axios.delete(`${API_URL}/clientes/${id}`));

const ClientsPage: React.FC = () => {
    const queryClient = useQueryClient();
    // Estado para o cliente
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    // Estado para o pet
    const [petNome, setPetNome] = useState('');
    const [petTipo, setPetTipo] = useState('');
    const [petRaca, setPetRaca] = useState('');
    
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const { data: clients, error, isLoading, isError } = useQuery<Client[], Error>({
        queryKey: ['clients'],
        queryFn: fetchClients,
    });

    const invalidateAndReset = () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] });
    };

    const createMutation = useMutation({ mutationFn: createClient, onSuccess: () => {
        invalidateAndReset();
        setNome(''); setEmail(''); setTelefone('');
        setPetNome(''); setPetTipo(''); setPetRaca('');
    }});
    const updateMutation = useMutation({ mutationFn: updateClient, onSuccess: () => {
        invalidateAndReset();
        setShowEditModal(false);
    }});
    const deleteMutation = useMutation({ mutationFn: deleteClient, onSuccess: invalidateAndReset });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ 
            nome, 
            email, 
            telefone, 
            pet: { nome: petNome, tipo: petTipo, raca: petRaca }
        });
    };

    const handleEditClick = (client: Client) => {
        setEditingClient(client);
        setShowEditModal(true);
    };

    const handleSaveEdit = (client: Client) => {
        updateMutation.mutate(client);
    };

    const handleDeleteClick = (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir este cliente?')) {
            deleteMutation.mutate(id);
        }
    };
    
    if (isLoading) return <div>A carregar clientes...</div>;
    if (isError) return <div>Erro ao carregar dados: {error.message}</div>;

    return (
        <>
            <EditClientModal 
                show={showEditModal} 
                handleClose={() => setShowEditModal(false)} 
                client={editingClient}
                onSave={handleSaveEdit}
            />

            <div>
                <h1 className="text-3xl font-bold mb-6">Gestão de Clientes</h1>
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Adicionar Novo Cliente e Pet</h2>
                    <form onSubmit={handleCreateSubmit} className="row g-3">
                        <div className="col-12"><h5 className="mb-3 border-bottom pb-2">Dados do Cliente</h5></div>
                        <div className="col-md-5"><input type="text" placeholder="Nome do Cliente" value={nome} onChange={(e) => setNome(e.target.value)} className="form-control" required /></div>
                        <div className="col-md-4"><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" required /></div>
                        <div className="col-md-3"><input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="form-control" /></div>

                        <div className="col-12 mt-4"><h5 className="mb-3 border-bottom pb-2">Dados do Pet (Obrigatório)</h5></div>
                        <div className="col-md-4"><input type="text" placeholder="Nome do Pet" value={petNome} onChange={(e) => setPetNome(e.target.value)} className="form-control" required /></div>
                        <div className="col-md-4"><input type="text" placeholder="Tipo (ex: Cachorro)" value={petTipo} onChange={(e) => setPetTipo(e.target.value)} className="form-control" required /></div>
                        <div className="col-md-4"><input type="text" placeholder="Raça (ex: Golden Retriever)" value={petRaca} onChange={(e) => setPetRaca(e.target.value)} className="form-control" required /></div>

                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-primary w-100" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'A adicionar...' : 'Adicionar Cliente e Pet'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Cliente / Pets</th>
                                <th>Email</th>
                                <th>Telefone</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients?.map((client: Client) => (
                                <tr key={client.id}>
                                    <td>
                                        <div className="fw-bold">{client.nome}</div>
                                        <div className="small text-muted">
                                            {client.pets?.map(p => p.nome).join(', ') || 'Nenhum pet registado.'}
                                        </div>
                                    </td>
                                    <td>{client.email}</td>
                                    <td>{client.telefone || '-'}</td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditClick(client)}>Editar</button>
                                        <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleDeleteClick(client.id)}>Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ClientsPage;
