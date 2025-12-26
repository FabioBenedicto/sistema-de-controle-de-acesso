import React, { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { useSession } from '@hooks/useSession';

export function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useSession();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    const form = event.currentTarget;
    const protocolInput = form.elements.namedItem(
      'protocol',
    ) as HTMLInputElement;
    const passwordInput = form.elements.namedItem(
      'password',
    ) as HTMLInputElement;

    const body = {
      protocol: protocolInput.value,
      password: passwordInput.value,
    };

    try {
      await login(body);
      form.clear();
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    }

    setIsLoading(false);
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center min-vh-100 bg-light"
    >
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="p-4 shadow-lg bg-white rounded">
            <div className="text-center mb-4">
              <h3 className="mb-0 text-success">Sistema</h3>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="protocol">Protocolo</Form.Label>
                <Form.Control type="text" id="protocol" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="password">Senha</Form.Label>
                <Form.Control type="password" id="password" required />
              </Form.Group>
              <Button
                type="submit"
                variant="success"
                className="w-100 mt-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
