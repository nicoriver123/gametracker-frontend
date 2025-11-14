import { useState } from "react";
import { Button, Form, Collapse, Badge } from "react-bootstrap";
import forumService from "../../api/forumService";
import toast from "react-hot-toast";
import "./Comentario.css";

function Comentario({ comentario, user, onDelete, onLike, onReply, postId }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const esAutor = user && user.id === comentario.usuarioId?._id;
  const hasLiked = user && comentario.likes?.includes(user.id);

  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const fechaComentario = new Date(fecha);
    const diferencia = Math.floor((ahora - fechaComentario) / 1000);

    if (diferencia < 60) return 'Hace un momento';
    if (diferencia < 3600) return `Hace ${Math.floor(diferencia / 60)} min`;
    if (diferencia < 86400) return `Hace ${Math.floor(diferencia / 3600)} h`;
    
    return fechaComentario.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReply = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión para responder");
      return;
    }

    if (!replyText.trim()) {
      toast.error("La respuesta no puede estar vacía");
      return;
    }

    try {
      setLoading(true);
      await forumService.createComment({
        postId,
        contenido: replyText.trim(),
        parentCommentId: comentario._id
      });
      setReplyText("");
      setShowReplyForm(false);
      toast.success("Respuesta publicada");
      onReply();
    } catch (error) {
      console.error("Error al responder:", error);
      toast.error("Error al publicar respuesta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comentario mb-3">
      <div className="comentario-principal">
        <div className="d-flex gap-3">
          <img
            src={comentario.usuarioId?.avatar || 'https://via.placeholder.com/40'}
            alt={comentario.usuarioId?.username}
            className="rounded-circle"
            width="40"
            height="40"
          />
          
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <strong>{comentario.usuarioId?.username}</strong>
                <span className="text-muted small ms-2">
                  {formatearFecha(comentario.fechaCreacion)}
                  {comentario.isEdited && (
                    <Badge bg="secondary" className="ms-2">editado</Badge>
                  )}
                </span>
              </div>
              
              {esAutor && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger"
                  onClick={() => onDelete(comentario._id)}
                >
                  🗑️
                </Button>
              )}
            </div>

            <p className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>
              {comentario.contenido}
            </p>

            <div className="d-flex gap-3 align-items-center">
              <Button
                variant="link"
                size="sm"
                className={`p-0 ${hasLiked ? 'text-danger' : 'text-muted'}`}
                onClick={() => onLike(comentario._id)}
              >
                {hasLiked ? '❤️' : '🤍'} {comentario.likes?.length || 0}
              </Button>
              
              {user && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-muted"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  💬 Responder
                </Button>
              )}

              {comentario.replies && comentario.replies.length > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-muted"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  {showReplies ? '▼' : '▶'} {comentario.replies.length} respuesta
                  {comentario.replies.length !== 1 ? 's' : ''}
                </Button>
              )}
            </div>

            {/* Formulario de respuesta */}
            <Collapse in={showReplyForm}>
              <div className="mt-3">
                <Form onSubmit={handleReply}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      maxLength={2000}
                    />
                  </Form.Group>
                  <div className="d-flex gap-2 justify-content-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyText("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      disabled={loading || !replyText.trim()}
                    >
                      {loading ? 'Enviando...' : 'Responder'}
                    </Button>
                  </div>
                </Form>
              </div>
            </Collapse>
          </div>
        </div>
      </div>

      {/* Respuestas anidadas */}
      {comentario.replies && comentario.replies.length > 0 && (
        <Collapse in={showReplies}>
          <div className="respuestas ms-5 mt-3">
            {comentario.replies.map((reply) => (
              <Comentario
                key={reply._id}
                comentario={reply}
                user={user}
                onDelete={onDelete}
                onLike={onLike}
                onReply={onReply}
                postId={postId}
              />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  );
}

export default Comentario;