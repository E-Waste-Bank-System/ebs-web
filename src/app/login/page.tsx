'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Recycle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'user') => {
    const demoCredentials = {
      admin: { email: 'admin@ebs.com', password: 'admin123' },
      user: { email: 'user@ebs.com', password: 'user123' }
    };

    const { email: demoEmail, password: demoPassword } = demoCredentials[role];
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    setIsLoading(true);
    setError('');

    try {
      await login(demoEmail, demoPassword);
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#69C0DC] to-[#4AA8C2] flex-col justify-between p-4 sm:p-6 lg:p-8 m-2 rounded-xl text-white relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center space-x-3 z-10">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Recycle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold">E-Hub.</h1>
            <p className="text-xs sm:text-sm opacity-80">E-waste Bank System</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6 z-10">
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Mulai Kelola <span className="italic">e-waste</span><br />
              dengan efisien.
            </h2>
            <p className="text-sm sm:text-base lg:text-lg opacity-90 max-w-md">
              Akses dashboard admin untuk memantau data pengguna dan mengoptimalkan pengelolaan sampah elektronik secara cerdas.
            </p>
          </div>
        </div>

        {/* Decorative Elements - Hidden on mobile for cleaner look */}
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-20 hidden lg:block">
          <div className="w-full h-full bg-white/10 rounded-tr-3xl"></div>
        </div>
        <div className="absolute bottom-8 left-8 w-16 h-16 opacity-30 hidden lg:block">
          <div className="w-4 h-4 bg-white rounded-full mb-2"></div>
          <div className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-white"></div>
        </div>
        <div className="absolute bottom-16 right-16 w-24 h-24 opacity-20 hidden lg:block">
          <div className="w-full h-full bg-white/10 transform rotate-45 rounded-lg"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Selamat datang!</h3>
            <p className="text-sm sm:text-base text-gray-600">Masuk untuk kelola e-waste dengan efisien!</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-[#69C0DC] focus:ring-[#69C0DC] text-base"
                />
              </div>
              
              <div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-[#69C0DC] focus:ring-[#69C0DC] text-base"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#69C0DC] hover:bg-[#5BADD1] text-white rounded-xl font-medium text-base sm:text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 