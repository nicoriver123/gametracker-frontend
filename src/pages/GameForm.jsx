import { useState, useEffect } from "react";
import { Container, Form, Button, Card, Row, Col, ProgressBar } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaSave, FaTimes, FaGamepad, FaCloudUploadAlt } from "react-icons/fa";
import axios from "../api/axiosConfig";
import toast from "react-hot-toast";
import "./css/GameForm.css";

function GameForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    titulo: "",
    genero: "",
    plataforma: "",
    añoLanzamiento: new Date().getFullYear(),
    desarrollador: "",
    imagenPortada: null,
    descripcion: "",
    estado: "Pendiente",
    horasJugadas: 0,
    calificacionPersonal: 0
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingGame, setLoadingGame] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isEditing) {
      fetchGameData();
    }
  }, [id]);

  const fetchGameData = async () => {
    try {
      setLoadingGame(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`/juegos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData({
        titulo: res.data.game.titulo || "",
        genero: res.data.game.genero || "",
        plataforma: res.data.game.plataforma || "",
        añoLanzamiento: res.data.game.añoLanzamiento || new Date().getFullYear(),
        desarrollador: res.data.game.desarrollador || "",
        imagenPortada: res.data.game.imagenPortada || null,
        descripcion: res.data.game.descripcion || "",
        estado: res.data.game.estado || "Pendiente",
        horasJugadas: res.data.game.horasJugadas || 0,
        calificacionPersonal: res.data.game.calificacionPersonal || 0
      });

      if (res.data.game.imagenPortada) {
        setImagePreview(res.data.game.imagenPortada);
      }
    } catch (error) {
      console.error("Error al cargar juego:", error);
      toast.error("Error al cargar los datos del juego");
      navigate("/my-library");
    } finally {
      setLoadingGame(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 📸 Manejo de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor selecciona una imagen válida");
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar 5MB");
        return;
      }

      setFormData(prev => ({
        ...prev,
        imagenPortada: file
      }));

      // Mostrar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.titulo.trim()) {
      toast.error("El título es requerido");
      return;
    }
    if (!formData.genero.trim()) {
      toast.error("El género es requerido");
      return;
    }
    if (!formData.plataforma.trim()) {
      toast.error("La plataforma es requerida");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      // 📝 Crear FormData para enviar archivo
      const formDataToSend = new FormData();
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("genero", formData.genero);
      formDataToSend.append("plataforma", formData.plataforma);
      formDataToSend.append("añoLanzamiento", parseInt(formData.añoLanzamiento));
      formDataToSend.append("desarrollador", formData.desarrollador);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("esGlobal", false);

      // Agregar imagen si es un archivo nuevo
      if (formData.imagenPortada instanceof File) {
        formDataToSend.append("imagenPortada", formData.imagenPortada);
      }

      if (isEditing) {
        // Actualizar juego existente
        await axios.put(`/juegos/${id}`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
        toast.success("Juego actualizado exitosamente");
      } else {
        // Crear nuevo juego
        const gameRes = await axios.post("/juegos", formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });

        // Agregar a la biblioteca del usuario
        await axios.post("/mis-juegos", {
          juegoId: gameRes.data.game._id,
          estado: formData.estado,
          horasJugadas: parseInt(formData.horasJugadas),
          calificacionPersonal: parseInt(formData.calificacionPersonal)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        toast.success("Juego creado y agregado a tu biblioteca");
      }

      navigate("/my-library");
    } catch (error) {
      console.error("Error al guardar juego:", error);
      toast.error(error.response?.data?.message || "Error al guardar el juego");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (loadingGame) {
    return (
      <div className="form-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando datos del juego...</p>
      </div>
    );
  }

  return (
    <div className="game-form-page">
      <Container>
        <div className="form-header">
          <FaGamepad className="form-icon" />
          <h1 className="form-title">
            {isEditing ? "Editar Juego" : "Crear Nuevo Juego"}
          </h1>
          <p className="form-subtitle">
            {isEditing 
              ? "Actualiza la información de tu juego" 
              : "Agrega un nuevo juego a tu biblioteca personal"
            }
          </p>
        </div>

        <Card className="form-card">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                {/* Título */}
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Título del Juego <span className="required">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      placeholder="Ej: The Last of Us"
                      required
                      className="form-input-custom"
                    />
                  </Form.Group>
                </Col>

                {/* Género */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Género <span className="required">*</span>
                    </Form.Label>
                    <Form.Select
                      name="genero"
                      value={formData.genero}
                      onChange={handleChange}
                      required
                      className="form-input-custom"
                    >
                      <option value="">Selecciona un género</option>
                      <option value="Accion">Acción</option>
                      <option value="Aventura">Aventura</option>
                      <option value="RPG">RPG</option>
                      <option value="Estrategia">Estrategia</option>
                      <option value="Deportes">Deportes</option>
                      <option value="Carreras">Carreras</option>
                      <option value="Simulacion">Simulación</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Plataforma */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Plataforma <span className="required">*</span>
                    </Form.Label>
                    <Form.Select
                      name="plataforma"
                      value={formData.plataforma}
                      onChange={handleChange}
                      required
                      className="form-input-custom"
                    >
                      <option value="">Selecciona una plataforma</option>
                      <option value="PC">PC</option>
                      <option value="PS5">PS5</option>
                      <option value="Xbox">Xbox</option>
                      <option value="Nintendo Switch">Nintendo Switch</option>
                      <option value="PS">PS</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Año de Lanzamiento */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Año de Lanzamiento
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="añoLanzamiento"
                      value={formData.añoLanzamiento}
                      onChange={handleChange}
                      min="1970"
                      max={new Date().getFullYear()}
                      className="form-input-custom"
                    />
                  </Form.Group>
                </Col>

                {/* Desarrollador */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Desarrollador
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="desarrollador"
                      value={formData.desarrollador}
                      onChange={handleChange}
                      placeholder="Ej: Naughty Dog"
                      className="form-input-custom"
                    />
                  </Form.Group>
                </Col>

                {/* 📸 Imagen de Portada - MEJORADO */}
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Imagen de Portada
                    </Form.Label>
                    <div className="image-upload-wrapper">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="form-input-custom"
                        disabled={loading}
                      />
                      <small className="text-muted d-block mt-2">
                        📁 Formatos: JPG, PNG, WebP, GIF | Máximo: 5MB
                      </small>
                    </div>

                    {/* Barra de progreso */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-3">
                        <ProgressBar 
                          now={uploadProgress} 
                          label={`${uploadProgress}%`}
                          animated
                        />
                      </div>
                    )}

                    {/* Preview de imagen */}
                    {imagePreview && (
                      <div className="image-preview mt-3">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x400?text=Imagen+No+Disponible";
                          }}
                        />
                        <div className="preview-info">
                          <FaCloudUploadAlt className="me-2" />
                          {formData.imagenPortada instanceof File 
                            ? "Nueva imagen seleccionada" 
                            : "Imagen actual"}
                        </div>
                      </div>
                    )}
                  </Form.Group>
                </Col>

                {/* Estado 
                {!isEditing && (
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label-custom">Estado</Form.Label>
                      <Form.Select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="form-input-custom"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En progreso">En Progreso</option>
                        <option value="Completado">Completado</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}*/}

                {/* Horas Jugadas 
                {!isEditing && (
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label-custom">
                        Horas Jugadas
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="horasJugadas"
                        value={formData.horasJugadas}
                        onChange={handleChange}
                        min="0"
                        className="form-input-custom"
                      />
                    </Form.Group>
                  </Col>
                )}*/}

                {/* Calificación Personal
                {!isEditing && (
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label-custom">
                        Calificación (0-5)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="calificacionPersonal"
                        value={formData.calificacionPersonal}
                        onChange={handleChange}
                        min="0"
                        max="5"
                        step="0.5"
                        className="form-input-custom"
                      />
                    </Form.Group>
                  </Col>
                )} */}

                {/* Descripción */}
                <Col md={12}>
                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">
                      Descripción
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Describe el juego, tu experiencia, etc."
                      className="form-input-custom"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Botones */}
              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => navigate("/my-library")}
                  className="btn-cancel"
                  disabled={loading}
                >
                  <FaTimes className="me-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="btn-save"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" />
                      {isEditing ? "Actualizar Juego" : "Crear Juego"}
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default GameForm;
