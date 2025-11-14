import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Alert, Form, Button } from "react-bootstrap";
import { FaStar, FaClock, FaTrophy, FaThumbsUp, FaThumbsDown, FaFilter, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";
import "./css/AllReviews.css";

function AllReviews() {
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [topGames, setTopGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    genero: "",
    plataforma: "",
    año: "",
    recomendado: "",
    dificultad: "",
    puntuacion: "",
    ordenar: "recientes"
  });

  // Opciones de filtros
  const generos = ["Acción", "Aventura", "RPG", "Estrategia", "Deportes", "Carreras", "Simulacion"];
  const plataformas = ["PC", "PS5", "Xbox", "Nintendo Switch", "PC/PS/Xbox"];
  const dificultades = ["Fácil", "Normal", "Difícil"];
  const años = ["2025","2024", "2023", "2022", "2021", "2020", "2019", "2018", "Anteriores"];

  useEffect(() => {
    fetchAllReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allReviews]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const [reviewsRes, gamesRes] = await Promise.all([
        axiosInstance.get("/resenas"),
        axiosInstance.get("/juegos")
      ]);

      // Solo reseñas públicas
      const publicReviews = reviewsRes.data.filter((r) => r.esPublica);
      setAllReviews(publicReviews);
      setFilteredReviews(publicReviews);

      // Top 3 juegos
      const games = gamesRes.data.games || gamesRes.data;
      const ratedGames = games
        .filter((g) => g.ratingPromedio || g.promedioPuntuacion)
        .sort((a, b) => (b.ratingPromedio || b.promedioPuntuacion) - (a.ratingPromedio || a.promedioPuntuacion))
        .slice(0, 3);
console.log("Reseñas obtenidas:", reviewsRes.data.slice(0, 3)); 
      setTopGames(ratedGames);
    } catch (err) {
      console.error("Error al cargar reseñas globales:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allReviews];

    // Filtrar por género
    if (filters.genero) {
      filtered = filtered.filter(review => 
        review.juegoId?.genero === filters.genero
      );
    }

    // Filtrar por plataforma
    if (filters.plataforma) {
      filtered = filtered.filter(review => 
        review.juegoId?.plataforma?.includes(filters.plataforma)
      );
    }

    // Filtrar por año
    if (filters.año) {
      filtered = filtered.filter(review => {
        const año = review.juegoId?.añoLanzamiento;
        if (filters.año === "Anteriores") {
          return año < 2018;
        }
        return año === parseInt(filters.año);
      });
    }

    // Filtrar por recomendado
    if (filters.recomendado !== "") {
      const recomendado = filters.recomendado === "true";
      filtered = filtered.filter(review => review.recomendaria === recomendado);
    }

    // Filtrar por dificultad
    if (filters.dificultad) {
      filtered = filtered.filter(review => review.dificultad === filters.dificultad);
    }

    // Filtrar por puntuación
    if (filters.puntuacion) {
      const minPuntuacion = parseInt(filters.puntuacion);
      filtered = filtered.filter(review => review.puntuacion >= minPuntuacion);
    }

    // Ordenar
    switch (filters.ordenar) {
      case "recientes":
        filtered.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
        break;
      case "antiguos":
        filtered.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
        break;
      case "mejor-puntuacion":
        filtered.sort((a, b) => b.puntuacion - a.puntuacion);
        break;
      case "peor-puntuacion":
        filtered.sort((a, b) => a.puntuacion - b.puntuacion);
        break;
      case "mas-horas":
        filtered.sort((a, b) => (b.horasJugadas || 0) - (a.horasJugadas || 0));
        break;
      default:
        break;
    }

    setFilteredReviews(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      genero: "",
      plataforma: "",
      año: "",
      recomendado: "",
      dificultad: "",
      puntuacion: "",
      ordenar: "recientes"
    });
  };

  const hasActiveFilters = () => {
    return filters.genero || filters.plataforma || filters.año || 
           filters.recomendado !== "" || filters.dificultad || filters.puntuacion;
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "star-filled" : "star-empty"} />
    ));

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

  if (loading) {
    return (
      <div className="reviews-loading">
        <Spinner animation="border" variant="primary" />
        <p>Cargando reseñas...</p>
      </div>
    );
  }

  return (
    <div className="all-reviews-page">
      <Container>
        <Row>
          {/* FILTROS SIDEBAR */}
          <Col lg={3} md={12} className="filters-sidebar">
            <Card className="filters-card sticky-filters">
              <Card.Body>
                <div className="filters-header">
                  <h5 className="filters-title">
                    <FaFilter className="me-2" />
                    Filtros
                  </h5>
                  {hasActiveFilters() && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={clearFilters}
                      className="clear-filters-btn"
                    >
                      <FaTimes className="me-1" />
                      Limpiar
                    </Button>
                  )}
                </div>

                {/* Género */}
                <Form.Group className="mb-3">
                  <Form.Label className="filter-label">Género</Form.Label>
                  <Form.Select 
                    value={filters.genero}
                    onChange={(e) => handleFilterChange("genero", e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Todos</option>
                    {generos.map(genero => (
                      <option key={genero} value={genero}>{genero}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Plataforma */}
                <Form.Group className="mb-3">
                  <Form.Label className="filter-label">Plataforma</Form.Label>
                  <Form.Select 
                    value={filters.plataforma}
                    onChange={(e) => handleFilterChange("plataforma", e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Todas</option>
                    {plataformas.map(plat => (
                      <option key={plat} value={plat}>{plat}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Año de Lanzamiento */}
                <Form.Group className="mb-3">
                  <Form.Label className="filter-label">Año</Form.Label>
                  <Form.Select 
                    value={filters.año}
                    onChange={(e) => handleFilterChange("año", e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Todos</option>
                    {años.map(año => (
                      <option key={año} value={año}>{año}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Recomendación */}
                <Form.Group className="mb-3">
                  <Form.Label className="filter-label">Recomendación</Form.Label>
                  <Form.Select 
                    value={filters.recomendado}
                    onChange={(e) => handleFilterChange("recomendado", e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Todas</option>
                    <option value="true">Recomendados</option>
                    <option value="false">No recomendados</option>
                  </Form.Select>
                </Form.Group>

                {/* Dificultad */}
                <Form.Group className="mb-3">
                  <Form.Label className="filter-label">Dificultad</Form.Label>
                  <Form.Select 
                    value={filters.dificultad}
                    onChange={(e) => handleFilterChange("dificultad", e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Todas</option>
                    {dificultades.map(dif => (
                      <option key={dif} value={dif}>{dif}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Puntuación Mínima */}
                <Form.Group className="mb-3">
                  <Form.Label className="filter-label">Puntuación Mínima</Form.Label>
                  <Form.Select 
                    value={filters.puntuacion}
                    onChange={(e) => handleFilterChange("puntuacion", e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Todas</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5 estrellas)</option>
                    <option value="4">⭐⭐⭐⭐ (4+ estrellas)</option>
                    <option value="3">⭐⭐⭐ (3+ estrellas)</option>
                    <option value="2">⭐⭐ (2+ estrellas)</option>
                  </Form.Select>
                </Form.Group>

                {/* Ordenar por */}
                <Form.Group className="mb-3">
                  <Form.Label className="filter-label">Ordenar por</Form.Label>
                  <Form.Select 
                    value={filters.ordenar}
                    onChange={(e) => handleFilterChange("ordenar", e.target.value)}
                    className="filter-select"
                  >
                    <option value="recientes">Más recientes</option>
                    <option value="antiguos">Más antiguos</option>
                    <option value="mejor-puntuacion">Mejor puntuación</option>
                    <option value="peor-puntuacion">Peor puntuación</option>
                    <option value="mas-horas">Más horas jugadas</option>
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* LISTA DE RESEÑAS FILTRADAS */}
          <Col lg={6} md={12}>
            <div className="reviews-header">
              <h1 className="page-title">Todas las Reseñas</h1>
              <Badge bg="primary" className="reviews-count">
                {filteredReviews.length} reseñas
              </Badge>
            </div>

            {filteredReviews.length === 0 ? (
              <Alert variant="info" className="mt-4">
                {hasActiveFilters() 
                  ? "No se encontraron reseñas con los filtros seleccionados."
                  : "No hay reseñas públicas aún."}
              </Alert>
            ) : (
              filteredReviews.map((review) => (
                <Card key={review._id} className="review-item mb-4">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h5 className="review-game-title game-link-disabled">
  {review.juegoId?.titulo || "Juego desconocido"}
</h5>

                        <div className="review-meta">
                          <div className="stars-rating">
                            {renderStars(review.puntuacion)}
                          </div>
                          <span className="review-date">
                            {new Date(review.fechaCreacion).toLocaleDateString("es-CO")}
                          </span>
                        </div>
                      </div>
                      <div>
                        {review.recomendaria ? (
                          <Badge bg="success" className="recommendation-badge">
                            <FaThumbsUp className="me-1" /> Recomendado
                          </Badge>
                        ) : (
                          <Badge bg="danger" className="recommendation-badge">
                            <FaThumbsDown className="me-1" /> No recomendado
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="review-text mt-3">{review.textoResena}</p>

                    <div className="review-badges-container mt-3">
                      {review.horasJugadas > 0 && (
                        <Badge bg="info" className="review-badge">
                          <FaClock className="me-1" /> {review.horasJugadas}h jugadas
                        </Badge>
                      )}
                      <Badge bg={getDifficultyColor(review.dificultad)} className="review-badge">
                        <FaTrophy className="me-1" /> {review.dificultad}
                      </Badge>
                      {review.juegoId?.genero && (
                        <Badge bg="secondary" className="review-badge">
                          {review.juegoId.genero}
                        </Badge>
                      )}
                      {review.juegoId?.plataforma && (
                        <Badge bg="dark" className="review-badge">
                          {review.juegoId.plataforma}
                        </Badge>
                      )}
                    </div>

                    <div className="reviewer mt-3">
                      <span className="reviewer-name">
                        — {review.usuarioId?.nombre || "Usuario anónimo"}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>

          {/* SIDEBAR: TOP 3 JUEGOS */}
          <Col lg={3} md={12}>
  <Card className="top-games-card">
    <Card.Body>
      <h4 className="sidebar-title">🏆 Top 3 Juegos</h4>
      {topGames.length === 0 ? (
        <p className="text-muted">No hay juegos valorados aún.</p>
      ) : (
        <ul className="top-games-list">
          {topGames.map((game, index) => (
            <li key={game._id}>
              {/* 🔒 Quitamos el Link y usamos solo un div */}
              <div className="top-game-link-disabled">
                <div className="top-game-info">
                  <div className="ranking-circle">{index + 1}</div>
                  <img
                    src={game.imagenPortada || "https://via.placeholder.com/80x100"}
                    alt={game.titulo}
                    className="top-game-img"
                  />
                  <div>
                    <h6 className="mb-1">{game.titulo}</h6>
                    <div className="stars-small">
                      {renderStars(Math.round(game.ratingPromedio || game.promedioPuntuacion))}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card.Body>
  </Card>
</Col>

        </Row>
      </Container>
    </div>
  );
}

export default AllReviews;