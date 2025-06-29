import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface PetToEdit { id: number; nome: string; tipo: string; raca: string; donoId: number; }

interface EditPetModalProps {
  show: boolean;
  handleClose: () => void;
  pet: PetToEdit | null;
  onSave: (pet: PetToEdit) => void;
}

export const EditPetModal: React.FC<EditPetModalProps> = ({ show, handleClose, pet, onSave }) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [raca, setRaca] = useState('');

  useEffect(() => {
    if (pet) {
      setNome(pet.nome);
      setTipo(pet.tipo);
      setRaca(pet.raca);
    }
  }, [pet]);

  const handleSave = () => {
    if (pet) {
      onSave({ ...pet, nome, tipo, raca });
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton><Modal.Title>Editar Pet</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3"><Form.Label>Nome</Form.Label><Form.Control type="text" value={nome} onChange={(e) => setNome(e.target.value)} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Tipo</Form.Label><Form.Control type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Raça</Form.Label><Form.Control type="text" value={raca} onChange={(e) => setRaca(e.target.value)} /></Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave}>Guardar Alterações</Button>
      </Modal.Footer>
    </Modal>
  );
};