import GameCarousel from '../components/Carousel/GameCarousel';
import GlobalGamesSection from '../components/Home/GlobalGamesSection';
import CategoriesSection from '../components/CategoriesSection/CategoriesSection';
import Footer from '../components/Footer/Footer';

function Home() {
  return (
    <div >
      <GameCarousel />
      <GlobalGamesSection />
      <CategoriesSection /> 
      <Footer />
     
    </div>
  );
}

export default Home;



