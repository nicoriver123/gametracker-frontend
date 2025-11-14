import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaGamepad } from 'react-icons/fa';
import { useAuth } from '../../context/useAuth';
import './Header.css';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" bg="dark" variant="dark" className="custom-navbar" fixed="top">
      <Container className="d-flex justify-content-between align-items-center">
        {/* Logo y nombre */}
        <Navbar.Brand as={Link} to="/" className="brand d-flex align-items-center">
          <FaGamepad className="logo" size={30} />
          <span className="brand-text ms-2">
            <span className="brand-white">Game </span>
            <span className="brand-yellow">Tracker</span>
          </span>
        </Navbar.Brand>

        {/* Menú principal */}
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="mx-auto text-center">
            <Nav.Link as={Link} to="/" className="nav-link-custom">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/games" className="nav-link-custom">
              Games
            </Nav.Link>
            <Nav.Link as={Link} to="/reviews" className="nav-link-custom">Reseñas</Nav.Link>

            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/my-library" className="nav-link-custom">
                  Mi Biblioteca
                </Nav.Link>
                <Nav.Link as={Link} to="/dashboard" className="nav-link-custom">
                  Dashboard
                </Nav.Link>
              </>
            )}
             <Nav.Link as={Link} to="/forum" className="nav-link-custom">
              Foro
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" className="nav-link-custom">
              Contacto
            </Nav.Link>
          </Nav>

          {/* Autenticación */}
          {isAuthenticated ? (
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" id="user-dropdown" className="user-dropdown-btn">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.nombre} 
                    className="user-avatar"
                  />
                ) : (
                  <FaUser className="me-2" />
                )}
                {user?.username || user?.nombre}
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown-menu-dark">
                {/* <Dropdown.Item as={Link} to="/profile">
                  <FaUser className="me-2" />
                  Mi Perfil
                </Dropdown.Item> Added link to "Mi Biblioteca" */}
                <Dropdown.Item as={Link} to="/my-library">
                  <FaGamepad className="me-2" />
                  Mi Biblioteca
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Button as={Link} to="/login" className="login-btn">
              Login / Register
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;