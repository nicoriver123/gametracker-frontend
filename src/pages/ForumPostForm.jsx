import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Container, Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import forumService from "../api/forumService";
import { useAuth } from "../context/useAuth";
import toast from "react-hot-toast";

function ForumPostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(!!id);
  const [form, setForm] = useState({
    titulo: "",
    contenido: "",
    categoria: "General",
    tags: ""
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para crear un post");
      navigate('/login');
      return;
    }

    if (id) {
      cargarPost();
    }
  }, [id, isAuthenticated, navigate]);

  const cargarPost = async () => {
    try {
      setLoadingPost(true);
      const data = await forumService.getPostById(id);
      const post = data.post;
      setForm({
        titulo: post.titulo,
        contenido: post.contenido,
        categoria: post.categoria,
        tags: post.tags ? post.tags.join(', ') : ''
      });
    } catch (error) {
      console.error("Error al cargar post:", error);
      toast.error("Error al cargar el post");
      navigate('/forum');
    } finally {
      setLoadingPost(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titulo.trim() || !form.contenido.trim()) {
      toast.error("Título y contenido son requeridos");
      return;
    }

    if (form.titulo.length > 200) {
      toast.error("El título no puede exceder 200 caracteres");
      return;
    }

    if (form.contenido.length > 5000) {
      toast.error("El contenido no puede exceder 5000 caracteres");
      return;
    }

    try {
      setLoading(true);
      
      const data = {
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        categoria: form.categoria,
        tags: form.tags 
          ? form.tags.split(',').map(t => t.trim()).filter(t => t)
          : []
      };

      if (id) {
        await forumService.updatePost(id, data);
        toast.success("Post actualizado exitosamente");
        navigate(`/forum/post/${id}`);
      } else {
        const response = await forumService.createPost(data);
        toast.success("Post creado exitosamente");
        navigate(`/forum/post/${response.post._id}`);
      }
    } catch (error) {
      console.error("Error al guardar post:", error);
      toast.error(error.message || "Error al guardar el post");
    } finally {
      setLoading(false);
    }
  };

  if (loadingPost) {
    return (
      <Container className="text-center mt-5 pt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-5" style={{ maxWidth: '800px' }}>
      <Card className="shadow-sm">
        <Card.Header as="h2" className="bg-primary text-white">
          {id ? '✏️ Editar Post' : '✨ Crear Nuevo Post'}
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Título */}
            <Form.Group className="mb-3">
              <Form.Label>Título <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Escribe un título descriptivo..."
                maxLength={200}
                required
              />
              <Form.Text className="text-muted">
                {form.titulo.length}/200 caracteres
              </Form.Text>
            </Form.Group>

            {/* Categoría */}
            <Form.Group className="mb-3">
              <Form.Label>Categoría <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
              >
                <option value="General">General</option>
                <option value="Ayuda">Ayuda</option>
                <option value="Recomendaciones">Recomendaciones</option>
                <option value="Discusión">Discusión</option>
                <option value="Noticias">Noticias</option>
                <option value="Off-Topic">Off-Topic</option>
              </Form.Select>
            </Form.Group>

            {/* Contenido */}
            <Form.Group className="mb-3">
              <Form.Label>Contenido <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                name="contenido"
                value={form.contenido}
                onChange={handleChange}
                placeholder="Comparte tu opinión, pregunta o discusión..."
                rows={10}
                maxLength={5000}
                required
                style={{ resize: 'vertical' }}
              />
              <Form.Text className="text-muted">
                {form.contenido.length}/5000 caracteres
              </Form.Text>
            </Form.Group>

            {/* Tags */}
            <Form.Group className="mb-4">
              <Form.Label>Tags (opcional)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="RPG, acción, multijugador (separados por comas)"
              />
              <Form.Text className="text-muted">
                Separa los tags con comas. Ejemplo: RPG, acción, multiplayer
              </Form.Text>
            </Form.Group>

            {/* Botones */}
            <div className="d-flex gap-2 justify-content-end">
              <Button 
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      className="me-2"
                    />
                    Guardando...
                  </>
                ) : (
                  id ? 'Actualizar Post' : 'Publicar Post'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Ayuda */}
      <Alert variant="info" className="mt-3">
        <strong>💡 Consejos:</strong>
        <ul className="mb-0 mt-2">
          <li>Escribe un título claro y descriptivo</li>
          <li>Elige la categoría más apropiada para tu post</li>
          <li>Sé respetuoso con otros usuarios</li>
          <li>Usa los tags para ayudar a otros a encontrar tu post</li>
        </ul>
      </Alert>
    </Container>
  );
}

export default ForumPostForm;