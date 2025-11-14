import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Button, Spinner, Alert, Badge } from "react-bootstrap";
import forumService from "../api/forumService";
import { useAuth } from "../context/useAuth";
import ComentariosSeccion from "../components/Forum/ComentariosSeccion";
import toast from "react-hot-toast";
//import "./css/ForumPostView.css";

function ForumPostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    cargarPost();
  }, [id]);

  const cargarPost = async () => {
    try {
      setLoading(true);
      const data = await forumService.getPostById(id);
      setPost(data.post);
      
      // Verificar si el usuario ya dio like
      if (user && data.post.likes) {
        setHasLiked(data.post.likes.includes(user.id));
      }
    } catch (error) {
      console.error("Error al cargar post:", error);
      toast.error("Error al cargar el post");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para dar like");
      return;
    }

    try {
      const data = await forumService.toggleLikePost(id);
      setPost(prev => ({
        ...prev,
        likes: Array(data.likes).fill(null)
      }));
      setHasLiked(data.hasLiked);
      toast.success(data.hasLiked ? 'Like agregado' : 'Like removido');
    } catch (error) {
      console.error("Error al dar like:", error);
      toast.error("Error al dar like");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de eliminar este post?")) return;

    try {
      await forumService.deletePost(id);
      toast.success("Post eliminado exitosamente");
      navigate('/forum');
    } catch (error) {
      console.error("Error al eliminar post:", error);
      toast.error("No se pudo eliminar el post");
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      'General': 'primary',
      'Ayuda': 'success',
      'Recomendaciones': 'info',
      'Discusión': 'warning',
      'Noticias': 'danger',
      'Off-Topic': 'secondary'
    };
    return colors[categoria] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="text-center mt-5 pt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando post...</p>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="mt-5 pt-5">
        <Alert variant="danger">
          <h4>Post no encontrado</h4>
          <Link to="/forum">
            <Button variant="primary">Volver al foro</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  const esAutor = user && user.id === post.usuarioId?._id;

  return (
    <Container className="post-view-container mt-5 pt-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/forum">Foro</Link>
          </li>
          <li className="breadcrumb-item active">{post.categoria}</li>
        </ol>
      </nav>

      {/* Post */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <Badge bg={getCategoryColor(post.categoria)} className="me-2">
                {post.categoria}
              </Badge>
              {post.isPinned && <Badge bg="warning" text="dark">📌 Fijado</Badge>}
              {post.isClosed && <Badge bg="secondary">🔒 Cerrado</Badge>}
            </div>
            {esAutor && (
              <div className="btn-group">
                <Link to={`/forum/edit/${post._id}`}>
                  <Button variant="outline-primary" size="sm">
                    ✏️ Editar
                  </Button>
                </Link>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={handleDelete}
                >
                  🗑️ Eliminar
                </Button>
              </div>
            )}
          </div>

          <h1 className="mb-4">{post.titulo}</h1>

          <div className="d-flex align-items-center mb-4">
            <img
              src={post.usuarioId?.avatar || 'https://via.placeholder.com/50'}
              alt={post.usuarioId?.username}
              className="rounded-circle me-3"
              width="50"
              height="50"
            />
            <div>
              <strong className="d-block">{post.usuarioId?.username}</strong>
              <small className="text-muted">{formatearFecha(post.fechaCreacion)}</small>
            </div>
          </div>

          <div className="post-content mb-4">
            <p style={{ whiteSpace: 'pre-wrap' }}>{post.contenido}</p>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mb-3">
              {post.tags.map((tag, index) => (
                <Badge key={index} bg="secondary" className="me-2">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="d-flex gap-3 align-items-center">
            <Button 
              variant={hasLiked ? "danger" : "outline-danger"}
              onClick={handleLike}
              disabled={!isAuthenticated}
            >
              {hasLiked ? '❤️' : '🤍'} {post.likes?.length || 0} likes
            </Button>
            <span className="text-muted">👁️ {post.vistas} vistas</span>
          </div>
        </div>
      </div>

      {/* Sección de Comentarios */}
      <ComentariosSeccion postId={id} isClosed={post.isClosed} />
    </Container>
  );
}

export default ForumPostView;