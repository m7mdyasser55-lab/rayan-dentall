import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: any;
}

export default function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryItem[];
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % items.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + items.length) % items.length);
    }
  };

  if (loading && items.length === 0) return null;

  return (
    <section id="gallery" className="py-24 px-6 bg-white dark:bg-gray-900 transition-colors">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif italic mb-4 dark:text-white">Clinic Gallery</h2>
          <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Take a look at our modern facilities and the results of our specialized dental treatments.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>Our gallery is currently being curated. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedImage(i)}
                className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all"
              >
                <img
                  src={item.imageUrl}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-white font-medium">{item.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white hover:text-emerald-400 transition-colors z-10"
            >
              <X size={32} />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2"
            >
              <ChevronLeft size={48} />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2"
            >
              <ChevronRight size={48} />
            </button>

            <motion.div
              key={selectedImage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
            >
              <img
                src={items[selectedImage].imageUrl}
                alt={items[selectedImage].caption}
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <p className="text-white mt-6 text-xl font-medium font-serif italic text-center">
                {items[selectedImage].caption}
              </p>
              <div className="mt-2 text-white/40 text-sm">
                {selectedImage + 1} / {items.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
