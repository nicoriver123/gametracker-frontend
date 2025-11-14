import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

function GoogleAuthButton({ disabled }) {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en Google login:', error);
    }
  };

  const handleGoogleError = () => {
    console.error('Error en autenticación de Google');
  };

  return (
    <div className="google-auth-container">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        disabled={disabled}
        theme="filled_blue"
        size="large"
        text="continue_with"
        width="100%"
      />
    </div>
  );
}

export default GoogleAuthButton;