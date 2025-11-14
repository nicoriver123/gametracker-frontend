import { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserTag, FaLock } from 'react-icons/fa';
import { useAuth } from '../../context/useAuth';
import GoogleAuthButton from './GoogleAuthButton';
import authService from '../../api/authService';
import toast from 'react-hot-toast';
import './Auth.css';

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    contraseña: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setNeedsVerification(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El username es requerido';
    }

    if (!formData.contraseña) {
      newErrors.contraseña = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      if (error.needsVerification) {
        setNeedsVerification(true);
        setUserEmail(error.email || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail) {
      toast.error('No se pudo obtener el email');
      return;
    }

    try {
      await authService.resendVerification(userEmail);
      toast.success('Email de verificación reenviado');
    } catch (error) {
      toast.error(error.message || 'Error al reenviar email');
    }
  };

  return (
    <Container className="auth-container">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="auth-card shadow-lg">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="auth-title">Iniciar Sesión</h2>
                <p className="text-muted">Bienvenido de nuevo a GameTracker</p>
              </div>

              {needsVerification && (
                <Alert variant="warning" className="mb-4">
                  <Alert.Heading>Email no verificado</Alert.Heading>
                  <p>
                    Por favor verifica tu email antes de iniciar sesión.
                    ¿No recibiste el email?
                  </p>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={handleResendVerification}
                  >
                    Reenviar Email de Verificación
                  </Button>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Username */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUserTag className="me-2" />
                    Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Tu username"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={!!errors.username}
                    disabled={loading}
                    autoFocus
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Contraseña */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaLock className="me-2" />
                    Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="contraseña"
                    placeholder="Tu contraseña"
                    value={formData.contraseña}
                    onChange={handleChange}
                    isInvalid={!!errors.contraseña}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.contraseña}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-end mb-3">
                  <Link to="/forgot-password" className="auth-link text-sm">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 auth-btn mb-3"
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </Form>

              <div className="text-center my-3">
                <span className="text-muted">o</span>
              </div>

              <GoogleAuthButton disabled={loading} />

              <div className="text-center mt-4">
                <p className="text-muted">
                  ¿No tienes cuenta?{' '}
                  <Link to="/register" className="auth-link">
                    Regístrate
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginForm;