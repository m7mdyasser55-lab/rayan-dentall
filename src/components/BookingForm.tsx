import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Calendar, Phone, User, CheckCircle, Loader2 } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const categories = [
  { id: 'cosmetic', name: 'Cosmetic Dentistry', nameAr: 'تجميل الأسنان' },
  { id: 'implants', name: 'Dental Implants', nameAr: 'زراعة الأسنان' },
  { id: 'ortho', name: 'Orthodontics', nameAr: 'تقويم الأسنان' },
  { id: 'surgery', name: 'Oral Surgery', nameAr: 'جراحة الفم' },
  { id: 'preventive', name: 'Preventive Care', nameAr: 'العناية الوقائية' },
];

export default function BookingForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    categoryId: 'cosmetic',
    date: '',
    time: '4:00 PM'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const path = 'appointments';
      await addDoc(collection(db, path), {
        ...formData,
        userId: auth.currentUser?.uid || null,
        categoryName: categories.find(c => c.id === formData.categoryId)?.name,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl text-center border border-green-100 dark:border-green-900/30 transition-colors"
      >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Received!</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">We will call you shortly to confirm your appointment at Smouha branch.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="px-6 py-2 bg-gray-900 dark:bg-emerald-600 text-white rounded-full text-sm font-bold"
        >
          Book Another
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 space-y-6 transition-colors">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-widest flex items-center gap-2">
                <User size={14} /> Full Name
            </label>
            <input 
              required
              type="text" 
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white dark:placeholder:text-gray-600"
              value={formData.patientName}
              onChange={e => setFormData({...formData, patientName: e.target.value})}
            />
        </div>
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-widest flex items-center gap-2">
                <Phone size={14} /> Phone Number
            </label>
            <input 
              required
              type="tel" 
              placeholder="01xxxxxxxxx"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white dark:placeholder:text-gray-600"
              value={formData.patientPhone}
              onChange={e => setFormData({...formData, patientPhone: e.target.value})}
            />
        </div>
      </div>

      <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-widest">Service Category</label>
          <select 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none dark:text-white"
            value={formData.categoryId}
            onChange={e => setFormData({...formData, categoryId: e.target.value})}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id} className="dark:bg-gray-900">{c.name} - {c.nameAr}</option>
            ))}
          </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Date
            </label>
            <input 
              required
              type="date" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
        </div>
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-widest">Preferred Time</label>
            <select 
               className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none dark:text-white"
               value={formData.time}
               onChange={e => setFormData({...formData, time: e.target.value})}
            >
                <option className="dark:bg-gray-900">4:00 PM</option>
                <option className="dark:bg-gray-900">5:00 PM</option>
                <option className="dark:bg-gray-900">6:00 PM</option>
                <option className="dark:bg-gray-900">7:00 PM</option>
                <option className="dark:bg-gray-900">8:00 PM</option>
                <option className="dark:bg-gray-900">9:00 PM</option>
            </select>
        </div>
      </div>

      <button 
        disabled={loading}
        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Request Appointment"}
      </button>
    </form>
  );
}
