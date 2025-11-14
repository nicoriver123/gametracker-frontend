import Carousel from 'react-bootstrap/Carousel'
import './GameCarousel.css'

function GameCarousel() {
  return (
    <div className="carousel-container">
      <Carousel fade>
        <Carousel.Item>
          <div className="carousel-overlay"></div>
          <img
            className="d-block w-100 carousel-image"
            src="https://cloudfront-us-east-1.images.arcpublishing.com/elespectador/BDDGPIBOABEGFPADC47YAYMZAU.jpg"
            alt="First slide"
          />
          <Carousel.Caption className="custom-caption">
            <h3 className="animated-title">Exploración y pasión por los videojuegos</h3>
            <p className="animated-text">Descubre, juega y conquista — el mundo gamer te espera. ⚡</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <div className="carousel-overlay"></div>
          <img
            className="d-block w-100 carousel-image"
            src="https://sm.ign.com/ign_es/feature/t/the-witche/the-witcher-how-cd-projekt-red-created-one-of-the-biggest-na_5q6b.jpg"
            alt="Second slide"
          />
          <Carousel.Caption className="custom-caption">
            <h3 className="animated-title">Rendimiento y tecnología</h3>
            <p className="animated-text">Lleva tu experiencia al siguiente nivel con GameTracker. 🏆</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <div className="carousel-overlay"></div>
          <img
            className="d-block w-100 carousel-image"
            src="https://help.ea.com/_images/seegk6e7ypwi/6LoXkInGyt8wLANsuTALpy/2e268ae9e3341e29f1c3e3dd0a6d4bad/need-for-speed-heat-hero.webp"
            alt="Third slide"
          />
          <Carousel.Caption className="custom-caption">
            <h3 className="animated-title">Comunidad y logros</h3>
            <p className="animated-text">Conecta, compite y demuestra quién manda en el juego.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  )
}

export default GameCarousel
