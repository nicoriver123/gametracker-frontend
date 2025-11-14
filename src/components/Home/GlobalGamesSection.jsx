import { useEffect, useState } from "react";
import { Card, Button, Row, Col, Spinner, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaGamepad, FaArrowRight, FaFire } from "react-icons/fa";
import axios from "../../api/axiosConfig";
import toast from "react-hot-toast";
import "./GlobalGamesSection.css";

function GlobalGamesSection() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get("/juegos");

        // Filtramos solo juegos globales y los ordenamos por fecha de creación
        const globalGames = res.data
          .filter((game) => game.esGlobal === true)
          .sort(
            (a, b) =>
              new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0)
          )
          .slice(0, 4); // Tomamos los 4 más recientes

        setGames(globalGames);
      } catch (error) {
        console.error("Error al cargar juegos globales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // 📦 Agregar juego a la biblioteca
  const handleAddToLibrary = async (gameId) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      toast.error("Debes iniciar sesión para agregar juegos a tu biblioteca");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      await axios.post(
        "/mis-juegos",
        { juegoId: gameId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Juego agregado a tu biblioteca 🎮");
    } catch (error) {
      console.error("Error al agregar:", error);
      toast.error(error.response?.data?.message || "Error al agregar el juego");
    }
  };

  if (loading) {
    return (
      <div className="loading-section">
        <Spinner animation="border" variant="primary" className="loading-spinner-section" />
        <p className="loading-text-section">Cargando juegos...</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="empty-section">
        <FaGamepad className="empty-icon-section" />
        <p>No hay juegos globales disponibles.</p>
      </div>
    );
  }

  return (
    <section className="global-games-section">
      <div className="container">
        {/* Header con animación */}
        <div className="section-header">
          <div className="header-badge">
            <FaFire className="fire-icon" />
            <span>Nuevos Lanzamientos</span>
          </div>
          <h2 className="section-title">
            Descubre los Últimos Juegos Globales
          </h2>
          <p className="section-subtitle">
            Los juegos más recientes agregados a nuestra plataforma
          </p>
        </div>

        <Row xs={1} sm={2} md={2} lg={4} className="g-4 games-row">
          {games.map((game, index) => (
            <Col key={game._id}>
              <Card
                className="game-card-section"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-image-container">
                  <Card.Img
                    variant="top"
                    src={
                      game.imagenPortada?.trim()
                        ? game.imagenPortada
                        : "https://via.placeholder.com/300x200?text=Sin+Imagen"
                    }
                    alt={game.titulo}
                    className="game-img-section"
                  />
                  <Badge className="new-badge">NUEVO</Badge>
                </div>

                <Card.Body className="card-body-section">
                  <Card.Title className="game-title-section">
                    {game.titulo}
                  </Card.Title>

                  <Card.Text className="game-description-section">
                    {game.descripcion
                      ? `${game.descripcion.slice(0, 90)}...`
                      : "Descubre este increíble juego y vive una experiencia única."}
                  </Card.Text>

                  <Button
                    onClick={() => handleAddToLibrary(game._id)}
                    className="btn-view-details"
                  >
                    Agregar a mi biblioteca
                    <FaArrowRight className="btn-icon" />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Botón para ver todos los juegos */}
        <div className="view-all-container">
          <Button as={Link} to="/games" className="btn-view-all">
            <FaGamepad className="me-2" />
            Ver Todos los Juegos
            <FaArrowRight className="ms-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default GlobalGamesSection;
