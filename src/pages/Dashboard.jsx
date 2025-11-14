// pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { FaGamepad, FaStar, FaClock, FaChartLine, FaTrophy, FaFire, FaBook, FaComments } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import axiosInstance from '../api/axiosConfig';
import './css/Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalGames: 0,
    totalReviews: 0,
    totalHours: 0,
    completedGames: 0,
    inProgressGames: 0,
    pendingGames: 0,
    averageRating: 0,
    totalPosts: 0
  });
  
  const [recentGames, setRecentGames] = useState([]);
  const [topRatedGames, setTopRatedGames] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener biblioteca del usuario
      const libraryRes = await axiosInstance.get('/mis-juegos/me');
      const library = libraryRes.data;

      // 2. Obtener reseñas del usuario
      const reviewsRes = await axiosInstance.get('/resenas');
      const allReviews = reviewsRes.data;
      const userReviews = allReviews.filter(
        review => review.usuarioId?._id === user.id || review.usuarioId?._id === user._id
      );

      // 3. Obtener posts del foro del usuario
      let userPosts = [];
      try {
        const postsRes = await axiosInstance.get('/forum/posts');
        userPosts = postsRes.data.posts?.filter(
          post => post.usuarioId?._id === user.id || post.usuarioId?._id === user._id
        ) || [];
      } catch  {
        console.log('No se pudieron cargar los posts del foro');
      }

      // CALCULAR ESTADÍSTICAS
      const totalHours = library.reduce((sum, item) => sum + (item.horasJugadas || 0), 0);
      const completedGames = library.filter(item => item.estado === 'Completado').length;
      const inProgressGames = library.filter(item => item.estado === 'En progreso').length;
      const pendingGames = library.filter(item => item.estado === 'Pendiente').length;
      
      const averageRating = userReviews.length > 0
        ? userReviews.reduce((sum, review) => sum + review.puntuacion, 0) / userReviews.length
        : 0;

      setStats({
        totalGames: library.length,
        totalReviews: userReviews.length,
        totalHours,
        completedGames,
        inProgressGames,
        pendingGames,
        averageRating: averageRating.toFixed(1),
        totalPosts: userPosts.length
      });

      // JUEGOS RECIENTES (últimos 5 agregados)
      const recent = library
        .sort((a, b) => new Date(b.fechaAgregado) - new Date(a.fechaAgregado))
        .slice(0, 5);
      setRecentGames(recent);

      // TOP JUEGOS MEJOR CALIFICADOS (por el usuario)
      const topRated = library
        .filter(item => item.calificacionPersonal && item.calificacionPersonal > 0)
        .sort((a, b) => b.calificacionPersonal - a.calificacionPersonal)
        .slice(0, 5);
      setTopRatedGames(topRated);

      // RESEÑAS RECIENTES (últimas 3)
      const recentReviewsList = userReviews
        .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
        .slice(0, 3);
      setRecentReviews(recentReviewsList);

    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      setError('Error al cargar los datos del dashboard. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Completado': 'success',
      'En progreso': 'primary',
      'Pendiente': 'warning'
    };
    return variants[status] || 'secondary';
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="dashboard-container">
        <div className="loading-state">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Cargando tu dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="dashboard-container mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="dashboard-container">
      {/* HEADER DEL DASHBOARD */}
      <div className="dashboard-header">
        <div className="user-welcome">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.nombre} className="user-avatar-large" />
          ) : (
            <div className="user-avatar-placeholder">
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="welcome-info">
            <h1 className="welcome-title">¡Bienvenido, {user?.nombre}!</h1>
            <p className="welcome-subtitle">@{user?.username}</p>
          </div>
        </div>
        <Link to="/my-library" className="btn-library">
          <FaGamepad className="me-2" />
          Ir a Mi Biblioteca
        </Link>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS PRINCIPALES */}
      <Row className="stats-row g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="stat-card stat-card-primary">
            <Card.Body>
              <div className="stat-icon">
                <FaGamepad />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalGames}</h3>
                <p className="stat-label">Juegos en Biblioteca</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="stat-card stat-card-warning">
            <Card.Body>
              <div className="stat-icon">
                <FaStar />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalReviews}</h3>
                <p className="stat-label">Reseñas Escritas</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="stat-card stat-card-info">
            <Card.Body>
              <div className="stat-icon">
                <FaClock />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalHours}h</h3>
                <p className="stat-label">Horas Jugadas</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="stat-card stat-card-success">
            <Card.Body>
              <div className="stat-icon">
                <FaTrophy />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.completedGames}</h3>
                <p className="stat-label">Juegos Completados</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* PROGRESO DE JUEGOS Y RESUMEN DE VALORACIONES */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="dashboard-card">
            <Card.Body>
              <h5 className="card-title">
                <FaChartLine className="me-2" />
                Progreso de Juegos
              </h5>
              {stats.totalGames > 0 ? (
                <div className="progress-section">
                  <div className="progress-item">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="progress-label">Completados</span>
                      <span className="progress-count text-success fw-bold">
                        {stats.completedGames}
                      </span>
                    </div>
                    <ProgressBar 
                      now={(stats.completedGames / stats.totalGames) * 100} 
                      variant="success"
                      className="custom-progress"
                    />
                  </div>

                  <div className="progress-item mt-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="progress-label">En Progreso</span>
                      <span className="progress-count text-primary fw-bold">
                        {stats.inProgressGames}
                      </span>
                    </div>
                    <ProgressBar 
                      now={(stats.inProgressGames / stats.totalGames) * 100} 
                      variant="primary"
                      className="custom-progress"
                    />
                  </div>

                  <div className="progress-item mt-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="progress-label">Pendientes</span>
                      <span className="progress-count text-warning fw-bold">
                        {stats.pendingGames}
                      </span>
                    </div>
                    <ProgressBar 
                      now={(stats.pendingGames / stats.totalGames) * 100} 
                      variant="warning"
                      className="custom-progress"
                    />
                  </div>
                </div>
              ) : (
                <Alert variant="info" className="mt-3">
                  No tienes juegos en tu biblioteca aún.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="dashboard-card">
            <Card.Body>
              <h5 className="card-title">
                <FaStar className="me-2" />
                Resumen de Valoraciones
              </h5>
              {stats.totalReviews > 0 ? (
                <div className="rating-summary">
                  <div className="average-rating">
                    <div className="rating-number">{stats.averageRating}</div>
                    <div className="rating-stars">
                      {renderStars(Math.round(stats.averageRating))}
                    </div>
                    <p className="text-muted mt-2">
                      Promedio de {stats.totalReviews} reseñas
                    </p>
                  </div>
                </div>
              ) : (
                <Alert variant="info" className="mt-3">
                  Aún no has escrito reseñas.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ACTIVIDAD RECIENTE Y TOP JUEGOS */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="dashboard-card">
            <Card.Body>
              <h5 className="card-title">
                <FaFire className="me-2" />
                Actividad Reciente
              </h5>
              {recentGames.length > 0 ? (
                <div className="recent-games-list">
                  {recentGames.map((item) => (
                    <div key={item._id} className="game-item">
                      <div className="d-flex align-items-center">
                        {item.juegoId?.imagenPortada ? (
                          <img 
                            src={item.juegoId.imagenPortada} 
                            alt={item.juegoId.titulo}
                            className="game-thumbnail"
                          />
                        ) : (
                          <div className="game-thumbnail-placeholder">
                            <FaGamepad />
                          </div>
                        )}
                        <div className="game-info ms-3 flex-grow-1">
                          <h6 className="game-title mb-1">{item.juegoId?.titulo}</h6>
                          <small className="game-meta">
                            Agregado {formatDate(item.fechaAgregado)}
                          </small>
                        </div>
                        <Badge bg={getStatusBadge(item.estado)}>
                          {item.estado}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert variant="info" className="mt-3">
                  Aún no tienes actividad. ¡Comienza agregando juegos a tu biblioteca!
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="dashboard-card">
            <Card.Body>
              <h5 className="card-title">
                <FaTrophy className="me-2" />
                Tus Mejores Juegos
              </h5>
              {topRatedGames.length > 0 ? (
                <div className="top-rated-list">
                  {topRatedGames.map((item) => (
                    <div key={item._id} className="game-item">
                      <div className="d-flex align-items-center">
                        {item.juegoId?.imagenPortada ? (
                          <img 
                            src={item.juegoId.imagenPortada} 
                            alt={item.juegoId.titulo}
                            className="game-thumbnail"
                          />
                        ) : (
                          <div className="game-thumbnail-placeholder">
                            <FaGamepad />
                          </div>
                        )}
                        <div className="game-info ms-3 flex-grow-1">
                          <h6 className="game-title mb-1">{item.juegoId?.titulo}</h6>
                          <div className="rating-stars-small">
                            {renderStars(item.calificacionPersonal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert variant="info" className="mt-3">
                  Aún no has calificado ningún juego.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* RESEÑAS RECIENTES */}
      <Row className="g-4">
        <Col lg={12}>
          <Card className="dashboard-card">
            <Card.Body>
              <h5 className="card-title">
                <FaBook className="me-2" />
                Tus Últimas Reseñas
              </h5>
              {recentReviews.length > 0 ? (
                <div className="reviews-list">
                  {recentReviews.map((review) => (
                    <div key={review._id} className="review-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="review-game-title">
                            {review.juegoId?.titulo || 'Juego no disponible'}
                          </h6>
                          <div className="review-rating mb-2">
                            {renderStars(review.puntuacion)}
                          </div>
                          <p className="review-text">
                            {review.textoResena?.substring(0, 150)}
                            {review.textoResena?.length > 150 ? '...' : ''}
                          </p>
                        </div>
                        <Badge bg={review.recomendaria ? 'success' : 'danger'}>
                          {review.recomendaria ? 'Recomendado' : 'No recomendado'}
                        </Badge>
                      </div>
                      <small className="text-muted">
                        {formatDate(review.fechaCreacion)}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert variant="info" className="mt-3">
                  Aún no has escrito reseñas.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;