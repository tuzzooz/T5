import { Card, Row, Col } from 'react-bootstrap';

const Home = () => (
  <div className="d-flex justify-content-center mt-4">
    <Card style={{ width: '80%', maxWidth: 900 }}>
      <Card.Header className="bg-primary text-white fs-3 fw-bold">
        Sistema Pet Lovers
      </Card.Header>
      <Card.Body>
        <h4 className="text-center mb-3 fw-bold">Bem-vindo ao Sistema Pet Lovers</h4>
        <p className="text-center text-muted mb-4">
          Gerencie clientes, produtos, serviços e pagamentos de forma simples e eficiente.
        </p>
        <Row className="g-3">
          <Col md={3} xs={12}>
            <Card className="h-100 text-center">
              <Card.Body>
                <Card.Title className="fw-bold">Clientes</Card.Title>
                <Card.Text>Cadastre e gerencie seus clientes</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} xs={12}>
            <Card className="h-100 text-center">
              <Card.Body>
                <Card.Title className="fw-bold">Produtos</Card.Title>
                <Card.Text>Controle seu estoque de produtos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} xs={12}>
            <Card className="h-100 text-center">
              <Card.Body>
                <Card.Title className="fw-bold">Serviços</Card.Title>
                <Card.Text>Gerencie serviços oferecidos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} xs={12}>
            <Card className="h-100 text-center">
              <Card.Body>
                <Card.Title className="fw-bold">Pagamentos</Card.Title>
                <Card.Text>Processe pagamentos dos clientes</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  </div>
);
export default Home;
