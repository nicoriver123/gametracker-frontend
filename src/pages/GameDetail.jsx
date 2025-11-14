import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Button, Form, Modal } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaEdit, FaStar, FaClock, FaTrophy, FaArrowLeft } from "react-icons/fa";
import axios from "../api/axiosConfig";
import toast from "react-hot-toast";
import "./css/GameDetail.css";

function GameDetail() {
  const { id } = useParams(); // ID del UserGame
  const navigate = useNavigate();

  const [userGame, setUserGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [editData, setEditData] = useState({
    estado: "",
    horasJugadas: 0,
    calificacionPersonal: 0
  });

  useEffect(() => {
    fetchGameDetail();
  }, [id]);

  const fetchGameDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      // Obtener toda la biblioteca y buscar el juego específico
      const res = await axios.get("/mis-juegos/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const game = res.data.find(item => item._id === id);
      
      if (!game) {
        toast.error("Juego no encontrado");
        navigate("/my-library");
        return;
      }

      setUserGame(game);
      setEditData({
        estado: game.estado,
        horasJugadas: game.horasJugadas || 0,
        calificacionPersonal: game.calificacionPersonal || 0
      });

    } catch (error) {
      console.error("Error al cargar detalle:", error);
      toast.error("Error al cargar el juego");
      navigate("/my-library");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(`/mis-juegos/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Progreso actualizado");
      setShowEditModal(false);
      fetchGameDetail();
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast.error("Error al actualizar el progreso");
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "Completado": return "success";
      case "En progreso": return "primary";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando detalles...</p>
      </div>
    );
  }

  if (!userGame) {
    return null;
  }

  const game = userGame.juegoId;
  const isPersonalGame = game?.usuarioId ? true : false;

  return (
    <div className="game-detail-page">
      <Container>
        {/* Back Button */}
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate("/my-library")}
          className="back-button"
        >
          <FaArrowLeft className="me-2" />
          Volver a Mi Biblioteca
        </Button>

        <Row className="mt-4">
          {/* Columna Izquierda - Imagen */}
          <Col lg={4}>
            <Card className="image-card">
              <Card.Img
                variant="top"
                src={game?.imagenPortada || "https://via.placeholder.com/400x600?text=Sin+Imagen"}
                alt={game?.titulo}
                className="game-detail-image"
              />
              {isPersonalGame && (
                <div className="personal-badge-detail">
                  🎨 Juego creado por ti
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="mt-3 actions-card">
              <Card.Body>
                <h5 className="mb-3">Acciones Rápidas</h5>
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary"
                    onClick={() => setShowEditModal(true)}
                  >
                    <FaEdit className="me-2" />
                    Editar Progreso
                  </Button>
                  {isPersonalGame && (
                    <Button 
                      as={Link}
                      to={`/my-library/edit-game/${game._id}`}
                      variant="outline-primary"
                    >
                      <FaEdit className="me-2" />
                      Editar Información
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Columna Derecha - Información */}
          <Col lg={8}>
            {/* Título y Estado */}
            <div className="game-header">
              <h1 className="game-detail-title">{game?.titulo}</h1>
              <Badge bg={getStatusColor(userGame.estado)} className="status-badge-large">
                {userGame.estado}
              </Badge>
            </div>

            {/* Stats Cards */}
            <Row className="stats-row">
              <Col md={4}>
                <Card className="stat-card-detail">
                  <Card.Body className="text-center">
                    <FaClock className="stat-icon" />
                    <h3>{userGame.horasJugadas || 0}h</h3>
                    <p>Horas Jugadas</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="stat-card-detail">
                  <Card.Body className="text-center">
                    <FaStar className="stat-icon rating" />
                    <h3>{userGame.calificacionPersonal || 0}/5</h3>
                    <p>Tu Calificación</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="stat-card-detail">
                  <Card.Body className="text-center">
                    <FaTrophy className="stat-icon trophy" />
                    <h3>{userGame.estado === "Completado" ? "Sí" : "No"}</h3>
                    <p>Completado</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Información del Juego */}
            <Card className="info-card">
              <Card.Body>
                <h4 className="section-title">Información del Juego</h4>
                <Row className="game-info-detail">
                  <Col md={6}>
                    <div className="info-item-detail">
                      <strong>Género:</strong>
                      <span>{game?.genero || "N/A"}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="info-item-detail">
                      <strong>Plataforma:</strong>
                      <span>{game?.plataforma || "N/A"}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="info-item-detail">
                      <strong>Año:</strong>
                      <span>{game?.añoLanzamiento || "N/A"}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="info-item-detail">
                      <strong>Desarrollador:</strong>
                      <span>{game?.desarrollador || "N/A"}</span>
                    </div>
                  </Col>
                  <Col md={12}>
                    <div className="info-item-detail">
                      <strong>Agregado:</strong>
                      <span>{new Date(userGame.fechaAgregado).toLocaleDateString('es-ES')}</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Descripción */}
            {game?.descripcion && (
              <Card className="mt-3 description-card">
                <Card.Body>
                  <h4 className="section-title">Descripción</h4>
                  <p className="game-description-detail">
                    {game.descripcion}
                  </p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* Modal de Edición de Progreso */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Progreso</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={editData.estado}
                onChange={(e) => setEditData({...editData, estado: e.target.value})}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En progreso">En Progreso</option>
                <option value="Completado">Completado</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Horas Jugadas</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={editData.horasJugadas}
                onChange={(e) => setEditData({...editData, horasJugadas: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Calificación Personal (0-5)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={editData.calificacionPersonal}
                onChange={(e) => setEditData({...editData, calificacionPersonal: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default GameDetail;