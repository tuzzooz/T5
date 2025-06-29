import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { EditPetModal } from '../components/editPetmodal';

const API_URL = 'http://localhost:3001/api';

// Interfaces
interface Pet { id: number; nome: string; tipo: string; raca: string; donoId: number; }
interface Cliente { id: number; nome: string; pets?: Pet[]; }

// Funções da API
const fetchClientesComPets = async (): Promise<Cliente[]> => (await axios.get(`${API_URL}/clientes`)).data;
const createPet = async (data: Omit<Pet, 'id'>) => (await axios.post(`${API_URL}/pets`, data)).data;
const updatePet = async (data: Pet) => (await axios.put(`${API_URL}/pets/${data.id}`, data)).data;
const deletePet = async (id: number) => (await axios.delete(`${API_URL}/pets/${id}`));

const PetsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const [raca, setRaca] = useState('');
    const [donoId, setDonoId] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);

    const { data: clientes, isLoading } = useQuery({ queryKey: ['clientesComPets'], queryFn: fetchClientesComPets });
    const { mutate: createMutate, isPending } = useMutation({ mutationFn: createPet, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientesComPets'] }) });
    const { mutate: updateMutate } = useMutation({ mutationFn: updatePet, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clientesComPets'] }); setShowEditModal(false); } });
    const { mutate: deleteMutate } = useMutation({ mutationFn: deletePet, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientesComPets'] }) });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutate({ nome, tipo, raca, donoId: parseInt(donoId) });
    };
    const handleEditClick = (pet: Pet) => { setEditingPet(pet); setShowEditModal(true); };
    const handleDeleteClick = (id: number) => { if (window.confirm('Tem a certeza que deseja excluir este pet?')) deleteMutate(id); };
    
    if (isLoading) return <div>A carregar...</div>;

    const allPets = clientes?.flatMap(cliente => cliente.pets?.map(pet => ({ ...pet, donoNome: cliente.nome })) || []) || [];

    return (
        <>
            <EditPetModal show={showEditModal} handleClose={() => setShowEditModal(false)} pet={editingPet} onSave={updateMutate} />
            <h1 className="text-3xl font-bold mb-6">Gestão de Pets</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Adicionar Novo Pet</h2>
                <form onSubmit={handleCreateSubmit} className="row g-3">
                    <div className="col-md-3"><input type="text" placeholder="Nome do Pet" value={nome} onChange={(e) => setNome(e.target.value)} className="form-control" required/></div>
                    <div className="col-md-3"><input type="text" placeholder="Tipo (ex: Cão)" value={tipo} onChange={(e) => setTipo(e.target.value)} className="form-control" required/></div>
                    <div className="col-md-3"><input type="text" placeholder="Raça" value={raca} onChange={(e) => setRaca(e.target.value)} className="form-control" required/></div>
                    <div className="col-md-3">
                        <select className="form-select" value={donoId} onChange={(e) => setDonoId(e.target.value)} required>
                            <option value="">Selecione um Dono</option>
                            {clientes?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>
                    <div className="col-12"><button type="submit" className="btn btn-primary w-100" disabled={isPending}>{isPending ? 'A adicionar...' : 'Adicionar Pet'}</button></div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr><th>Nome do Pet</th><th>Tipo</th><th>Raça</th><th>Dono</th><th className="text-end">Ações</th></tr>
                    </thead>
                    <tbody>
                        {allPets.map((pet) => (
                            <tr key={pet.id}>
                                <td>{pet.nome}</td>
                                <td>{pet.tipo}</td>
                                <td>{pet.raca}</td>
                                <td>{pet.donoNome}</td>
                                <td className="text-end">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditClick(pet)}>Editar</button>
                                    <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleDeleteClick(pet.id)}>Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};
export default PetsPage;

