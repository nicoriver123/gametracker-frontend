import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Badge, Card, Modal, Form } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaEye, FaPalette, FaGlobe, FaFilter, FaTimes, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "../api/axiosConfig";
import toast from "react-hot-toast";
import Footer from "../components/Footer/Footer";
import "./css/MyLibrary.css";

function MyLibrary() {
  const [allLibrary, setAllLibrary] = useState([]);
  const [filteredLibrary, setFilteredLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados de filtros
  const [filters, setFilters] = useState({
    estado: "",
    genero: "",
    plataforma: "",
    tipo: "", // Personal o Global
    calificacion: "",
    horasMinimas: "",
    ordenar: "recientes"
  });

  // Opciones de filtros
  const estados = ["Pendiente", "En progreso", "Completado"];
  const generos = ["Accion", "Aventura", "RPG", "Estrategia", "Deportes", "Carreras", "Simulacion"];
  const plataformas = ["PC", "PS5", "Xbox", "Nintendo Switch", "PC/PS/Xbox"];
  const calificaciones = [
    { value: "5", label: "⭐⭐⭐⭐⭐ (5 estrellas)" },
    { value: "4", label: "⭐⭐⭐⭐ (4+ estrellas)" },
    { value: "3", label: "⭐⭐⭐ (3+ estrellas)" },
    { value: "2", label: "⭐⭐ (2+ estrellas)" }
  ];

  useEffect(() => {
    fetchLibrary();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allLibrary, searchTerm]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const libraryRes = await axios.get("/mis-juegos/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAllLibrary(libraryRes.data);
      setFilteredLibrary(libraryRes.data);
    } catch (error) {
      console.error("Error al cargar biblioteca:", error);
      toast.error("Error al cargar tu biblioteca");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allLibrary];

    // Búsqueda por texto
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.juegoId?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.juegoId?.desarrollador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.juegoId?.genero?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filters.estado) {
      filtered = filtered.filter(item => item.estado === filters.estado);
    }

    // Filtrar por género
    if (filters.genero) {
      filtered = filtered.filter(item => item.juegoId?.genero === filters.genero);
    }

    // Filtrar por plataforma
    if (filters.plataforma) {
      filtered = filtered.filter(item => 
        item.juegoId?.plataforma?.includes(filters.plataforma)
      );
    }

    // Filtrar por tipo (Personal o Global)
    if (filters.tipo === "personal") {
      filtered = filtered.filter(item => item.juegoId?.usuarioId);
    } else if (filters.tipo === "global") {
      filtered = filtered.filter(item => !item.juegoId?.usuarioId);
    }

    // Filtrar por calificación personal
    if (filters.calificacion) {
      const minCalificacion = parseInt(filters.calificacion);
      filtered = filtered.filter(item => 
        item.calificacionPersonal && item.calificacionPersonal >= minCalificacion
      );
    }

    // Filtrar por horas mínimas
    if (filters.horasMinimas) {
      const minHoras = parseInt(filters.horasMinimas);
      filtered = filtered.filter(item => 
        item.horasJugadas >= minHoras
      );
    }

    // Ordenar
    switch (filters.ordenar) {
      case "recientes":
        filtered.sort((a, b) => new Date(b.fechaAgregado) - new Date(a.fechaAgregado));
        break;
      case "antiguos":
        filtered.sort((a, b) => new Date(a.fechaAgregado) - new Date(b.fechaAgregado));
        break;
      case "alfabetico-az":
        filtered.sort((a, b) => a.juegoId?.titulo.localeCompare(b.juegoId?.titulo));
        break;
      case "alfabetico-za":
        filtered.sort((a, b) => b.juegoId?.titulo.localeCompare(a.juegoId?.titulo));
        break;
      case "mas-horas":
        filtered.sort((a, b) => (b.horasJugadas || 0) - (a.horasJugadas || 0));
        break;
      case "mejor-calificacion":
        filtered.sort((a, b) => (b.calificacionPersonal || 0) - (a.calificacionPersonal || 0));
        break;
      default:
        break;
    }

    setFilteredLibrary(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      estado: "",
      genero: "",
      plataforma: "",
      tipo: "",
      calificacion: "",
      horasMinimas: "",
      ordenar: "recientes"
    });
    setSearchTerm("");
  };

  const hasActiveFilters = () => {
    return filters.estado || filters.genero || filters.plataforma || 
           filters.tipo || filters.calificacion || filters.horasMinimas || searchTerm;
  };

  const handleDeleteClick = (game) => {
    setGameToDelete(game);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("accessToken"); 

      if (!token) {
        toast.error("No se encontró el token de autenticación");
        return;
      }

      if (gameToDelete.juegoId?.usuarioId) {
        await axios.delete(`/juegos/${gameToDelete.juegoId._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Juego personal eliminado permanentemente");
      } else {
        await axios.delete(`/mis-juegos/${gameToDelete._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Juego eliminado de tu biblioteca");
      }

      setShowDeleteModal(false);
      setGameToDelete(null);
      fetchLibrary();
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error(error.response?.data?.message || "Error al eliminar el juego");
    }
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      "Pendiente": { bg: "secondary", text: "Pendiente" },
      "En progreso": { bg: "primary", text: "En Progreso" },
      "Completado": { bg: "success", text: "Completado" }
    };

    const config = statusConfig[estado] || statusConfig["Pendiente"];
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  // Calcular estadísticas
  const stats = {
    total: allLibrary.length,
    created: allLibrary.filter(g => g.juegoId?.usuarioId).length,
    completed: allLibrary.filter(g => g.estado === "Completado").length,
    inProgress: allLibrary.filter(g => g.estado === "En progreso").length
  };

  if (loading) {
    return (
      <div className="library-loading">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando tu biblioteca...</p>
      </div>
    );
  }

  return (
    <>
      <div className="my-library-page">
        <Container>
          {/* Header */}
          <div className="library-header">
            <div className="header-content-lib">
              <FaPalette className="header-icon-lib" />
              <h1 className="library-title">Mi Biblioteca Personal</h1>
              <p className="library-subtitle">
                Gestiona tus juegos, rastrea tu progreso y crea tu propia colección
              </p>
            </div>
            
            <div className="header-actions">
              <Button 
                as={Link} 
                to="/my-library/create-game" 
                className="btn-create-game"
              >
                <FaPlus className="me-2" />
                Crear Nuevo Juego
              </Button>
              <Button 
                as={Link} 
                to="/games" 
                variant="outline-primary"
                className="btn-browse-games"
              >
                <FaGlobe className="me-2" />
                Explorar Catálogo
              </Button>
            </div>

            {/* Stats */}
            <div className="library-stats">
              <div className="stat-card">
                <h3>{stats.total}</h3>
                <p>Juegos Totales</p>
              </div>
              <div className="stat-card">
                <h3>{stats.created}</h3>
                <p>Juegos Creados</p>
              </div>
              <div className="stat-card">
                <h3>{stats.completed}</h3>
                <p>Completados</p>
              </div>
              <div className="stat-card">
                <h3>{stats.inProgress}</h3>
                <p>En Progreso</p>
              </div>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          {allLibrary.length > 0 && (
            <>
              <div className="filters-top-bar-lib">
                <div className="search-box-lib">
                  
                  <Form.Control
                    type="text"
                    placeholder="Buscar en tu biblioteca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-lib"
                  />
                  {searchTerm && (
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="clear-search-btn-lib"
                    >
                      <FaTimes />
                    </Button>
                  )}
                </div>

                <div className="filters-actions-lib">
                  <Badge bg="primary" className="results-badge-lib">
                    {filteredLibrary.length} de {allLibrary.length} juegos
                  </Badge>
                  
                  {hasActiveFilters() && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={clearFilters}
                      className="clear-all-btn-lib"
                    >
                      <FaTimes className="me-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              <Row>
                {/* Sidebar de Filtros */}
                <Col lg={3} md={12} className="filters-sidebar-lib">
                  <Card className="filters-card-lib">
                    <Card.Body>
                      <div className="filters-header-lib">
                        <h5 className="filters-title-lib">
                          <FaFilter className="me-2" />
                          Filtros
                        </h5>
                      </div>

                      {/* Estado */}
                      <Form.Group className="mb-3">
                        <Form.Label className="filter-label-lib">Estado</Form.Label>
                        <Form.Select 
                          value={filters.estado}
                          onChange={(e) => handleFilterChange("estado", e.target.value)}
                          className="filter-select-lib"
                        >
                          <option value="">Todos los estados</option>
                          {estados.map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      {/* Género */}
                      <Form.Group className="mb-3">
                        <Form.Label className="filter-label-lib">Género</Form.Label>
                        <Form.Select 
                          value={filters.genero}
                          onChange={(e) => handleFilterChange("genero", e.target.value)}
                          className="filter-select-lib"
                        >
                          <option value="">Todos los géneros</option>
                          {generos.map(genero => (
                            <option key={genero} value={genero}>{genero}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      {/* Plataforma */}
                      <Form.Group className="mb-3">
                        <Form.Label className="filter-label-lib">Plataforma</Form.Label>
                        <Form.Select 
                          value={filters.plataforma}
                          onChange={(e) => handleFilterChange("plataforma", e.target.value)}
                          className="filter-select-lib"
                        >
                          <option value="">Todas las plataformas</option>
                          {plataformas.map(plat => (
                            <option key={plat} value={plat}>{plat}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      {/* Tipo de Juego */}
                      <Form.Group className="mb-3">
                        <Form.Label className="filter-label-lib">Tipo de Juego</Form.Label>
                        <Form.Select 
                          value={filters.tipo}
                          onChange={(e) => handleFilterChange("tipo", e.target.value)}
                          className="filter-select-lib"
                        >
                          <option value="">Todos</option>
                          <option value="personal">Creados por mí</option>
                          <option value="global">Del catálogo global</option>
                        </Form.Select>
                      </Form.Group>

                      {/* Calificación Personal */}
                      <Form.Group className="mb-3">
                        <Form.Label className="filter-label-lib">Mi Calificación</Form.Label>
                        <Form.Select 
                          value={filters.calificacion}
                          onChange={(e) => handleFilterChange("calificacion", e.target.value)}
                          className="filter-select-lib"
                        >
                          <option value="">Todas</option>
                          {calificaciones.map(cal => (
                            <option key={cal.value} value={cal.value}>{cal.label}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      {/* Horas Mínimas */}
                      <Form.Group className="mb-3">
                        <Form.Label className="filter-label-lib">Horas Mínimas Jugadas</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          placeholder="Ej: 10"
                          value={filters.horasMinimas}
                          onChange={(e) => handleFilterChange("horasMinimas", e.target.value)}
                          className="filter-input-lib"
                        />
                      </Form.Group>

                      {/* Ordenar por */}
                      <Form.Group className="mb-3">
                        <Form.Label className="filter-label-lib">Ordenar por</Form.Label>
                        <Form.Select 
                          value={filters.ordenar}
                          onChange={(e) => handleFilterChange("ordenar", e.target.value)}
                          className="filter-select-lib"
                        >
                          <option value="recientes">Agregados recientemente</option>
                          <option value="antiguos">Más antiguos primero</option>
                          <option value="alfabetico-az">A-Z</option>
                          <option value="alfabetico-za">Z-A</option>
                          <option value="mas-horas">Más horas jugadas</option>
                          <option value="mejor-calificacion">Mejor calificados</option>
                        </Form.Select>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Grid de Juegos */}
                <Col lg={9} md={12}>
                  {filteredLibrary.length === 0 ? (
                    <div className="empty-library-filtered">
                      <FaPalette className="empty-icon-lib" />
                      <h3>No se encontraron juegos</h3>
                      <p>
                        {hasActiveFilters() 
                          ? "Intenta ajustar los filtros o limpiar la búsqueda"
                          : "Tu biblioteca está vacía"}
                      </p>
                      {!hasActiveFilters() && (
                        <div className="empty-actions">
                          <Button as={Link} to="/my-library/create-game" variant="primary">
                            <FaPlus className="me-2" />
                            Crear Mi Primer Juego
                          </Button>
                          <Button as={Link} to="/games" variant="outline-primary">
                            <FaGlobe className="me-2" />
                            Explorar Catálogo
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Row xs={1} sm={2} md={2} lg={3} className="g-4 library-grid">
                      {filteredLibrary.map((item) => {
                        const game = item.juegoId;
                        const isPersonalGame = game?.usuarioId ? true : false;

                        return (
                          <Col key={item._id}>
                            <Card className="library-card">
                              {isPersonalGame && (
                                <div className="personal-badge">
                                  <FaPalette className="me-1" />
                                  Creado por ti
                                </div>
                              )}

                              <div className="card-image-lib">
                                <Card.Img
                                  variant="top"
                                  src={game?.imagenPortada || "https://via.placeholder.com/300x400?text=Sin+Imagen"}
                                  alt={game?.titulo}
                                />
                                <div className="image-overlay">
                                  {getStatusBadge(item.estado)}
                                </div>
                              </div>

                              <Card.Body className="library-card-body">
                                <Card.Title className="game-title-lib">
                                  {game?.titulo || "Sin título"}
                                </Card.Title>

                                <div className="game-meta">
                                  <span className="meta-item">
                                    <strong>Género:</strong> {game?.genero || "N/A"}
                                  </span>
                                  <span className="meta-item">
                                    <strong>Plataforma:</strong> {game?.plataforma || "N/A"}
                                  </span>
                                  {item.horasJugadas > 0 && (
                                    <span className="meta-item">
                                      <strong>Horas:</strong> {item.horasJugadas}h
                                    </span>
                                  )}
                                  {item.calificacionPersonal && (
                                    <span className="meta-item rating">
                                      <strong>⭐</strong> {item.calificacionPersonal}/5
                                    </span>
                                  )}
                                </div>

                                <div className="card-actions">
                                  <Button
                                    as={Link}
                                    to={`/my-library/game/${item._id}`}
                                    variant="primary"
                                    size="sm"
                                    className="action-btn"
                                  >
                                    <FaEye className="me-1" />
                                    Ver
                                  </Button>

                                  {isPersonalGame && (
                                    <Button
                                      as={Link}
                                      to={`/my-library/edit-game/${game._id}`}
                                      variant="outline-primary"
                                      size="sm"
                                      className="action-btn"
                                    >
                                      <FaEdit className="me-1" />
                                      Editar
                                    </Button>
                                  )}

                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="action-btn"
                                    onClick={() => handleDeleteClick(item)}
                                  >
                                    <FaTrash className="me-1" />
                                    Eliminar
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </Col>
              </Row>
            </>
          )}

          {/* Empty state inicial (sin filtros) */}
          {allLibrary.length === 0 && (
            <div className="empty-library">
              <FaPalette className="empty-icon-lib" />
              <h3>Tu biblioteca está vacía</h3>
              <p>Comienza agregando juegos desde el catálogo o crea tus propios juegos</p>
              <div className="empty-actions">
                <Button as={Link} to="/my-library/create-game" variant="primary">
                  <FaPlus className="me-2" />
                  Crear Mi Primer Juego
                </Button>
                <Button as={Link} to="/games" variant="outline-primary">
                  <FaGlobe className="me-2" />
                  Explorar Catálogo
                </Button>
              </div>
            </div>
          )}
        </Container>
      </div>

      {/* Modal de confirmación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de que deseas eliminar{" "}
            <strong>{gameToDelete?.juegoId?.titulo}</strong> de tu biblioteca?
          </p>
          {gameToDelete?.juegoId?.usuarioId && (
            <div className="alert alert-warning">
              <strong>⚠️ Atención:</strong> Este es un juego creado por ti. Se eliminará permanentemente.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
}

export default MyLibrary;