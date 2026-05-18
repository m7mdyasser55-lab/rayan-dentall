import { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle, XCircle, Clock, Trash2, Calendar, Phone, User, Filter, Image as ImageIcon, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GalleryAdmin from './GalleryAdmin';

interface AppointmentType {
  id: string;
  patientName: string;
  patientPhone: string;
  categoryName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: any;
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'gallery'>('appointments');

  useEffect(() => {
    if (activeTab !== 'appointments') return;
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppointmentType[];
      setAppointments(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  const stats = {
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    total: appointments.length
  };

  if (loading) return <div className="p-10 text-center dark:text-gray-400">Loading appointments...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-bold font-serif italic dark:text-white">Admin Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage clinic operations and content.</p>
        </div>
        
        <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'appointments' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Users size={18} />
            Appointments
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'gallery' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <ImageIcon size={18} />
            Gallery
          </button>
        </div>
      </div>

      {activeTab === 'appointments' ? (
        <>
          <div className="flex gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 transition-colors">
                  <Clock className="text-yellow-500" size={16} />
                  <span className="font-bold text-sm dark:text-white">{stats.pending} Pending</span>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 transition-colors">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="font-bold text-sm dark:text-white">{stats.confirmed} Confirmed</span>
              </div>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                        filter === f 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-emerald-200'
                    }`}
                  >
                      {f}
                  </button>
              ))}
          </div>

          <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {filteredAppointments.length === 0 ? (
                    <div className="p-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
                        No appointments found for this filter.
                    </div>
                ) : (
                    filteredAppointments.map((app) => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={app.id}
                            className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors"
                        >
                            <div className="flex gap-4 items-center w-full md:w-auto">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                    app.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' :
                                    app.status === 'confirmed' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                                    app.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-lg dark:text-white">{app.patientName}</div>
                                    <div className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500">
                                        <span className="flex items-center gap-1"><Phone size={14} /> {app.patientPhone}</span>
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                            <Filter size={14} /> {app.categoryName}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-8 items-center w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-8">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-tighter">Schedule</span>
                                    <div className="flex items-center gap-2 font-medium text-sm dark:text-gray-200">
                                        <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                                        {app.date} @ {app.time}
                                    </div>
                                 </div>

                                 <div className="flex gap-2 ml-auto md:ml-0">
                                     {app.status === 'pending' && (
                                         <>
                                            <button 
                                              onClick={() => updateStatus(app.id, 'confirmed')}
                                              className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                                              title="Confirm"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                            <button 
                                              onClick={() => updateStatus(app.id, 'cancelled')}
                                              className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                              title="Cancel"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                         </>
                                     )}
                                     {app.status === 'confirmed' && (
                                         <button 
                                            onClick={() => updateStatus(app.id, 'completed')}
                                            className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                            title="Mark Completed"
                                          >
                                              <CheckCircle size={20} />
                                          </button>
                                     )}
                                 </div>
                            </div>
                        </motion.div>
                    ))
                )}
              </AnimatePresence>
          </div>
        </>
      ) : (
        <GalleryAdmin />
      )}
    </div>
  );
}
