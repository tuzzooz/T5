import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
}

interface EditProductModalProps {
  show: boolean;
  handleClose: () => void;
  produto: Produto | null;
  onSave: (produto: Produto) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ show, handleClose, produto, onSave }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState(0);
  const [estoque, setEstoque] = useState(0);

  useEffect(() => {
    if (produto) {
      setNome(produto.nome);
      setDescricao(produto.descricao || '');
      setPreco(produto.preco);
      setEstoque(produto.estoque);
    }
  }, [produto]);

  const handleSave = () => {
    if (produto) {
      onSave({ ...produto, nome, descricao, preco, estoque });
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton><Modal.Title>Editar Produto</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3"><Form.Label>Nome</Form.Label><Form.Control type="text" value={nome} onChange={(e) => setNome(e.target.value)} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Descrição</Form.Label><Form.Control type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Preço</Form.Label><Form.Control type="number" value={preco} onChange={(e) => setPreco(parseFloat(e.target.value) || 0)} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Estoque</Form.Label><Form.Control type="number" value={estoque} onChange={(e) => setEstoque(parseInt(e.target.value, 10) || 0)} /></Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave}>Guardar Alterações</Button>
      </Modal.Footer>
    </Modal>
  );
};
