import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img src="/pixtrate-logo-v1.png" alt="Pixtrate" className="h-8 brightness-0 invert" />
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Mobilya, aksesuar ve takı satıcıları için en gelişmiş AI tabanlı görsel ve video üretim platformu. 
              Ürünlerinizi profesyonel kalitede görsellere dönüştürün.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:info@pixtrate.com" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="tel:+902121234567" className="text-gray-400 hover:text-white transition-colors">
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Fiyatlandırma
                </Link>
              </li>
              <li>
                <a 
                  href="/#contact" 
                  onClick={(e) => {
                    e.preventDefault();
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  İletişim
                </a>
              </li>
              <li>
                <Link to="/auth" className="text-gray-400 hover:text-white transition-colors">
                  Giriş Yap
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Destek
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Yasal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Gizlilik Politikası
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Kullanım Koşulları
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  KVKK Metni
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Çerez Politikası
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Pixtrate. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center space-x-2 mt-4 md:mt-0 text-gray-400 text-sm">
            <MapPin className="h-4 w-4" />
            <span>İstanbul, Türkiye</span>
          </div>
        </div>
      </div>
    </footer>
  );
};