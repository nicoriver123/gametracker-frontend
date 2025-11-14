import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaEdit,
  FaTrash,
  FaClock,
  FaTrophy,
  FaThumbsUp,
  FaThumbsDown,
  FaLock,
  FaGlobe,
} from "react-icons/fa";
import axios from "../api/axiosConfig";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import "./css/GameReviews.css";

function GameReviews() {
  const { gameId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    puntuacion: 5,
    textoResena: "",
    horasJugadas: 0,
    dificultad: "Normal",
    recomendaria: true,
    esPublica: true,
  });

  useEffect(() => {
    fetchGameAndReviews();
  }, [gameId]);

  const fetchGameAndReviews = async () => {
    try {
      setLoading(true);
      const gameRes = await axios.get(`/juegos/${gameId}`);
      setGame(gameRes.data.game);

      const reviewsRes = await axios.get(`/resenas/juego/${gameId}`);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar las reseñas");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Abrir modal para crear o editar reseña
  const handleOpenReviewModal = (review = null) => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para escribir o editar una reseña");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    if (review) {
      setEditingReview(review);
      setReviewForm({
        puntuacion: review.puntuacion,
        textoResena: review.textoResena,
        horasJugadas: review.horasJugadas,
        dificultad: review.dificultad,
        recomendaria: review.recomendaria,
        esPublica: review.esPublica,
      });
    } else {
      setEditingReview(null);
      setReviewForm({
        puntuacion: 5,
        textoResena: "",
        horasJugadas: 0,
        dificultad: "Normal",
        recomendaria: true,
        esPublica: true,
      });
    }

    setShowReviewModal(true);
  };

  // 🟢 Crear o actualizar reseña
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para publicar una reseña");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    if (reviewForm.textoResena.length < 10) {
      toast.error("La reseña debe tener al menos 10 caracteres");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const reviewData = {
        juegoId: gameId,
        ...reviewForm,
        puntuacion: parseInt(reviewForm.puntuacion),
        horasJugadas: parseInt(reviewForm.horasJugadas),
      };

      if (editingReview) {
        await axios.put(`/resenas/${editingReview._id}`, reviewData, { headers });
        toast.success("Reseña actualizada exitosamente");
      } else {
        await axios.post("/resenas", reviewData, { headers });
        toast.success("Reseña publicada exitosamente");
      }

      setShowReviewModal(false);
      fetchGameAndReviews();
    } catch (error) {
      console.error("Error al guardar reseña:", error);
      toast.error(error.response?.data?.message || "Error al guardar la reseña");
    }
  };

  // 🗑 Eliminar reseña
  const handleDeleteReview = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para eliminar tu reseña");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`/resenas/${reviewToDelete._id}`, { headers });

      toast.success("Reseña eliminada");
      setShowDeleteModal(false);
      setReviewToDelete(null);
      fetchGameAndReviews();
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al eliminar la reseña");
    }
  };

  // ⭐ Renderizado de estrellas
  const renderStars = (rating, interactive = false, onStarClick = null) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`star ${star <= rating ? "star-filled" : "star-empty"} ${
            interactive ? "star-interactive" : ""
          }`}
          onClick={() => interactive && onStarClick && onStarClick(star)}
        />
      ))}
    </div>
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Fácil":
        return "success";
      case "Difícil":
        return "danger";
      default:
        return "warning";
    }
  };

  const userHasReviewed = reviews.some((r) => r.isMine);

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="spinner-border text-primary" />
        <p>Cargando reseñas...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="warning">Juego no encontrado</Alert>
      </Container>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.puntuacion, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="game-reviews-page">
      <Container>
        {/* HEADER DEL JUEGO */}
        <Card className="game-header-card">
          <Row className="align-items-center">
            <Col md={3}>
              <img
                src={game.imagenPortada || "https://via.placeholder.com/300x400"}
                alt={game.titulo}
                className="game-header-img"
              />
            </Col>
            <Col md={9}>
              <h1 className="game-title-header">{game.titulo}</h1>
              <div className="game-meta-header">
                <Badge bg="primary">{game.genero}</Badge>
                <Badge bg="secondary">{game.plataforma}</Badge>
                <Badge bg="info">{game.añoLanzamiento}</Badge>
              </div>

              <div className="rating-summary">
                <div className="rating-number">{averageRating}</div>
                {renderStars(Math.round(averageRating))}
                <span className="reviews-count">({reviews.length} reseñas)</span>
              </div>

              {!userHasReviewed && isAuthenticated && (
                <Button className="btn-write-review" onClick={() => handleOpenReviewModal()}>
                  <FaEdit className="me-2" />
                  Escribir mi reseña
                </Button>
              )}
            </Col>
          </Row>
        </Card>

        {/* LISTA DE RESEÑAS */}
        <div className="reviews-section">
          <h2 className="section-title">Reseñas de la comunidad ({reviews.length})</h2>

          {reviews.length === 0 ? (
            <Card className="empty-reviews">
              <Card.Body className="text-center">
                <FaStar className="empty-icon" />
                <h3>No hay reseñas aún</h3>
                <p>Sé el primero en compartir tu opinión sobre este juego</p>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-4">
              {reviews.map((review) => (
                <Col md={12} key={review._id}>
                  <Card className={`review-card ${review.isMine ? "own-review" : ""}`}>
                    <Card.Body>
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.usuarioId?.avatar ? (
                              <img src={review.usuarioId.avatar} alt={review.usuarioId.nombre} />
                            ) : (
                              <div className="avatar-placeholder">
                                {review.usuarioId?.nombre?.charAt(0).toUpperCase() || "U"}
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="reviewer-name">
                              {review.usuarioId?.nombre || "Usuario"}
                              {review.isMine && (
                                <Badge bg="success" className="ms-2">
                                  Tu reseña
                                </Badge>
                              )}
                              {!review.esPublica && (
                                <FaLock className="ms-2 text-muted" title="Reseña privada" />
                              )}
                            </h5>
                            <div className="review-meta">
                              {renderStars(review.puntuacion)}
                              <span className="review-date">
                                {new Date(review.fechaCreacion).toLocaleDateString("es-ES")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mostrar editar y eliminar solo si es su reseña */}
                        {review.isMine && isAuthenticated && (
                          <div className="review-actions">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleOpenReviewModal(review)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setReviewToDelete(review);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="review-badges">
                        {review.horasJugadas > 0 && (
                          <Badge bg="info">
                            <FaClock className="me-1" /> {review.horasJugadas}h jugadas
                          </Badge>
                        )}
                        <Badge bg={getDifficultyColor(review.dificultad)}>
                          <FaTrophy className="me-1" /> {review.dificultad}
                        </Badge>
                        {review.recomendaria ? (
                          <Badge bg="success">
                            <FaThumbsUp className="me-1" /> Recomendado
                          </Badge>
                        ) : (
                          <Badge bg="danger">
                            <FaThumbsDown className="me-1" /> No recomendado
                          </Badge>
                        )}
                      </div>

                      <p className="review-text">{review.textoResena}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Container>

      {/* MODALES */}
      {/* Crear/editar */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingReview ? "Editar reseña" : "Escribir reseña"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitReview}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Calificación *</Form.Label>
              <div className="star-selector">
                {renderStars(reviewForm.puntuacion, true, (rating) =>
                  setReviewForm({ ...reviewForm, puntuacion: rating })
                )}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tu reseña * (mínimo 10 caracteres)</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={reviewForm.textoResena}
                onChange={(e) => setReviewForm({ ...reviewForm, textoResena: e.target.value })}
                placeholder="Comparte tu experiencia con este juego..."
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Horas jugadas</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={reviewForm.horasJugadas}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, horasJugadas: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dificultad</Form.Label>
                  <Form.Select
                    value={reviewForm.dificultad}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, dificultad: e.target.value })
                    }
                  >
                    <option value="Fácil">Fácil</option>
                    <option value="Normal">Normal</option>
                    <option value="Difícil">Difícil</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="¿Recomendarías este juego?"
                checked={reviewForm.recomendaria}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, recomendaria: e.target.checked })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label={
                  <span>
                    <FaGlobe className="me-2" /> Hacer pública esta reseña (visible para todos)
                  </span>
                }
                checked={reviewForm.esPublica}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, esPublica: e.target.checked })
                }
              />
              {!reviewForm.esPublica && (
                <Form.Text className="text-muted">
                  <FaLock className="me-1" /> Solo tú podrás ver esta reseña
                </Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingReview ? "Actualizar" : "Publicar"} reseña
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Confirmar eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar reseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Seguro que quieres eliminar esta reseña? Esta acción no se puede deshacer.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteReview}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default GameReviews;
