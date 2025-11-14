import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Button, Form, InputGroup, Spinner, Alert } from "react-bootstrap";
import forumService from "../api/forumService";
import { useAuth } from "../context/useAuth";
import toast from "react-hot-toast";
import Footer from "../components/Footer/Footer"; // 👈 ya lo tienes importado
import "./css/Forum.css";

function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    categoria: "",
    busqueda: "",
    page: 1
  });
  const [pagination, setPagination] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    cargarPosts();
  }, [filtros]);

  const cargarPosts = async () => {
    try {
      setLoading(true);
      const data = await forumService.getAllPosts(filtros);
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error al cargar posts:", error);
      toast.error("Error al cargar los posts");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (name, value) => {
    setFiltros((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const cambiarPagina = (nuevaPagina) => {
    setFiltros((prev) => ({ ...prev, page: nuevaPagina }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const fechaPost = new Date(fecha);
    const diferencia = Math.floor((ahora - fechaPost) / 1000);

    if (diferencia < 60) return "Hace un momento";
    if (diferencia < 3600) return `Hace ${Math.floor(diferencia / 60)} min`;
    if (diferencia < 86400) return `Hace ${Math.floor(diferencia / 3600)} h`;
    if (diferencia < 2592000) return `Hace ${Math.floor(diferencia / 86400)} días`;

    return fechaPost.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* CONTENIDO PRINCIPAL DEL FORO */}
      <Container className="forum-container mt-5 pt-5">
        {/* Header del Foro */}
        <div className="forum-header mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1 className="display-5 fw-bold text-primary">💬 Foro de GameTracker</h1>
              <p className="text-muted">
                Comparte opiniones, descubre juegos y conecta con la comunidad.
              </p>
            </div>
            {isAuthenticated && (
              <Link to="/forum/new">
                <Button variant="primary" size="lg" className="mt-3 mt-md-0">
                  ✏️ Crear Post
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="forum-filters mb-4 p-3 bg-light rounded shadow-sm">
          <div className="row g-3">
            <div className="col-md-6">
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar posts..."
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange("busqueda", e.target.value)}
                />
              </InputGroup>
            </div>

            <div className="col-md-6">
              <Form.Select
                value={filtros.categoria}
                onChange={(e) => handleFiltroChange("categoria", e.target.value)}
              >
                <option value="">Todas las categorías</option>
                <option value="General">General</option>
                <option value="Ayuda">Ayuda</option>
                <option value="Recomendaciones">Recomendaciones</option>
                <option value="Discusión">Discusión</option>
                <option value="Noticias">Noticias</option>
                <option value="Off-Topic">Off-Topic</option>
              </Form.Select>
            </div>
          </div>
        </div>

        {/* Lista de Posts */}
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Alert variant="info" className="text-center shadow-sm">
            <h4>📭 No hay posts que coincidan con tu búsqueda</h4>
            {isAuthenticated && (
              <Link to="/forum/new">
                <Button variant="primary" className="mt-3">
                  Sé el primero en crear un post
                </Button>
              </Link>
            )}
          </Alert>
        ) : (
          <>
            <div className="posts-list">
              {posts.map((post) => (
                <Link
                  to={`/forum/post/${post._id}`}
                  key={post._id}
                  className="post-card text-decoration-none"
                >
                  <div className="card mb-3 shadow-sm hover-shadow">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                          <img
                            src={post.usuarioId?.avatar || "https://via.placeholder.com/40"}
                            alt={post.usuarioId?.username}
                            className="rounded-circle me-3"
                            width="40"
                            height="40"
                          />
                          <div>
                            <strong className="d-block">{post.usuarioId?.username}</strong>
                            <small className="text-muted">{formatearFecha(post.fechaCreacion)}</small>
                          </div>
                        </div>
                        <span className={`badge bg-${getCategoryColor(post.categoria)}`}>
                          {post.categoria}
                        </span>
                      </div>

                      <div className="post-content">
                        <div className="mb-2">
                          {post.isPinned && (
                            <span className="badge bg-warning text-dark me-2">📌 Fijado</span>
                          )}
                          <h5 className="card-title mb-2">{post.titulo}</h5>
                        </div>
                        <p className="card-text text-muted">
                          {post.contenido.substring(0, 150)}
                          {post.contenido.length > 150 && "..."}
                        </p>
                        {post.tags && post.tags.length > 0 && (
                          <div className="mb-2">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="badge bg-secondary me-1">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="d-flex gap-3 text-muted small">
                        <span>👁️ {post.vistas} vistas</span>
                        <span>💬 {post.commentCount || 0} respuestas</span>
                        <span>❤️ {post.likes?.length || 0} likes</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Paginación */}
            {pagination && pagination.pages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 my-4">
                <Button
                  variant="outline-primary"
                  onClick={() => cambiarPagina(filtros.page - 1)}
                  disabled={filtros.page === 1}
                >
                  ← Anterior
                </Button>

                <span className="text-muted">
                  Página {filtros.page} de {pagination.pages}
                </span>

                <Button
                  variant="outline-primary"
                  onClick={() => cambiarPagina(filtros.page + 1)}
                  disabled={filtros.page === pagination.pages}
                >
                  Siguiente →
                </Button>
              </div>
            )}
          </>
        )}
      </Container>

      {/* 👇 Footer fijo y coherente con el resto del sitio */}
      <Footer />
    </>
  );
}

// Función auxiliar para colores de categorías
function getCategoryColor(categoria) {
  const colors = {
    General: "primary",
    Ayuda: "success",
    Recomendaciones: "info",
    Discusión: "warning",
    Noticias: "danger",
    "Off-Topic": "secondary",
  };
  return colors[categoria] || "secondary";
}

export default Forum;
