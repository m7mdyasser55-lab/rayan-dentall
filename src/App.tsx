import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Sparkles, 
  Smile, 
  Activity, 
  MapPin, 
  PhoneCall, 
  Clock, 
  CheckCircle2,
  Phone,
  MessageCircle,
  Menu,
  ChevronRight,
  Facebook,
  Instagram,
  Lock,
  ArrowLeft,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import ChatAssistant from './components/ChatAssistant';
import BookingForm from './components/BookingForm';
import AdminDashboard from './components/AdminDashboard';
import GallerySection from './components/GallerySection';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const services = [
  { 
    title: "Cosmetic Dentistry", 
    titleAr: "تجميل الأسنان",
    desc: "Whitening, veneers, and smile makeovers.", 
    icon: <Sparkles className="text-emerald-600" size={32} /> 
  },
  { 
    title: "Dental Implants", 
    titleAr: "زراعة الأسنان",
    desc: "Permanent, natural-looking solutions for missing teeth.", 
    icon: <Activity className="text-emerald-600" size={32} /> 
  },
  { 
    title: "Orthodontics", 
    titleAr: "تقويم الأسنان",
    desc: "Braces and aligners for a perfectly aligned smile.", 
    icon: <CheckCircle2 className="text-emerald-600" size={32} /> 
  },
  { 
    title: "Oral Surgery", 
    titleAr: "جراحة الفم",
    desc: "Painless extractions and surgical care.", 
    icon: <Smile className="text-emerald-600" size={32} /> 
  },
  { 
    title: "Preventive Care", 
    titleAr: "العناية الوقائية",
    desc: "Regular cleanings and consultations for long-term health.", 
    icon: <Stethoscope className="text-emerald-600" size={32} /> 
  }
];

export default function App() {
  const [view, setView] = useState<'patient' | 'admin'>('patient');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const adminDoc = await getDoc(doc(db, 'admins', u.uid));
        if (adminDoc.exists() || u.email === 'm7mdyasser55@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loginAdmin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex justify-between items-center transition-colors">
            <button 
              onClick={() => setView('patient')}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-sm tracking-widest uppercase transition-all"
            >
                <ArrowLeft size={16} /> Back to Site
            </button>
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                {user && (
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold dark:text-white">{user.displayName}</div>
                            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Authorized Admin</div>
                        </div>
                        {user.photoURL && <img src={user.photoURL} alt="Admin" className="w-10 h-10 rounded-full border-2 border-emerald-100 dark:border-emerald-900/50" />}
                    </div>
                )}
                <button 
                  onClick={() => signOut(auth)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <Lock size={20} />
                </button>
            </div>
        </nav>
        
        {isAdmin ? (
          <AdminDashboard />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
             <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                <Lock size={40} />
             </div>
             <h2 className="text-2xl font-bold mb-2 dark:text-white">Access Restricted</h2>
             <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">This dashboard is only for Rayan Dental Care authorized personnel.</p>
             {!user ? (
               <button 
                onClick={loginAdmin}
                className="px-8 py-3 bg-gray-900 dark:bg-emerald-600 text-white rounded-full font-bold shadow-xl"
               >
                 Admin Login
               </button>
             ) : (
               <div className="flex flex-col gap-4">
                 <p className="text-sm text-red-400">Account: {user.email} is not an admin.</p>
                 <button 
                  onClick={() => signOut(auth)}
                  className="text-emerald-600 font-bold underline"
                 >
                   Sign out
                 </button>
               </div>
             )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-x-hidden selection:bg-emerald-100 dark:selection:bg-emerald-900/30 transition-colors duration-300">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold italic text-xl shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20">R</div>
            <span className="font-bold text-xl tracking-tight text-gray-800 dark:text-gray-100 hidden sm:block">Rayan <span className="text-emerald-600">Dental</span></span>
        </div>
        <div className="hidden md:flex gap-8 items-center font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <button onClick={() => scrollTo('services')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Services</button>
            <button onClick={() => scrollTo('gallery')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Gallery</button>
            <button onClick={() => scrollTo('about')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Location</button>
            <button onClick={() => scrollTo('booking')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Booking</button>
            {isAdmin && (
              <button 
                onClick={() => setView('admin')}
                className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </button>
            )}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => scrollTo('booking')} className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition-all shadow-md">Book Now</button>
        </div>
        <button className="md:hidden text-emerald-600 dark:text-emerald-400"><Menu /></button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 px-6">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/50 dark:bg-emerald-900/10 -skew-x-12 transform origin-right hidden lg:block"></div>
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-200/50">
                    <Sparkles size={14} />
                    <span>Alexandria's Leading Clinic</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-light leading-[1.1] mb-6 text-gray-900 dark:text-white italic font-serif">
                    We are the <span className="font-black not-italic text-emerald-600 dark:text-emerald-400">Makers</span> of the Smile
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
                   عيادة د/ محمد ريان تقدم لكم أرقى الخدمات لطب الفم والأسنان. خبرة، جودة، واهتمام فائق بصحتك.
                   Experience premium dental care in the heart of Alexandria with Dr. Mohamed Rayan.
                </p>
                <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => scrollTo('booking')}
                      className="px-8 py-4 bg-gray-900 dark:bg-emerald-600 text-white rounded-full font-bold hover:bg-gray-800 dark:hover:bg-emerald-700 transition-all flex items-center gap-2 group shadow-xl"
                    >
                        Book Appointment <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a href="tel:01550809980" className="px-8 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-full font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        01550809980
                    </a>
                </div>
            </motion.div>
            
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative group h-full"
              >
                  <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative border-8 border-white/50 dark:border-gray-800/50 backdrop-blur-sm">
                      <img 
                        src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070&auto=format&fit=crop" 
                        alt="Modern Dental Clinic" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent group-hover:from-emerald-900/20 transition-all duration-500"></div>
                  </div>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 max-w-[240px] transition-colors"
                >
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-tighter">Availability</div>
                        <div className="font-bold text-sm dark:text-white">Sat - Thu: 4PM - 10PM</div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 bg-white dark:bg-gray-900 transition-colors">
        <div className="container mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif italic mb-4 dark:text-white">Our Services</h2>
                <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full"></div>
                <p className="mt-6 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Comprehensive dental care using the latest technology and techniques.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -10 }}
                      className="p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/50 hover:shadow-xl dark:shadow-emerald-900/5 transition-all bg-white dark:bg-gray-800/50 sticky group"
                    >
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                            {service.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2 flex items-center justify-between pointer-events-none dark:text-white">
                            {service.title}
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">{service.titleAr}</span>
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{service.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Gallery Section */}
      <GallerySection />

      {/* Booking Section */}
      <section id="booking" className="py-24 px-6 bg-emerald-50/30 dark:bg-gray-900/50 transition-colors">
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
                <h2 className="text-4xl md:text-6xl font-serif italic mb-8 dark:text-white">Ready for a <span className="text-emerald-600 dark:text-emerald-400 not-italic font-black">Brighter</span> Smile?</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-12">
                   Fill out the form to request an appointment. Our team in Smouha will review your request and contact you to confirm the exact time slot.
                </p>
                <div className="space-y-4">
                    {[
                        "Free initial consultation for implants",
                        "Latest laser whitening technology",
                        "Emergency oral surgery support",
                        "Flexible payment plans available"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">
                            <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={18} />
                            {item}
                        </div>
                    ))}
                </div>
            </div>
            <BookingForm />
        </div>
      </section>

      {/* About / Location CTA */}
      <section id="about" className="py-24 px-6 bg-emerald-900 dark:bg-[#064e3b] text-white overflow-hidden relative transition-colors">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:40px_40px]"></div>
          </div>
          <div className="container mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                  <h2 className="text-4xl md:text-6xl font-serif italic mb-8">Located in the heart of Alexandria</h2>
                  <p className="text-lg text-emerald-100/70 dark:text-emerald-200/70 mb-12 leading-relaxed">
                      Find us in Smouha, Alexandria. Dedicated to providing a comfortable and safe environment for all our patients.
                  </p>
                  
                  <div className="space-y-6">
                      <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-emerald-800 dark:bg-emerald-900 rounded-full flex items-center justify-center mt-1"><MapPin size={20} /></div>
                          <div>
                              <div className="font-bold">Address</div>
                              <div className="text-emerald-100/70 dark:text-emerald-200/70">Smouha, Behind Al Nasr Club, Judges Buildings</div>
                              <div className="text-sm text-emerald-400 dark:text-emerald-300 mt-1">عيادة المستشارين - خلف نادي النصر</div>
                          </div>
                      </div>
                      <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-emerald-800 dark:bg-emerald-900 rounded-full flex items-center justify-center mt-1"><Phone size={20} /></div>
                          <div>
                              <div className="font-bold">Phone</div>
                              <div className="text-emerald-100/70 dark:text-emerald-200/70">01550809980</div>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="relative group">
                  <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800 ring-8 ring-white/10 transition-colors">
                      <img 
                        src="/src/assets/images/regenerated_image_1779128535062.png" 
                        alt="High Tech Clinic" 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 scale-105 group-hover:scale-100 transition-all duration-1000 ease-in-out"
                        referrerPolicy="no-referrer"
                      />
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-20 px-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
          <div className="container mx-auto grid md:grid-cols-4 gap-12">
              <div className="col-span-2 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold italic text-2xl shadow-lg shadow-emerald-500/20">R</div>
                    <span className="font-bold text-2xl tracking-tight text-gray-800 dark:text-gray-100">Rayan <span className="text-emerald-600">Dental</span></span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto md:mx-0 leading-relaxed">
                    Dedicated to providing sustainable oral health and beautiful smiles for the community of Alexandria.
                  </p>
              </div>
              
              <div className="text-center md:text-left">
                  <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-emerald-600 dark:text-emerald-400">Explore</h4>
                  <ul className="space-y-4 text-gray-500 dark:text-gray-400 font-medium text-sm">
                      <li><button onClick={() => scrollTo('services')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Services</button></li>
                      <li><button onClick={() => scrollTo('gallery')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Gallery</button></li>
                      <li><button onClick={() => scrollTo('about')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Location</button></li>
                      <li><button onClick={() => scrollTo('booking')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Booking</button></li>
                  </ul>
              </div>
              
              <div className="text-center md:text-left">
                  <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-emerald-600 dark:text-emerald-400">Contact</h4>
                  <ul className="space-y-4 text-gray-500 dark:text-gray-400 font-medium text-sm">
                      <li className="flex items-center justify-center md:justify-start gap-4">
                          <a href="https://www.facebook.com/share/1CjdFykLV3/" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                              <Facebook size={18} />
                          </a>
                          <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                              <Instagram size={18} />
                          </a>
                          <a href="https://wa.me/201550809980" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                              <MessageCircle size={18} />
                          </a>
                      </li>
                      <li className="flex items-center justify-center md:justify-start gap-2 text-emerald-600 dark:text-emerald-400 font-bold underline">
                          <PhoneCall size={16} /> 01550809980
                      </li>
                  </ul>
              </div>
          </div>
          <div className="container mx-auto mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left transition-colors">
              <p className="text-xs text-gray-400 dark:text-gray-500">© 2024 Rayan Dental Care. All rights reserved.</p>
              <div className="flex gap-6 text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                  <button onClick={() => setView('admin')} className="text-xs p-2 border border-gray-100 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 uppercase font-black transition-colors">Staff Portal</button>
              </div>
          </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <motion.a
        id="whatsapp-fab"
        href="https://wa.me/201550809980"
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-6 w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center z-50 cursor-pointer border-4 border-white"
      >
        <MessageCircle size={32} fill="currentColor" className="text-white" />
      </motion.a>

      {/* AI Assistant */}
      <ChatAssistant />
      
    </div>
  );
}
