import React from 'react';
import {
  FaApple,
  FaGooglePlay,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram
} from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Using Link for internal navigation is better for SPAs

const Footer: React.FC = () => {
  return (
    <footer className="bg-[oklch(0.25_0.05_255)] text-gray-300 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block text-3xl font-bold text-white hover:text-gray-200 transition mb-4">
              GuestReport
            </Link>
            <p className="text-sm text-gray-400">
              Anonymously share and discover school experiences.
            </p>
          </div>

          {/* Column 2: Company Links */}
          <div>
            <h5 className="font-semibold text-white mb-3">Company</h5>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white hover:underline">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white hover:underline">How It Works</Link></li>
              <li><Link to="/careers" className="hover:text-white hover:underline">Careers</Link></li>
              <li><Link to="/press" className="hover:text-white hover:underline">Press</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources Links */}
          <div>
            <h5 className="font-semibold text-white mb-3">Resources</h5>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="hover:text-white hover:underline">Help Center</Link></li>
              <li><Link to="/faq" className="hover:text-white hover:underline">FAQ</Link></li>
              <li><Link to="/guidelines" className="hover:text-white hover:underline">Guidelines</Link></li>
              <li><Link to="/contact" className="hover:text-white hover:underline">Contact Support</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal Links */}
          <div>
            <h5 className="font-semibold text-white mb-3">Legal</h5>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-white hover:underline">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white hover:underline">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-white hover:underline">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-700 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          {/* App Download Links */}
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Download the App:</span>
            <a href="#" aria-label="Download on the App Store" className="text-xl hover:text-white transition"><FaApple /></a>
            <a href="#" aria-label="Get it on Google Play" className="text-xl hover:text-white transition"><FaGooglePlay /></a>
          </div>

          {/* Social Media Icons */}
          <div className="flex gap-4">
            <a href="#" aria-label="Facebook" className="text-lg w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/70 transition"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter" className="text-lg w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/70 transition"><FaTwitter /></a>
            <a href="#" aria-label="LinkedIn" className="text-lg w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/70 transition"><FaLinkedinIn /></a>
            <a href="#" aria-label="Instagram" className="text-lg w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/70 transition"><FaInstagram /></a>
          </div>

          {/* Copyright Notice */}
          <div className="text-gray-400 text-center md:text-right">
            © {new Date().getFullYear()} GuestReport. All rights reserved. <br className="sm:hidden" />
            <span className="hidden sm:inline">| </span>
            Made by Nucleosys Tech
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;