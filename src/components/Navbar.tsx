
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogIn, Home, UserCog, Menu, X, Lock, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { toast } from 'sonner';
import CENTER_CONSTANTS, { getFullName, checkAdminPassword, getMessages } from '../../constants';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // مراقبة التمرير لجعل الـ navbar أكثر أناقة
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowAdminPassword(true);
  };

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAdminPassword(adminPassword)) {
      setShowAdminPassword(false);
      setAdminPassword('');
      navigate('/admin');
      toast.success(getMessages().adminLoginSuccess);
    } else {
      toast.error(getMessages().adminLoginError);
      setAdminPassword('');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Topbar - غير ثابت */}
      <div className="bg-primary from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row sm:flex-row justify-between items-center py-2 sm:py-3">
            {/* Contact Info */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-300" />
                <a href="tel:+201024911062" className="hover:text-blue-300 transition-colors">
                  +20 102 491 1062
                </a>
              </div>
            </div>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <a 
                href="https://facebook.com/academivault" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com/academivault" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-primary from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com/academivault" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com/academivault" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar - Sticky مع تأثيرات أنيقة */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-white/90 backdrop-blur-sm shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-auto sm:h-auto">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 text-xl sm:text-2xl lg:text-3xl font-bold bg-primary from-blue-600 to-green-600 bg-clip-text text-transparent hover:scale-105 transition-transform flex-shrink-0"
            >
              <div className={`w-auto h-auto sm:w-auto sm:h-auto  rounded-xl flex items-center justify-center transition-all duration-300 ${
                isScrolled ? 'scale-95' : 'scale-100'
              }`}>
                <img src="/loogo.png" alt="logo" className="w-10 p-2" />
              </div>
              <span>{getFullName()}</span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2 space-x-reverse">
              <Link
                to="/"
                className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                  isActive('/') 
                    ? 'bg-primary from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'hover:bg-primary hover:from-blue-50 hover:to-indigo-50 text-gray-700 hover:text-blue-600'
                }`}
              >
                <Home size={20} />
                <span>الرئيسية</span>
              </Link>
              
              <Link
                to="/login"
                className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                  isActive('/login') 
                    ? 'bg-primary from-green-600 to-green-700 text-white shadow-lg' 
                    : 'hover:bg-primary hover:from-green-50 hover:to-emerald-50 text-gray-700 hover:text-green-600'
                }`}
              >
                <LogIn size={20} />
                <span>تسجيل الدخول</span>
              </Link>
              
              <button
                onClick={handleAdminClick}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                  isActive('/admin') 
                    ? 'bg-primary from-purple-600 to-purple-700 text-white shadow-lg' 
                    : 'hover:bg-primary hover:from-purple-50 hover:to-violet-50 text-gray-700 hover:text-purple-600'
                }`}
              >
                <UserCog size={20} />
                <span>الإدارة</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive('/') 
                    ? 'bg-primary from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'hover:bg-primary hover:from-blue-50 hover:to-indigo-50 text-gray-700'
                }`}
              >
                <Home size={20} />
                <span>الرئيسية</span>
              </Link>
              
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive('/login') 
                    ? 'bg-primary from-green-600 to-green-700 text-white shadow-lg' 
                    : 'hover:bg-primary hover:from-green-50 hover:to-emerald-50 text-gray-700'
                }`}
              >
                <LogIn size={20} />
                <span>تسجيل الدخول</span>
              </Link>
              
              <button
                onClick={() => {
                  closeMobileMenu();
                  handleAdminClick({ preventDefault: () => {} } as any);
                }}
                className={`w-full flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive('/admin') 
                    ? 'bg-primary from-purple-600 to-purple-700 text-white shadow-lg' 
                    : 'hover:bg-primary hover:from-purple-50 hover:to-violet-50 text-gray-700'
                }`}
              >
                <UserCog size={20} />
                <span>الإدارة</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Admin Password Modal */}
      {showAdminPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">دخول الإدارة</h3>
              <p className="text-gray-600">أدخل كلمة المرور للوصول إلى لوحة الإدارة</p>
            </div>
            
            <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="أدخل كلمة المرور"
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPassword(false);
                    setAdminPassword('');
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  دخول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
