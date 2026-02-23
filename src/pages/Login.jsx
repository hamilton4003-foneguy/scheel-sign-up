import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-xl rounded-2xl text-center">
        <h1 className="text-2xl font-bold mb-6">Park Event Sign-Up</h1>
        <p className="text-gray-600 mb-8">Sign in to manage your family and register for events.</p>
        
        <button 
          onClick={loginWithGoogle}
          className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}