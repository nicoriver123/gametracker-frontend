import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CategoryGames from "./pages/CategoryGames";
import GlobalGamesList from "./pages/GlobalGamesList";
import Contact from "./pages/Contact";
import GameReviews from "./pages/GameReviews";
import AllReviews from "./pages/AllReviews";

// 🔥 Páginas de Mi Biblioteca
import MyLibrary from "./pages/MyLibrary";
import GameForm from "./pages/GameForm";
import GameDetail from "./pages/GameDetail";

// 🔥 Páginas del Foro
import Forum from "./pages/Forum";
import ForumPostView from "./pages/ForumPostView";
import ForumPostForm from "./pages/ForumPostForm";

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          
          {/* Toaster para notificaciones */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/games/category/:genre" element={<CategoryGames />} />
            <Route path="/games" element={<GlobalGamesList />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/games/:gameId/reviews" element={<GameReviews />} />
            <Route path="/reviews" element={<AllReviews />} />
            
             {/* 🔥 Rutas de Mi Biblioteca */}
            <Route 
              path="/my-library" 
              element={
                <ProtectedRoute>
                  <MyLibrary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-library/create-game" 
              element={
                <ProtectedRoute>
                  <GameForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-library/edit-game/:id" 
              element={
                <ProtectedRoute>
                  <GameForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-library/game/:id" 
              element={
                <ProtectedRoute>
                  <GameDetail />
                </ProtectedRoute>
              } 
            />

            {/* 🔥 Rutas del Foro */}
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/post/:id" element={<ForumPostView />} />
            <Route 
              path="/forum/new" 
              element={
                <ProtectedRoute>
                  <ForumPostForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/forum/edit/:id" 
              element={
                <ProtectedRoute>
                  <ForumPostForm />
                </ProtectedRoute>
              } 
            />

            {/* Rutas Protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
         
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
