import { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaUserTag } from 'react-icons/fa';
import { useAuth } from '../../context/useAuth';
import GoogleAuthButton from './GoogleAuthButton';
import './Auth.css';

function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    nombre: '',
    email: '',
    contraseña: '',
    confirmarContraseña: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username
    if (!formData.username.trim()) {
      newErrors.username = 'El username es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El username debe tener al menos 3 caracteres';
    }

    // Nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    // Email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Contraseña
    if (!formData.contraseña) {
      newErrors.contraseña = 'La contraseña es requerida';
    } else if (formData.contraseña.length < 6) {
      newErrors.contraseña = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Confirmar contraseña
    if (!formData.confirmarContraseña) {
      newErrors.confirmarContraseña = 'Debes confirmar la contraseña';
    } else if (formData.contraseña !== formData.confirmarContraseña) {
      newErrors.confirmarContraseña = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register(formData);
      setShowSuccess(true);
      // Limpiar formulario
      setFormData({
        username: '',
        nombre: '',
        email: '',
        contraseña: '',
        confirmarContraseña: '',
      });
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error en registro:', error);
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
                <h2 className="auth-title">Crear Cuenta</h2>
                <p className="text-muted">Únete a GameTracker</p>
              </div>

              {showSuccess && (
                <Alert variant="success" className="mb-4">
                  <Alert.Heading>¡Registro exitoso!</Alert.Heading>
                  <p>
                    Por favor revisa tu email para verificar tu cuenta.
                    Serás redirigido al login en unos segundos...
                  </p>
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
                    placeholder="Elige un username único"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={!!errors.username}
                    disabled={loading || showSuccess}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Nombre */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-2" />
                    Nombre Completo
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre completo"
                    value={formData.nombre}
                    onChange={handleChange}
                    isInvalid={!!errors.nombre}
                    disabled={loading || showSuccess}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nombre}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaEnvelope className="me-2" />
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    disabled={loading || showSuccess}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
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
                    placeholder="Mínimo 6 caracteres"
                    value={formData.contraseña}
                    onChange={handleChange}
                    isInvalid={!!errors.contraseña}
                    disabled={loading || showSuccess}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.contraseña}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Confirmar Contraseña */}
                <Form.Group className="mb-4">
                  <Form.Label>
                    <FaLock className="me-2" />
                    Confirmar Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmarContraseña"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmarContraseña}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmarContraseña}
                    disabled={loading || showSuccess}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmarContraseña}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 auth-btn mb-3"
                  disabled={loading || showSuccess}
                >
                  {loading ? 'Registrando...' : 'Crear Cuenta'}
                </Button>
              </Form>

              <div className="text-center my-3">
                <span className="text-muted">o</span>
              </div>

              <GoogleAuthButton disabled={loading || showSuccess} />

              <div className="text-center mt-4">
                <p className="text-muted">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="auth-link">
                    Inicia Sesión
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

export default RegisterForm;