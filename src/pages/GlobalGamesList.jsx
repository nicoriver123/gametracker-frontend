import { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Pagination, Badge, Button, Form, Dropdown } from "react-bootstrap";
import { FaGamepad, FaCalendar, FaUsers, FaFilter, FaTimes, FaStar, FaSearch } from "react-icons/fa";
import axios from "../api/axiosConfig";
import toast from "react-hot-toast";
import Footer from "../components/Footer/Footer";
import "./css/GlobalGamesList.css";
import { useNavigate } from "react-router-dom";

function GlobalGamesList() {
  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [displayGames, setDisplayGames] = useState([]);
  const [addedGames, setAddedGames] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Estados de filtros
  const [filters, setFilters] = useState({
    genero: "",
    plataforma: "",
    año: "",
    rating: "",
    desarrollador: "",
    ordenar: "recientes"
  });

  // Opciones de filtros
  const generos = ["Accion", "Aventura", "RPG", "Estrategia", "Deportes", "Carreras", "Simulacion"];
  const plataformas = ["PC", "PS5", "Xbox", "Nintendo Switch", "PC/PS/Xbox", "PC/PS", "PC/Xbox"];
  const años = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "Anteriores"];
  const ratings = [
    { value: "5", label: "⭐⭐⭐⭐⭐ (5 estrellas)" },
    { value: "4", label: "⭐⭐⭐⭐ (4+ estrellas)" },
    { value: "3", label: "⭐⭐⭐ (3+ estrellas)" },
    { value: "2", label: "⭐⭐ (2+ estrellas)" }
  ];

  const GAMES_PER_PAGE = 12;

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allGames, searchTerm]);

  useEffect(() => {
    paginateGames();
  }, [filteredGames, currentPage]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/juegos");
      const globalGames = res.data.filter((g) => g.esGlobal === true);
      setAllGames(globalGames);
      setFilteredGames(globalGames);
    } catch (error) {
      console.error("Error al cargar juegos globales:", error);
      toast.error("No se pudieron cargar los juegos");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allGames];

    // Búsqueda por texto
    if (searchTerm.trim()) {
      filtered = filtered.filter(game =>
        game.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.desarrollador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por género
    if (filters.genero) {
      filtered = filtered.filter(game => game.genero === filters.genero);
    }

    // Filtrar por plataforma
    if (filters.plataforma) {
      filtered = filtered.filter(game => 
        game.plataforma?.includes(filters.plataforma)
      );
    }

    // Filtrar por año
    if (filters.año) {
      filtered = filtered.filter(game => {
        const año = game.añoLanzamiento;
        if (filters.año === "Anteriores") {
          return año < 2018;
        }
        return año === parseInt(filters.año);
      });
    }

    // Filtrar por rating
    if (filters.rating) {
      const minRating = parseInt(filters.rating);
      filtered = filtered.filter(game => 
        (game.ratingPromedio || 0) >= minRating
      );
    }

    // Filtrar por desarrollador
    if (filters.desarrollador) {
      filtered = filtered.filter(game => 
        game.desarrollador?.toLowerCase().includes(filters.desarrollador.toLowerCase())
      );
    }

    // Ordenar
    switch (filters.ordenar) {
      case "recientes":
        filtered.sort((a, b) => (b.añoLanzamiento || 0) - (a.añoLanzamiento || 0));
        break;
      case "antiguos":
        filtered.sort((a, b) => (a.añoLanzamiento || 0) - (b.añoLanzamiento || 0));
        break;
      case "alfabetico-az":
        filtered.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case "alfabetico-za":
        filtered.sort((a, b) => b.titulo.localeCompare(a.titulo));
        break;
      case "mejor-rating":
        filtered.sort((a, b) => (b.ratingPromedio || 0) - (a.ratingPromedio || 0));
        break;
      case "peor-rating":
        filtered.sort((a, b) => (a.ratingPromedio || 0) - (b.ratingPromedio || 0));
        break;
      default:
        break;
    }

    setFilteredGames(filtered);
    setCurrentPage(1); // Resetear a página 1 al filtrar
  };

  const paginateGames = () => {
    setTotalPages(Math.ceil(filteredGames.length / GAMES_PER_PAGE));
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    const paginatedGames = filteredGames.slice(startIndex, startIndex + GAMES_PER_PAGE);
    setDisplayGames(paginatedGames);
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
      rating: "",
      desarrollador: "",
      ordenar: "recientes"
    });
    setSearchTerm("");
  };

  const hasActiveFilters = () => {
    return filters.genero || filters.plataforma || filters.año || 
           filters.rating || filters.desarrollador || searchTerm;
  };

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

      setAddedGames((prev) => [...prev, gameId]);
      toast.success("🎮 Juego agregado a tu biblioteca");
    } catch (error) {
      console.error("Error al agregar juego:", error);
      const msg = error.response?.data?.message || "Error al agregar el juego";
      toast.error(msg);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} className={i <= roundedRating ? "star-filled" : "star-empty"} />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="warning" className="loading-spinner" />
        <p className="loading-text">Cargando juegos increíbles...</p>
      </div>
    );
  }

  return (
    <>
      <div className="global-games-page">
        <div className="container">
          {/* Header */}
          <div className="page-header">
            <div className="header-content">
              <FaGamepad className="header-icon" />
              <h1 className="page-title">Biblioteca Global de Juegos</h1>
              <p className="page-subtitle">
                Descubre los mejores juegos de nuestra colección mundial
              </p>
            </div>
          </div>

          {/* Barra de búsqueda y filtros rápidos */}
          <div className="filters-top-bar">
            <div className="search-box">
             
              <Form.Control
                type="text"
                placeholder="Buscar por título, desarrollador o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="clear-search-btn"
                >
                  <FaTimes />
                </Button>
              )}
            </div>

            <div className="filters-actions">
              <Badge bg="primary" className="results-badge">
                {filteredGames.length} juegos encontrados
              </Badge>
              
              {hasActiveFilters() && (
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={clearFilters}
                  className="clear-all-btn"
                >
                  <FaTimes className="me-1" />
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </div>

          <Row>
            {/* Sidebar de Filtros */}
            <Col lg={3} md={12} className="filters-sidebar-col">
              <Card className="filters-card sticky-sidebar">
                <Card.Body>
                  <div className="filters-header">
                    <h5 className="filters-title">
                      <FaFilter className="me-2" />
                      Filtros Avanzados
                    </h5>
                  </div>

                  {/* Género */}
                  <Form.Group className="mb-3">
                    <Form.Label className="filter-label">Género</Form.Label>
                    <Form.Select 
                      value={filters.genero}
                      onChange={(e) => handleFilterChange("genero", e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Todos los géneros</option>
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
                      <option value="">Todas las plataformas</option>
                      {plataformas.map(plat => (
                        <option key={plat} value={plat}>{plat}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Año de Lanzamiento */}
                  <Form.Group className="mb-3">
                    <Form.Label className="filter-label">Año de Lanzamiento</Form.Label>
                    <Form.Select 
                      value={filters.año}
                      onChange={(e) => handleFilterChange("año", e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Todos los años</option>
                      {años.map(año => (
                        <option key={año} value={año}>{año}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Rating Mínimo */}
                  <Form.Group className="mb-3">
                    <Form.Label className="filter-label">Rating Mínimo</Form.Label>
                    <Form.Select 
                      value={filters.rating}
                      onChange={(e) => handleFilterChange("rating", e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Todos los ratings</option>
                      {ratings.map(rating => (
                        <option key={rating.value} value={rating.value}>
                          {rating.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Desarrollador */}
                  <Form.Group className="mb-3">
                    <Form.Label className="filter-label">Desarrollador</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Buscar desarrollador..."
                      value={filters.desarrollador}
                      onChange={(e) => handleFilterChange("desarrollador", e.target.value)}
                      className="filter-input"
                    />
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
                      <option value="alfabetico-az">A-Z</option>
                      <option value="alfabetico-za">Z-A</option>
                      <option value="mejor-rating">Mejor rating</option>
                      <option value="peor-rating">Peor rating</option>
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            {/* Grid de Juegos */}
            <Col lg={9} md={12}>
              {displayGames.length === 0 ? (
                <div className="empty-state">
                  <FaGamepad className="empty-icon" />
                  <h3>No se encontraron juegos</h3>
                  <p>
                    {hasActiveFilters() 
                      ? "Intenta ajustar los filtros o limpiar la búsqueda"
                      : "Vuelve pronto para descubrir nuevos títulos"}
                  </p>
                </div>
              ) : (
                <>
                  <Row xs={1} sm={2} md={2} lg={3} className="g-4 games-grid">
                    {displayGames.map((game) => (
                      <Col key={game._id}>
                        <Card className="game-card-improved">
                          <div className="card-image-wrapper">
                            <Card.Img
                              variant="top"
                              src={
                                game.imagenPortada ||
                                "https://via.placeholder.com/300x400?text=Sin+Imagen"
                              }
                              alt={game.titulo}
                              className="card-image"
                            />
                            <div className="card-overlay">
                              <Badge bg="dark" className="genre-badge">
                                {game.genero}
                              </Badge>
                              {game.ratingPromedio > 0 && (
                                <div className="rating-badge">
                                  <FaStar className="star-icon" />
                                  {game.ratingPromedio.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>

                          <Card.Body className="card-body-custom">
                            <Card.Title className="game-title">{game.titulo}</Card.Title>

                            {game.ratingPromedio > 0 && (
                              <div className="stars-container mb-2">
                                {renderStars(game.ratingPromedio)}
                              </div>
                            )}

                            <div className="game-info">
                              <div className="info-item">
                                <FaGamepad className="info-icon" />
                                <span>{game.plataforma}</span>
                              </div>
                              <div className="info-item">
                                <FaCalendar className="info-icon" />
                                <span>{game.añoLanzamiento}</span>
                              </div>
                              <div className="info-item">
                                <FaUsers className="info-icon" />
                                <span>{game.desarrollador}</span>
                              </div>
                            </div>

                            <Card.Text className="game-description">
                              {game.descripcion && game.descripcion.length > 100
                                ? `${game.descripcion.substring(0, 100)}...`
                                : game.descripcion || "Sin descripción disponible"}
                            </Card.Text>

                            <div className="card-actions">
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="btn-reviews"
                                onClick={() => navigate(`/games/${game._id}/reviews`)}
                              >
                                <FaStar className="me-1" /> Ver Reseñas
                              </Button>

                              {addedGames.includes(game._id) ? (
                                <Button variant="success" disabled className="btn-added">
                                  ✅ Ya agregado
                                </Button>
                              ) : (
                                <Button
                                  className="btn-add-to-library"
                                  onClick={() => handleAddToLibrary(game._id)}
                                >
                                  Agregar
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="pagination-container">
                      <Pagination className="custom-pagination">
                        <Pagination.First
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(1)}
                        />
                        <Pagination.Prev
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        />

                        {[...Array(totalPages).keys()].map((num) => {
                          const pageNum = num + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                          ) {
                            return (
                              <Pagination.Item
                                key={pageNum}
                                active={currentPage === pageNum}
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Pagination.Item>
                            );
                          } else if (
                            pageNum === currentPage - 3 ||
                            pageNum === currentPage + 3
                          ) {
                            return <Pagination.Ellipsis key={pageNum} disabled />;
                          }
                          return null;
                        })}

                        <Pagination.Next
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                        />
                        <Pagination.Last
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(totalPages)}
                        />
                      </Pagination>

                      <p className="pagination-info">
                        Página {currentPage} de {totalPages}
                      </p>
                    </div>
                  )}
                </>
              )}
            </Col>
          </Row>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default GlobalGamesList;
