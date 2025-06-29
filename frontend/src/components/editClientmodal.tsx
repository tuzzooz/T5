import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface Client {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
}

interface EditClientModalProps {
  show: boolean;
  handleClose: () => void;
  client: Client | null;
  onSave: (client: Client) => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ show, handleClose, client, onSave }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    if (client) {
      setNome(client.nome);
      setEmail(client.email);
      setTelefone(client.telefone || '');
    }
  }, [client]);

  const handleSave = () => {
    if (client) {
      onSave({
        ...client,
        nome,
        email,
        telefone,
      });
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Telefone</Form.Label>
            <Form.Control type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar Alterações
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditClientModal;