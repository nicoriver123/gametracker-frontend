import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import authService from "../api/authService";
import toast from "react-hot-toast";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    contraseña: "",
    confirmarContraseña: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwords.contraseña || !passwords.confirmarContraseña) {
      toast.error("Completa ambos campos");
      return;
    }

    if (passwords.contraseña !== passwords.confirmarContraseña) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, passwords);
      toast.success("Contraseña actualizada. Ahora puedes iniciar sesión.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Error al resetear contraseña");
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
                <h2 className="auth-title">Restablecer Contraseña</h2>
                <p className="text-muted">Ingresa tu nueva contraseña</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="contraseña"
                    value={passwords.contraseña}
                    onChange={handleChange}
                    placeholder="Nueva contraseña"
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmarContraseña"
                    value={passwords.confirmarContraseña}
                    onChange={handleChange}
                    placeholder="Confirma tu contraseña"
                    disabled={loading}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 auth-btn"
                  disabled={loading}
                >
                  {loading ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <Link to="/login" className="auth-link">
                  Volver al login
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ResetPassword;
