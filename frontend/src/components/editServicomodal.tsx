import { useEffect, useState } from 'react';
import { Modal as ServiceModal, Button as ServiceButton, Form as ServiceForm } from 'react-bootstrap';

interface Servico {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
}

interface EditServiceModalProps {
  show: boolean;
  handleClose: () => void;
  servico: Servico | null;
  onSave: (servico: Servico) => void;
}

export const EditServiceModal: React.FC<EditServiceModalProps> = ({ show, handleClose, servico, onSave }) => {
    const [nome, setNomeS] = useState('');
    const [descricao, setDescricaoS] = useState('');
    const [preco, setPrecoS] = useState(0);

    useEffect(() => {
        if (servico) {
            setNomeS(servico.nome);
            setDescricaoS(servico.descricao || '');
            setPrecoS(servico.preco);
        }
    }, [servico]);

    const handleSave = () => {
        if (servico) {
            onSave({ ...servico, nome, descricao, preco });
        }
    };

    return (
        <ServiceModal show={show} onHide={handleClose}>
            <ServiceModal.Header closeButton><ServiceModal.Title>Editar Serviço</ServiceModal.Title></ServiceModal.Header>
            <ServiceModal.Body>
                <ServiceForm>
                    <ServiceForm.Group className="mb-3"><ServiceForm.Label>Nome</ServiceForm.Label><ServiceForm.Control type="text" value={nome} onChange={(e) => setNomeS(e.target.value)} /></ServiceForm.Group>
                    <ServiceForm.Group className="mb-3"><ServiceForm.Label>Descrição</ServiceForm.Label><ServiceForm.Control type="text" value={descricao} onChange={(e) => setDescricaoS(e.target.value)} /></ServiceForm.Group>
                    <ServiceForm.Group className="mb-3"><ServiceForm.Label>Preço</ServiceForm.Label><ServiceForm.Control type="number" value={preco} onChange={(e) => setPrecoS(parseFloat(e.target.value) || 0)} /></ServiceForm.Group>
                </ServiceForm>
            </ServiceModal.Body>
            <ServiceModal.Footer>
                <ServiceButton variant="secondary" onClick={handleClose}>Cancelar</ServiceButton>
                <ServiceButton variant="primary" onClick={handleSave}>Guardar Alterações</ServiceButton>
            </ServiceModal.Footer>
        </ServiceModal>
    );
};