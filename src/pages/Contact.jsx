import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import Footer from "../components/Footer/Footer";
import "./css/Contact.css";

const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      await axios.post("http://localhost:5100/api/contact", form);
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 5000);
    }
  };

  return (
    <>
      <div className="contact-container">
        <div className="container">
          <h1 className="contact-title">Contáctanos</h1>

          <div className="row g-5">
            {/* MAPA */}
            <div className="col-lg-6">
              <h2 className="mb-4 d-flex align-items-center gap-3">
                Ubicación
                <span className="badge-location">Bogotá, Colombia</span>
              </h2>
              <div className="contact-map-wrapper">
                <MapContainer center={[4.711, -74.0721]} zoom={16} style={{ height: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[4.711, -74.0721]} icon={customIcon}>
                    <Popup>
                      <strong>GameTracker</strong>
                      <br />
                      Cra 7 # 12-45, Bogotá
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* FORMULARIO */}
            <div className="col-lg-6">
              <h2 className="mb-4">Envíanos un Mensaje</h2>

              {status === "success" && (
                <div className="contact-alert contact-alert-success">
                  Mensaje enviado correctamente ✅
                </div>
              )}
              {status === "error" && (
                <div className="contact-alert contact-alert-error">
                  Error al enviar el mensaje ❌
                </div>
              )}

              <div className="contact-form-card">
                <div className="contact-form-header">
                  <h4>Formulario de Contacto</h4>
                </div>
                <div className="p-5">
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Tu nombre"
                      className="contact-input mb-3 w-100"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="tu@email.com"
                      className="contact-input mb-3 w-100"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="subject"
                      placeholder="Asunto"
                      className="contact-input mb-3 w-100"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    />
                    <textarea
                      name="message"
                      placeholder="Tu mensaje..."
                      className="contact-textarea w-100 mb-4"
                      value={form.message}
                      onChange={handleChange}
                      required
                    />
                    <button type="submit" disabled={loading} className="contact-btn">
                      {loading ? "Enviando..." : "Enviar Mensaje"}
                    </button>
                  </form>
                </div>
              </div>

              {/* INFO */}
              <div className="row mt-5 g-4">
                <div className="col-md-4">
                  <div className="contact-info-card">
                    <h5>Dirección</h5>
                    <p>Cra 7 # 12-45<br />Bogotá, Colombia</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="contact-info-card">
                    <h5>Teléfono</h5>
                    <p>+57 301 234 5678</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="contact-info-card">
                    <h5>Email</h5>
                    <p>
                      <a href="mailto:technicolas26@gmail.com" style={{ color: "#4361ee" }}>
                        technicolas26@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </>
  );
}
