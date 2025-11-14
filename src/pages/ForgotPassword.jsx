import { useState } from "react";
import { Form, Button, Container, Row, Col, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import authService from "../api/authService";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setSubmitted(true);
      toast.success("Si el email existe, recibirás instrucciones pronto");
    } catch (error) {
      toast.error(error.message || "Error al solicitar reseteo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="auth-card shadow-lg">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="auth-title">Recuperar Contraseña</h2>
                <p className="text-muted">
                  Ingresa tu email para recibir un enlace de restablecimiento.
                </p>
              </div>

              {submitted ? (
                <Alert variant="success">
                  <strong>¡Correo enviado!</strong> Si tu email está registrado, 
                  recibirás un enlace para restablecer tu contraseña.
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tuemail@ejemplo.com"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 auth-btn"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar enlace"}
                  </Button>
                </Form>
              )}

              <div className="text-center mt-3">
                <Link to="/login" className="auth-link">
                  Volver al inicio de sesión
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPassword;
