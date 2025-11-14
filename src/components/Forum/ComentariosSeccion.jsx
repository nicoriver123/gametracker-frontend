import { useEffect, useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import forumService from "../../api/forumService";
import { useAuth } from "../../context/useAuth";
import Comentario from "./Comentario";
import toast from "react-hot-toast";
import "./ComentariosSeccion.css";

function ComentariosSeccion({ postId, isClosed }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingComentarios, setLoadingComentarios] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    cargarComentarios();
  }, [postId]);

  const cargarComentarios = async () => {
    try {
      setLoadingComentarios(true);
      const data = await forumService.getCommentsByPost(postId);
      setComentarios(data.comments);
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
      toast.error("Error al cargar comentarios");
    } finally {
      setLoadingComentarios(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para comentar");
      return;
    }

    if (!nuevoComentario.trim()) {
      toast.error("El comentario no puede estar vacío");
      return;
    }

    if (nuevoComentario.length > 2000) {
      toast.error("El comentario no puede exceder 2000 caracteres");
      return;
    }

    try {
      setLoading(true);
      await forumService.createComment({
        postId,
        contenido: nuevoComentario.trim()
      });
      setNuevoComentario("");
      toast.success("Comentario publicado");
      cargarComentarios();
    } catch (error) {
      console.error("Error al crear comentario:", error);
      toast.error("Error al publicar comentario");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (comentarioId) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;

    try {
      await forumService.deleteComment(comentarioId);
      toast.success("Comentario eliminado");
      cargarComentarios();
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      toast.error("No se pudo eliminar el comentario");
    }
  };

  const handleLike = async (comentarioId) => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para dar like");
      return;
    }

    try {
      await forumService.toggleLikeComment(comentarioId);
      cargarComentarios();
    } catch (error) {
      console.error("Error al dar like:", error);
      toast.error("Error al dar like");
    }
  };

  return (
    <div className="comentarios-seccion">
      <h3 className="mb-4">💬 Comentarios ({comentarios.length})</h3>

      {/* Formulario para nuevo comentario */}
      {!isClosed ? (
        isAuthenticated ? (
          <div className="nuevo-comentario mb-4">
            <div className="d-flex gap-3">
              <img
                src={user?.avatar || 'https://via.placeholder.com/40'}
                alt={user?.username}
                className="rounded-circle"
                width="40"
                height="40"
              />
              <div className="flex-grow-1">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      as="textarea"
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      placeholder="Escribe tu comentario..."
                      rows={3}
                      maxLength={2000}
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      {nuevoComentario.length}/2000 caracteres
                    </Form.Text>
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="primary"
                      type="submit" 
                      disabled={loading || !nuevoComentario.trim()}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Publicando...
                        </>
                      ) : (
                        'Comentar'
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        ) : (
          <Alert variant="warning" className="mb-4">
            <p className="mb-0">
              Debes <a href="/login">iniciar sesión</a> para comentar
            </p>
          </Alert>
        )
      ) : (
        <Alert variant="secondary" className="mb-4">
          🔒 Este post está cerrado para comentarios
        </Alert>
      )}

      {/* Lista de comentarios */}
      {loadingComentarios ? (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : comentarios.length === 0 ? (
        <Alert variant="info">
          No hay comentarios todavía. ¡Sé el primero en comentar!
        </Alert>
      ) : (
        <div className="comentarios-lista">
          {comentarios.map((comentario) => (
            <Comentario
              key={comentario._id}
              comentario={comentario}
              user={user}
              onDelete={handleDelete}
              onLike={handleLike}
              onReply={cargarComentarios}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ComentariosSeccion;