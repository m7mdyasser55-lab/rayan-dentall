import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: any;
}

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newImage, setNewImage] = useState({ imageUrl: '', caption: '' });

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryItem[];
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gallery');
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.imageUrl || !newImage.caption) return;

    setAdding(true);
    try {
      await addDoc(collection(db, 'gallery'), {
        ...newImage,
        createdAt: serverTimestamp()
      });
      setNewImage({ imageUrl: '', caption: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gallery');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
    }
  };

  if (loading) return <div className="text-center p-10 dark:text-gray-400">Loading gallery items...</div>;

  return (
    <div className="space-y-8">
      {/* Add New Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
          <Plus size={20} className="text-emerald-600" />
          Add To Gallery
        </h3>
        <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Image URL</label>
            <input 
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white text-sm"
              value={newImage.imageUrl}
              onChange={e => setNewImage({...newImage, imageUrl: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Caption</label>
            <div className="flex gap-2">
              <input 
                type="text"
                required
                placeholder="Clinic Lobby, Modern Equipment..."
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white text-sm"
                value={newImage.caption}
                onChange={e => setNewImage({...newImage, caption: e.target.value})}
              />
              <button 
                type="submit"
                disabled={adding}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {adding ? <Loader2 className="animate-spin" size={16} /> : 'Add'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={item.id}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors"
            >
              <img 
                src={item.imageUrl} 
                alt={item.caption} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-white text-xs font-medium truncate">{item.caption}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {items.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
            <ImageIcon size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm italic">Gallery is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
