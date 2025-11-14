import { Card, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./CategoriesSection.css";

const categories = [
  { nombre: "Accion", icono: "⚔️", color: "#ef4444" },
  { nombre: "Aventura", icono: "🗺️", color: "#10b981" },
  { nombre: "RPG", icono: "🧙‍♂️", color: "#3b82f6" },
  { nombre: "Estrategia", icono: "🧠", color: "#f59e0b" },
  { nombre: "Deportes", icono: "⚽", color: "#22c55e" },
  { nombre: "Carreras", icono: "🏎️", color: "#a855f7" },
  { nombre: "Simulacion", icono: "🛠️", color: "#06b6d4" },
];

export default function CategoriesSection() {
  const navigate = useNavigate();

  const handleClick = (genre) => {
    navigate(`/games/category/${genre}`);
  };

  return (
    <section className="categories-section container my-5">
      <h2 className="section-title text-center mb-4">🎯 Explora por Categorías</h2>

      <Row xs={2} sm={3} md={4} lg={7} className="g-3 justify-content-center">
        {categories.map((cat) => (
          <Col key={cat.nombre}>
            <Card
              className="category-card text-center shadow-sm"
              style={{ borderTop: `4px solid ${cat.color}` }}
              onClick={() => handleClick(cat.nombre)}
            >
              <Card.Body>
                <div
                  className="category-icon"
                  style={{ color: cat.color }}
                >
                  {cat.icono}
                </div>
                <Card.Title className="mt-2">{cat.nombre}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
