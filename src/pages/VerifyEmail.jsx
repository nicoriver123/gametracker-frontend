import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Spinner, Button } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import authService from '../api/authService';

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
  const verifyEmailToken = async () => {
    try {
      const response = await authService.verifyEmail(token);
      setStatus('success');
      setMessage(response.message || 'Email verificado exitosamente');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Error al verificar el email');
    }
  };

  verifyEmailToken();
}, [token, navigate]);


  return (
    <Container className="auth-container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <Card className="auth-card shadow-lg text-center">
            <Card.Body className="p-5">
              {status === 'loading' && (
                <>
                  <Spinner animation="border" variant="primary" className="mb-3" />
                  <h3>Verificando email...</h3>
                  <p className="text-muted">Por favor espera un momento</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <FaCheckCircle size={60} className="text-success mb-3" />
                  <h3 className="text-success">¡Verificación Exitosa!</h3>
                  <p className="text-muted mb-4">{message}</p>
                  <p className="text-muted">Serás redirigido al login en unos segundos...</p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="auth-btn"
                  >
                    Ir al Login
                  </Button>
                </>
              )}

              {status === 'error' && (
                <>
                  <FaTimesCircle size={60} className="text-danger mb-3" />
                  <h3 className="text-danger">Error de Verificación</h3>
                  <p className="text-muted mb-4">{message}</p>
                  <p className="text-muted mb-3">
                    El enlace puede haber expirado o ser inválido
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button
                      variant="outline-primary"
                      onClick={() => navigate('/login')}
                    >
                      Ir al Login
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => navigate('/register')}
                      className="auth-btn"
                    >
                      Registrarse de Nuevo
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}

export default VerifyEmail;