import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Github, 
  Twitter, 
  Linkedin,
  ExternalLink,
  Heart,
  Shield,
  FileText,
  HelpCircle
} from 'lucide-react';

export const Footer: React.FC = () => {
  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'How it Works', href: '/how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'API', href: '/api' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Press', href: '/press' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Status', href: '/status' },
      { label: 'Community', href: '/community' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com/civictrack', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com/civictrack', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/civictrack', label: 'LinkedIn' },
  ];

  const contactInfo = [
    { icon: Mail, text: 'hello@civictrack.com', href: 'mailto:hello@civictrack.com' },
    { icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
  ];

  const features = [
    { icon: Shield, text: 'Secure & Private' },
    { icon: MapPin, text: 'Location-based' },
    { icon: FileText, text: 'Transparent Reporting' },
    { icon: HelpCircle, text: '24/7 Support' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container-responsive py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Logo */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    CivicTrack
                  </h3>
                  <p className="text-gray-400 text-sm">Empowering Communities</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                CivicTrack empowers citizens to report, track, and resolve civic issues in their communities. 
                Together, we're building more responsive and accountable local governments.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <feature.icon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {contactInfo.map((contact, index) => (
                  <motion.a
                    key={contact.text}
                    href={contact.href}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors group"
                  >
                    <contact.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>{contact.text}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <h4 className="text-lg font-semibold mb-6 text-white capitalize">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-700">
        <div className="container-responsive py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-8">
              Get the latest updates on civic improvements and new features delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container-responsive py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center text-gray-400"
            >
              <span>© {new Date().getFullYear()} CivicTrack. Made with</span>
              <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" />
              <span>for better communities.</span>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex space-x-4"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 pt-8 border-t border-gray-700 text-center"
          >
            <p className="text-gray-400 text-sm">
              CivicTrack is committed to transparency, privacy, and empowering communities worldwide.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-gray-500">
              <span>🌍 Available in 50+ cities</span>
              <span>🔒 SOC 2 Type II Certified</span>
              <span>📱 Mobile-first design</span>
              <span>♿ Accessibility compliant</span>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};
