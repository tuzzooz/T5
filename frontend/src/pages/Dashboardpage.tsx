import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Interfaces
interface TopCliente { clienteId: number; clienteNome: string; totalQuantidade?: number | null; totalValor?: number | null; }
interface TopItem { nome: string; quantidade: number | null; }
interface TopItensResponse { produtos: TopItem[]; servicos: TopItem[]; }
interface TopItensPorPet { [key: string]: { [key: string]: number } }

// Funções de fetch
const fetchTopClientesQnt = async (): Promise<TopCliente[]> => (await axios.get(`${API_URL}/relatorios/top-clientes-quantidade`)).data;
const fetchTopClientesValor = async (): Promise<TopCliente[]> => (await axios.get(`${API_URL}/relatorios/top-clientes-valor`)).data;
const fetchTopItens = async (): Promise<TopItensResponse> => (await axios.get(`${API_URL}/relatorios/top-itens-consumidos`)).data;
const fetchTopItensPorPet = async (): Promise<TopItensPorPet> => (await axios.get(`${API_URL}/relatorios/top-itens-por-pet`)).data;

const DashboardPage: React.FC = () => {
    const { data: topClientesQnt, isLoading: loading1 } = useQuery<TopCliente[], Error>({ queryKey: ['topClientesQnt'], queryFn: fetchTopClientesQnt });
    const { data: topClientesValor, isLoading: loading2 } = useQuery<TopCliente[], Error>({ queryKey: ['topClientesValor'], queryFn: fetchTopClientesValor });
    const { data: topItens, isLoading: loading3 } = useQuery<TopItensResponse, Error>({ queryKey: ['topItens'], queryFn: fetchTopItens });
    const { data: topItensPorPet, isLoading: loading4 } = useQuery<TopItensPorPet, Error>({ queryKey: ['topItensPorPet'], queryFn: fetchTopItensPorPet });

    if (loading1 || loading2 || loading3 || loading4) return <div>A carregar relatórios...</div>;

    const isEmpty = (data: any) => !data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard de Relatórios</h1>
            
            <div className="row">
                <div className="col-lg-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header"><h5 className="mb-0">Top 10 Clientes (Quantidade)</h5></div>
                        <ul className="list-group list-group-flush">
                            {!isEmpty(topClientesQnt) ? topClientesQnt?.map((c, i) => (
                                <li key={c.clienteId} className="list-group-item d-flex justify-content-between"><span>{i + 1}. {c.clienteNome}</span> <span className="badge bg-primary rounded-pill">{c.totalQuantidade} itens</span></li>
                            )) : <li className="list-group-item text-muted">Nenhum dado de consumo para exibir.</li>}
                        </ul>
                    </div>
                </div>
                 <div className="col-lg-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header"><h5 className="mb-0">Top 5 Clientes (Valor Gasto)</h5></div>
                         <ul className="list-group list-group-flush">
                            {!isEmpty(topClientesValor) ? topClientesValor?.map((c, i) => (
                                <li key={c.clienteId} className="list-group-item d-flex justify-content-between"><span>{i + 1}. {c.clienteNome}</span> <span className="badge bg-warning text-dark rounded-pill">R$ {c.totalValor?.toFixed(2)}</span></li>
                            )) : <li className="list-group-item text-muted">Nenhum dado de consumo para exibir.</li>}
                        </ul>
                    </div>
                </div>
                <div className="col-lg-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header"><h5 className="mb-0">Itens Mais Consumidos</h5></div>
                        <div className="card-body">
                            <h6>Produtos</h6>
                            <ul className="list-group">
                                {!isEmpty(topItens?.produtos) ? topItens?.produtos.map((item, i) => ( <li key={i} className="list-group-item d-flex justify-content-between">{item.nome} <span className="badge bg-success rounded-pill">{item.quantidade} un.</span></li> ))
                                : <li className="list-group-item text-muted">Nenhum produto consumido.</li>}
                            </ul>
                            <h6 className="mt-3">Serviços</h6>
                            <ul className="list-group">
                                {!isEmpty(topItens?.servicos) ? topItens?.servicos.map((item, i) => ( <li key={i} className="list-group-item d-flex justify-content-between">{item.nome} <span className="badge bg-info text-dark rounded-pill">{item.quantidade} vezes</span></li> ))
                                : <li className="list-group-item text-muted">Nenhum serviço consumido.</li>}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header"><h5 className="mb-0">Consumo por Tipo e Raça de Pet</h5></div>
                        <div className="card-body" style={{maxHeight: '400px', overflowY: 'auto'}}>
                            {!isEmpty(topItensPorPet) ? Object.entries(topItensPorPet!).map(([petKey, items]) => (
                                <div key={petKey}>
                                    <h6 className="mt-2 border-top pt-2"><strong>{petKey}</strong></h6>
                                    <ul className="list-unstyled ps-3">
                                        {Object.entries(items).map(([itemName, quantity]) => (
                                            <li key={itemName} className="d-flex justify-content-between"><span>{itemName}</span> <span>{quantity}x</span></li>
                                        ))}
                                    </ul>
                                </div>
                            )) : <div className="text-muted">Nenhum consumo associado a pets.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;