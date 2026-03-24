import React, { useState, useMemo, useEffect, useRef, createContext, useContext, Fragment } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag, Plus, Check, ArrowRight, Menu, X, Instagram, Twitter, Mail, Play } from 'lucide-react';

// --- EDIT MODE CONTEXT & COMPONENTS ---
const EditContext = createContext({
  isEditMode: false,
  cmsData: {} as Record<string, any>,
  saveCmsData: async (id: string, content: string, type: string) => {}
});

const ET = ({ as: Tag = 'span', id, initial, className, ...props }: any) => {
  const { isEditMode, cmsData, saveCmsData } = useContext(EditContext);
  const elementId = id || initial;
  const savedText = cmsData[elementId]?.content || initial;
  const [text, setText] = useState(savedText);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setText(cmsData[elementId]?.content || initial);
  }, [cmsData, elementId, initial]);

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== savedText) {
      saveCmsData(elementId, text, 'text');
    }
  };

  if (isEditing) {
    return (
      <textarea 
        autoFocus 
        onBlur={handleBlur} 
        value={text} 
        onChange={e => setText(e.target.value)} 
        className={`p-2 rounded w-full min-h-[3em] z-50 relative border border-white/30 ${className}`} 
        style={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.9)' }}
      />
    );
  }
  return (
    <Tag 
      {...props}
      onClick={(e: any) => { 
        if(isEditMode) { 
          e.preventDefault(); 
          e.stopPropagation(); 
          setIsEditing(true); 
        } else if (props.onClick) {
          props.onClick(e);
        }
      }} 
      className={`${className} ${isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-red-500 hover:ring-dashed relative z-40' : ''}`}
    >
      {String(text).split('\n').map((line: string, i: number) => (
        <Fragment key={i}>{line}{i < String(text).split('\n').length - 1 && <br/>}</Fragment>
      ))}
    </Tag>
  );
};

const EM = ({ id, initial, className, alt, ...props }: any) => {
  const { isEditMode, cmsData, saveCmsData } = useContext(EditContext);
  const elementId = id || initial;
  const savedSrc = cmsData[elementId]?.content || initial;
  const [src, setSrc] = useState(savedSrc);
  const [isVideo, setIsVideo] = useState(savedSrc.match(/\.(mp4|webm|ogg)$/i) || savedSrc.startsWith('data:video/'));
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const newSrc = cmsData[elementId]?.content || initial;
    setSrc(newSrc);
    setIsVideo(newSrc.match(/\.(mp4|webm|ogg)$/i) || newSrc.startsWith('data:video/'));
  }, [cmsData, elementId, initial]);

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setSrc(base64data);
      setIsVideo(file.type.startsWith('video/'));
      saveCmsData(elementId, base64data, 'media');
    };
    reader.readAsDataURL(file);
  };

  const handleVideoClick = (e: any) => {
    if(isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      fileRef.current?.click();
    } else if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      }
    } else if (props.onClick) {
      props.onClick(e);
    }
  };

  const handleImageClick = (e: any) => {
    if(isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      fileRef.current?.click();
    } else if (props.onClick) {
      props.onClick(e);
    }
  };

  const editClass = isEditMode ? 'cursor-pointer hover:ring-4 hover:ring-red-500 relative z-40' : '';

  return (
    <>
      <input type="file" ref={fileRef} className="hidden" accept="image/*,video/*" onChange={handleFile} />
      {isVideo ? (
        <video ref={videoRef} src={src} autoPlay loop muted playsInline className={`${className} ${editClass} ${!isEditMode ? 'cursor-pointer' : ''}`} onClick={handleVideoClick} {...props} />
      ) : (
        <img src={src} alt={alt} className={`${className} ${editClass}`} onClick={handleImageClick} {...props} />
      )}
    </>
  );
};

// --- TYPES & DATA ---
interface ProductColor {
  name: string;
  images: string[];
}

interface Product { 
  id: number; 
  name: string; 
  price: number; 
  category: string; 
  material: string; 
  tag: string; 
  description: string; 
  colors: ProductColor[];
  sizes: string[];
  image?: string; // For backward compatibility
}

interface CartItem {
  cartItemId: string;
  product: Product;
  color: string;
  size: string;
  image: string;
}

type ViewState = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'about' | 'history' | 'runway' | 'journal';
type ShopMode = 'main' | 'men' | 'women';

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 1, name: 'Guardian Coat v1', price: 4850, category: 'Male', material: 'Quiet Moss Felted Wool', tag: 'Limited (3/50)', 
    description: 'Eine archaische Rüstung für den modernen Führer.',
    colors: [
      { name: 'Obsidian Black', images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1200'] },
      { name: 'Ash Grey', images: ['https://images.unsplash.com/photo-1550614000-4b95d415dc96?auto=format&fit=crop&q=80&w=1200'] }
    ],
    sizes: ['46', '48', '50', '52']
  },
  { 
    id: 2, name: 'Blossom Organza Gown', price: 3900, category: 'Female', material: 'Luminous Citrine Silk', tag: 'Signature', 
    description: 'Leichtigkeit, die atmet. Organische Lagenstruktur.',
    colors: [{ name: 'Citrine', images: ['https://images.unsplash.com/photo-1539008835270-34989069634e?auto=format&fit=crop&q=80&w=1200'] }],
    sizes: ['34', '36', '38', '40']
  },
  { 
    id: 3, name: 'Tactical Vest', price: 2400, category: 'Male', material: 'Silk & Kevlar', tag: 'New Arrival', 
    description: 'Die Fusion aus Schutz und Eleganz.',
    colors: [{ name: 'Kevlar Black', images: ['https://images.unsplash.com/photo-1617137968427-839f26953ed6?auto=format&fit=crop&q=80&w=1200'] }],
    sizes: ['M', 'L']
  },
  { 
    id: 4, name: 'Citrine Blossom Scarf', price: 850, category: 'Newest', material: 'Hand-Painted Silk', tag: 'Artisan', 
    description: 'Ein Akzent aus Licht. Handbemaltes Unikat.',
    colors: [{ name: 'Citrine', images: ['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=1200'] }],
    sizes: ['One Size']
  },
  { 
    id: 5, name: 'Guardian Knit Sweater', price: 1250, category: 'Newest', material: 'Cashmere & Moss Fiber', tag: 'Essential', 
    description: 'Ultimativer Komfort. Eine schützende Schicht.',
    colors: [{ name: 'Moss', images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=1200'] }],
    sizes: ['S', 'M', 'L']
  },
  { 
    id: 6, name: 'Obsidian Leather Boots', price: 1850, category: 'Male', material: 'Calfskin & Titanium', tag: 'Runway', 
    description: 'Geerdet und unzerstörbar. Handgefertigt in Italien.',
    colors: [{ name: 'Obsidian', images: ['https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=1200'] }],
    sizes: ['41', '42', '43', '44']
  }
];

const NEWS = [
  { id: 1, title: 'The Metzingen Lab Expansion', date: 'Okt 12, 2026', category: 'Inside the Maison', image: 'https://images.unsplash.com/photo-1558769132-cb1fac08b4af?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Moss & Kevlar: A Material Study', date: 'Sep 28, 2026', category: 'Innovation', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Paris Fashion Week Recap', date: 'Sep 15, 2026', category: 'Runway', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800' }
];

const RUNWAY_LOOKS = [
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200'
];

// --- ANIMATION VARIANTS ---
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } };

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [shopMode, setShopMode] = useState<ShopMode>('main');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cmsData, setCmsData] = useState<Record<string, any>>({});
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    title: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
  } | null>(null);

  useEffect(() => {
    fetch('/api/cms')
      .then(res => res.json())
      .then(data => {
        setCmsData(data);
        if (data['products-list']?.content) {
          try {
            const parsed = JSON.parse(data['products-list'].content);
            const migrated = parsed.map((p: any) => ({
              ...p,
              colors: p.colors || [{ name: 'Default', images: [p.image || ''] }],
              sizes: p.sizes || ['S', 'M', 'L']
            }));
            setProducts(migrated);
          } catch (e) {
            console.error("Failed to parse products-list from CMS", e);
          }
        }
      })
      .catch(err => console.error("Failed to load CMS data", err));
  }, []);

  const saveCmsData = async (id: string, content: string, type: string) => {
    try {
      await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content, type })
      });
      setCmsData(prev => ({ ...prev, [id]: { content, type } }));
    } catch (err) {
      console.error("Failed to save CMS data", err);
    }
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now(),
      name: 'Neues Produkt',
      price: 1000,
      category: shopMode === 'men' ? 'Male' : shopMode === 'women' ? 'Female' : 'Newest',
      material: 'Material',
      tag: 'Neu',
      description: 'Beschreibung',
      colors: [{ name: 'Standard', images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1200'] }],
      sizes: ['S', 'M', 'L']
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveCmsData('products-list', JSON.stringify(updated), 'json');
  };

  const handleRemoveProduct = (id: number) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveCmsData('products-list', JSON.stringify(updated), 'json');
  };

  const updateProduct = (id: number, updates: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
    setProducts(updated);
    saveCmsData('products-list', JSON.stringify(updated), 'json');
  };

  const openProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setSelectedColorIndex(0);
    setCurrentImageIndex(0);
    setSelectedSize(product.sizes?.[0] || '');
    setView('product');
  };

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 800], [1, 0]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  }, [view, shopMode]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getProductPrice = (p: Product) => {
    const priceStr = cmsData[`product-${p.id}-price`]?.content || p.price;
    const cleanStr = String(priceStr).replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
    return parseFloat(cleanStr) || p.price;
  };
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + getProductPrice(item.product), 0), [cart, cmsData]);

  const addToCart = (product: Product, color: string, size: string, image: string) => {
    const newItem: CartItem = {
      cartItemId: Math.random().toString(36).substr(2, 9),
      product,
      color,
      size,
      image
    };
    setCart([...cart, newItem]);
    setNotification(`${product.name} zur Kollektion hinzugefügt`);
    setTimeout(() => setNotification(null), 3000);
  };

  const removeFromCart = (index: number) => setCart(cart.filter((_, i) => i !== index));

  const getThemeColors = () => {
    switch(shopMode) {
      case 'men': return { bg: 'bg-[#EAECEF] dark:bg-[#11151A]', headerBg: 'bg-[#EAECEF]/90 dark:bg-[#11151A]/90', text: 'text-[#0A0F14] dark:text-[#EAECEF]', border: 'border-[#0A0F14]/10 dark:border-[#EAECEF]/10', selectionBg: 'selection:bg-[#0A0F14] dark:selection:bg-[#EAECEF]', selectionText: 'selection:text-[#EAECEF] dark:selection:text-[#11151A]' };
      case 'women': return { bg: 'bg-[#F5EBE9] dark:bg-[#1A1413]', headerBg: 'bg-[#F5EBE9]/90 dark:bg-[#1A1413]/90', text: 'text-[#1A0F0E] dark:text-[#F5EBE9]', border: 'border-[#1A0F0E]/10 dark:border-[#F5EBE9]/10', selectionBg: 'selection:bg-[#1A0F0E] dark:selection:bg-[#F5EBE9]', selectionText: 'selection:text-[#F5EBE9] dark:selection:text-[#1A1413]' };
      case 'main':
      default: return { bg: 'bg-[#F4F4F0] dark:bg-[#0A0A0A]', headerBg: 'bg-[#F4F4F0]/90 dark:bg-[#0A0A0A]/90', text: 'text-[#050505] dark:text-[#F4F4F0]', border: 'border-[#050505]/10 dark:border-[#F4F4F0]/10', selectionBg: 'selection:bg-[#050505] dark:selection:bg-[#F4F4F0]', selectionText: 'selection:text-[#F4F4F0] dark:selection:text-[#0A0A0A]' };
    }
  };
  const theme = getThemeColors();

  const NavLinks = () => (
    <>
      <button onClick={() => { setView('shop'); setShopMode('men'); }} className={`hover:opacity-50 transition-opacity ${(view === 'shop' && shopMode === 'men') ? 'opacity-100' : 'opacity-70'}`}>Herren</button>
      <button onClick={() => { setView('shop'); setShopMode('women'); }} className={`hover:opacity-50 transition-opacity ${(view === 'shop' && shopMode === 'women') ? 'opacity-100' : 'opacity-70'}`}>Damen</button>
      <button onClick={() => { setView('runway'); setShopMode('main'); }} className={`hover:opacity-50 transition-opacity ${view === 'runway' ? 'opacity-100' : 'opacity-70'}`}>Runway</button>
      <button onClick={() => { setView('about'); setShopMode('main'); }} className={`hover:opacity-50 transition-opacity ${view === 'about' ? 'opacity-100' : 'opacity-70'}`}>Maison</button>
      <button onClick={() => { setView('journal'); setShopMode('main'); }} className={`hover:opacity-50 transition-opacity ${view === 'journal' ? 'opacity-100' : 'opacity-70'}`}>Journal</button>
    </>
  );

  return (
    <EditContext.Provider value={{ isEditMode, cmsData, saveCmsData }}>
      <div className={`min-h-screen w-full ${theme.bg} ${theme.text} font-sans ${theme.selectionBg} ${theme.selectionText} transition-colors duration-700`}>
        
        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#050505] dark:bg-[#F4F4F0] text-[#F4F4F0] dark:text-[#050505] px-6 py-4 rounded-full z-[100] flex items-center gap-3 shadow-2xl"
            >
              <Check size={16} className="text-[#D9CDB3] dark:text-[#8C7A56]" />
              <span className="text-xs font-bold tracking-[0.1em] uppercase">{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Prompt Modal */}
        <AnimatePresence>
          {promptModal?.isOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center px-4"
              onClick={() => setPromptModal(null)}
            >
              <motion.div 
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 p-8 max-w-md w-full rounded-xl shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="font-serif text-2xl mb-6 text-black dark:text-white">{promptModal.title}</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const value = formData.get('promptValue') as string;
                  promptModal.onConfirm(value);
                  setPromptModal(null);
                }}>
                  <input 
                    type="text" 
                    name="promptValue"
                    defaultValue={promptModal.defaultValue}
                    autoFocus
                    className="w-full border border-gray-300 dark:border-gray-700 bg-transparent p-4 mb-8 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => setPromptModal(null)} className="px-6 py-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors">Abbrechen</button>
                    <button type="submit" className="px-6 py-2 text-sm font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-colors">Speichern</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header / Navigation */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || isMobileMenuOpen || view !== 'home' ? `${theme.headerBg} backdrop-blur-xl border-b ${theme.border} py-4` : 'bg-transparent py-8'} ${((view === 'runway' || (view === 'home' && !scrolled)) && !isMobileMenuOpen) ? 'text-white mix-blend-difference' : theme.text}`}>
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex justify-between items-center">
            <div onClick={() => { setView('home'); setShopMode('main'); }} className="text-2xl md:text-3xl font-serif font-semibold tracking-tighter cursor-pointer hover:opacity-70 transition-opacity flex items-baseline gap-3">
              <ET initial="RUDI BEWER" />
              {shopMode === 'men' && <span className="text-sm font-sans tracking-widest uppercase opacity-60">Herren</span>}
              {shopMode === 'women' && <span className="text-sm font-sans tracking-widest uppercase opacity-60">Damen</span>}
            </div>
            
            <nav className="hidden lg:flex gap-8 items-center font-sans font-semibold text-[10px] tracking-[0.2em] uppercase">
              <NavLinks />
              <div className="w-px h-3 bg-current opacity-20 mx-2"></div>
              <button onClick={() => setView('cart')} className={`relative hover:opacity-50 transition-opacity flex items-center gap-2 ${view === 'cart' ? 'opacity-100' : 'opacity-70'}`}>
                <span>Cart</span>
                {cart.length > 0 && <span className="absolute -top-3 -right-4 text-[9px] font-bold">{cart.length}</span>}
              </button>
            </nav>

            <div className="lg:hidden flex items-center gap-6">
              <button onClick={() => setView('cart')} className="relative">
                <ShoppingBag size={20} />
                {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-[#050505] dark:bg-[#F4F4F0] text-white dark:text-[#050505] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: '100vh', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={`lg:hidden fixed inset-0 top-[72px] ${theme.bg} z-40 flex flex-col px-6 py-12 gap-8 font-serif text-4xl`}>
                <button onClick={() => { setView('home'); setShopMode('main'); setIsMobileMenuOpen(false); }} className="text-left hover:italic">Home</button>
                <button onClick={() => { setView('shop'); setShopMode('men'); setIsMobileMenuOpen(false); }} className="text-left hover:italic">Herren</button>
                <button onClick={() => { setView('shop'); setShopMode('women'); setIsMobileMenuOpen(false); }} className="text-left hover:italic">Damen</button>
                <button onClick={() => { setView('runway'); setShopMode('main'); setIsMobileMenuOpen(false); }} className="text-left hover:italic">Runway</button>
                <button onClick={() => { setView('about'); setShopMode('main'); setIsMobileMenuOpen(false); }} className="text-left hover:italic">Maison</button>
                <button onClick={() => { setView('journal'); setShopMode('main'); setIsMobileMenuOpen(false); }} className="text-left hover:italic">Journal</button>
                <button onClick={() => { setView('history'); setShopMode('main'); setIsMobileMenuOpen(false); }} className="text-left hover:italic">Heritage</button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Main Content Area */}
        <main className="min-h-screen">
          <AnimatePresence mode="wait">
            
            {/* HOME VIEW */}
            {view === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
                <section className="relative h-screen w-full overflow-hidden bg-[#050505]">
                  <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
                    <EM initial="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-60" />
                  </motion.div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}>
                      <ET as="h2" initial="Spring / Summer 2026" className="font-sans text-[10px] tracking-[0.4em] uppercase mb-6" />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 1.5, ease: "easeOut" }}>
                      <ET as="h1" initial="EXTREME\nCONTRAST" className="font-serif text-[clamp(4rem,12vw,12rem)] leading-[0.8] tracking-tighter font-light italic" />
                    </motion.div>
                    <motion.button onClick={() => setView('runway')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} className="mt-16 flex items-center gap-4 border border-white/30 rounded-full px-8 py-4 hover:bg-white hover:text-black transition-colors font-sans text-[10px] tracking-[0.2em] uppercase">
                      <Play size={14} fill="currentColor" /> <ET initial="Watch the Show" />
                    </motion.button>
                  </div>
                </section>

                <section className="py-32 md:py-48 px-6 max-w-[1200px] mx-auto text-center">
                  <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
                    <ET as="p" initial="Gottes Schöpfung in Seide und Wolle. In Metzingen geschmiedet für die Ewigkeit. Definiere deine Präsenz." className="font-serif text-3xl md:text-5xl leading-tight text-[#050505] font-light" />
                  </motion.div>
                </section>

                <section className="px-6 md:px-12 max-w-[1600px] mx-auto pb-32">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[80vh] min-h-[600px]">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} onClick={() => { if (!isEditMode) { setView('shop'); setShopMode('men'); } }} className="relative group cursor-pointer overflow-hidden rounded-[2rem]">
                      <EM initial="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 pointer-events-none"></div>
                      <div className="absolute inset-0 p-12 flex flex-col justify-between text-white pointer-events-none">
                        <ET as="span" initial="Menswear" className="font-sans text-[10px] tracking-[0.2em] uppercase pointer-events-auto" />
                        <ET as="h2" initial="The\nGuardian" className="font-serif text-6xl md:text-8xl font-light italic pointer-events-auto" />
                      </div>
                    </motion.div>
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }} onClick={() => { if (!isEditMode) { setView('shop'); setShopMode('women'); } }} className="relative group cursor-pointer overflow-hidden rounded-[2rem]">
                      <EM initial="https://images.unsplash.com/photo-1539008835270-34989069634e?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 pointer-events-none"></div>
                      <div className="absolute inset-0 p-12 flex flex-col justify-between text-white pointer-events-none">
                        <ET as="span" initial="Womenswear" className="font-sans text-[10px] tracking-[0.2em] uppercase pointer-events-auto" />
                        <ET as="h2" initial="The\nBlossom" className="font-serif text-6xl md:text-8xl font-light italic pointer-events-auto" />
                      </div>
                    </motion.div>
                  </div>
                </section>
              </motion.div>
            )}

            {/* RUNWAY VIEW */}
            {view === 'runway' && (
              <motion.div key="runway" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#050505] text-[#F4F4F0] min-h-screen pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-[1600px] mx-auto">
                  <div className="text-center mb-24">
                    <ET as="h2" initial="Fashion Week Paris" className="font-sans text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-6" />
                    <ET as="h1" initial="SS26: THE SHOW" className="font-serif text-[clamp(3rem,8vw,8rem)] leading-[0.9] font-light italic text-outline" />
                  </div>
                  
                  <div className="aspect-video w-full bg-gray-900 mb-32 relative group cursor-pointer overflow-hidden">
                    <EM initial="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2000" type="video" className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-24 h-24 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                        <Play size={32} fill="white" className="ml-2" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    {RUNWAY_LOOKS.map((img, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i % 2 * 0.2 }} className="aspect-[3/4] overflow-hidden group">
                        <EM initial={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SHOP VIEW */}
            {view === 'shop' && (
              <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-[1600px] mx-auto px-6 md:px-12 pt-32 pb-24">
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8 border-b ${theme.border} pb-12`}>
                  <div>
                    <ET as="h2" initial="Saison 2026" className="font-sans text-[10px] tracking-[0.3em] uppercase opacity-60 mb-4" />
                    <ET as="h1" initial={shopMode === 'men' ? 'Herren Boutique' : shopMode === 'women' ? 'Damen Boutique' : 'New Arrivals'} className="font-serif text-6xl md:text-8xl font-light tracking-tighter" />
                  </div>
                  <ET as="p" initial="Kostenloser Express-Versand weltweit. Jedes Stück ein Unikat." className="font-sans text-xs tracking-widest uppercase opacity-60 max-w-xs leading-relaxed" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24">
                  {products.filter(p => {
                    if (shopMode === 'men') return p.category === 'Male';
                    if (shopMode === 'women') return p.category === 'Female';
                    if (shopMode === 'main') return p.category === 'Newest' || p.category === 'Unisex';
                    return false;
                  }).map((p, i) => {
                    const displayImage = p.colors?.[0]?.images?.[0] || p.image || '';
                    return (
                    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i % 3 * 0.1 }} key={p.id} className="group cursor-pointer relative" onClick={() => openProduct(p)}>
                      {isEditMode && (
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveProduct(p.id); }} className="absolute -top-4 -right-4 z-50 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg">
                          <X size={16} />
                        </button>
                      )}
                      <div className="aspect-[3/4] overflow-hidden mb-6 relative bg-gray-100 dark:bg-zinc-900">
                        <img src={displayImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <ET id={`product-${p.id}-tag`} as="span" initial={p.tag} className="absolute top-6 left-6 font-sans text-[9px] tracking-[0.2em] uppercase font-bold bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1.5" />
                        
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:flex items-center justify-center pointer-events-none">
                          <button onClick={(e) => { e.stopPropagation(); openProduct(p); }} className="bg-white dark:bg-black text-black dark:text-white px-8 py-4 font-sans text-[10px] tracking-[0.2em] uppercase font-bold hover:scale-105 transition-transform flex items-center gap-2 pointer-events-auto">
                            <Plus size={14} /> View Details
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-start mb-2">
                        <ET id={`product-${p.id}-name`} as="h3" initial={p.name} className="font-serif text-2xl md:text-3xl font-light group-hover:italic transition-all" />
                        <ET id={`product-${p.id}-price`} as="span" initial={`${p.price} €`} className="font-sans text-sm font-semibold ml-4 whitespace-nowrap" />
                      </div>
                      <ET id={`product-${p.id}-material`} as="p" initial={p.material} className="font-sans text-[10px] tracking-[0.1em] uppercase text-gray-500 dark:text-gray-400 mb-3" />
                    </motion.div>
                  )})}
                  {isEditMode && (
                    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-[2rem] min-h-[400px] hover:border-gray-500 dark:hover:border-gray-500 transition-colors" onClick={handleAddProduct}>
                      <div className="flex flex-col items-center gap-4 text-gray-500">
                        <Plus size={48} />
                        <span className="font-sans text-sm tracking-widest uppercase font-bold">Produkt hinzufügen</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* PRODUCT DETAIL VIEW */}
            {view === 'product' && selectedProductId && (
              <motion.div key="product" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-[1600px] mx-auto px-6 md:px-12 pt-32 pb-24">
                {(() => {
                  const product = products.find(p => p.id === selectedProductId);
                  if (!product) return <div className="text-center py-32">Produkt nicht gefunden.</div>;
                  
                  const currentColor = product.colors?.[selectedColorIndex] || { name: 'Default', images: [] };
                  const images = currentColor.images || [];
                  const currentImage = images[currentImageIndex] || product.image || '';

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                      {/* Images Section */}
                      <div className="space-y-6">
                        <div className="aspect-[3/4] bg-gray-100 dark:bg-zinc-900 relative group overflow-hidden">
                          {currentImage ? (
                            <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">Kein Bild</div>
                          )}
                          
                          {/* Image Navigation */}
                          {images.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                              {images.map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                              ))}
                            </div>
                          )}

                          {/* Edit Mode: Image Management */}
                          {isEditMode && (
                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                              <label className="bg-black/80 text-white px-3 py-1 text-xs cursor-pointer hover:bg-black transition-colors">
                                + Bild hinzufügen
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const newColors = [...(product.colors || [])];
                                    if (!newColors[selectedColorIndex]) newColors[selectedColorIndex] = { name: 'New Color', images: [] };
                                    newColors[selectedColorIndex].images.push(reader.result as string);
                                    updateProduct(product.id, { colors: newColors });
                                    setCurrentImageIndex(newColors[selectedColorIndex].images.length - 1);
                                  };
                                  reader.readAsDataURL(file);
                                }} />
                              </label>
                              {images.length > 0 && (
                                <button onClick={() => {
                                  const newColors = [...product.colors];
                                  newColors[selectedColorIndex].images.splice(currentImageIndex, 1);
                                  updateProduct(product.id, { colors: newColors });
                                  setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
                                }} className="bg-red-500/80 text-white px-3 py-1 text-xs hover:bg-red-500 transition-colors">
                                  - Bild entfernen
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Thumbnails */}
                        {images.length > 1 && (
                          <div className="flex gap-4 overflow-x-auto pb-2">
                            {images.map((img, idx) => (
                              <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-20 aspect-[3/4] shrink-0 border-2 transition-colors ${idx === currentImageIndex ? 'border-black dark:border-white' : 'border-transparent'}`}>
                                <img src={img} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Details Section */}
                      <div className="flex flex-col">
                        <div className="mb-8">
                          <ET id={`product-${product.id}-tag`} as="span" initial={product.tag} className="font-sans text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 mb-4 block" />
                          <ET id={`product-${product.id}-name`} as="h1" initial={product.name} className="font-serif text-5xl md:text-6xl font-light tracking-tighter mb-4" />
                          <ET id={`product-${product.id}-price`} as="div" initial={`${product.price} €`} className="font-sans text-2xl font-semibold" />
                        </div>

                        <div className="space-y-8 mb-12 flex-1">
                          {/* Colors */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <span className="font-sans text-xs tracking-widest uppercase text-gray-500">Farbe: {currentColor.name}</span>
                              {isEditMode && (
                                <button onClick={() => {
                                  setPromptModal({
                                    isOpen: true,
                                    title: 'Name der neuen Farbe:',
                                    defaultValue: '',
                                    onConfirm: (name) => {
                                      if (name) {
                                        const newColors = [...(product.colors || []), { name, images: [] }];
                                        updateProduct(product.id, { colors: newColors });
                                        setSelectedColorIndex(newColors.length - 1);
                                        setCurrentImageIndex(0);
                                      }
                                    }
                                  });
                                }} className="text-[10px] bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-full uppercase tracking-widest font-bold hover:opacity-80 transition-opacity">+ Farbe</button>
                              )}
                            </div>
                            <div className="flex gap-3 flex-wrap">
                              {product.colors?.map((c, idx) => (
                                <div key={idx} className="relative group">
                                  <button 
                                    onClick={() => { setSelectedColorIndex(idx); setCurrentImageIndex(0); }}
                                    className={`px-4 py-2 border text-sm transition-colors ${idx === selectedColorIndex ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'}`}
                                  >
                                    {c.name}
                                  </button>
                                  {isEditMode && product.colors.length > 1 && (
                                    <button onClick={(e) => {
                                      e.stopPropagation();
                                      const newColors = product.colors.filter((_, i) => i !== idx);
                                      updateProduct(product.id, { colors: newColors });
                                      if (selectedColorIndex >= newColors.length) setSelectedColorIndex(Math.max(0, newColors.length - 1));
                                      setCurrentImageIndex(0);
                                    }} className="absolute -top-2 -right-2 bg-red-500 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100">×</button>
                                  )}
                                  {isEditMode && (
                                    <button onClick={(e) => {
                                      e.stopPropagation();
                                      setPromptModal({
                                        isOpen: true,
                                        title: 'Farbe umbenennen:',
                                        defaultValue: c.name,
                                        onConfirm: (newName) => {
                                          if (newName) {
                                            const newColors = product.colors.map((color, i) => i === idx ? { ...color, name: newName } : color);
                                            updateProduct(product.id, { colors: newColors });
                                          }
                                        }
                                      });
                                    }} className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-gray-200 dark:bg-zinc-800 text-black dark:text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">Umbenennen</button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Sizes */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <span className="font-sans text-xs tracking-widest uppercase text-gray-500">Größe</span>
                              {isEditMode && (
                                <button onClick={() => {
                                  setPromptModal({
                                    isOpen: true,
                                    title: 'Größen kommagetrennt eingeben (z.B. S, M, L, XL):',
                                    defaultValue: product.sizes?.join(', ') || '',
                                    onConfirm: (sizesStr) => {
                                      updateProduct(product.id, { sizes: sizesStr.split(',').map(s => s.trim()).filter(Boolean) });
                                    }
                                  });
                                }} className="text-[10px] bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-full uppercase tracking-widest font-bold hover:opacity-80 transition-opacity">Größen bearbeiten</button>
                              )}
                            </div>
                            <div className="flex gap-3 flex-wrap">
                              {product.sizes?.map((s, idx) => (
                                <button 
                                  key={idx}
                                  onClick={() => setSelectedSize(s)}
                                  className={`w-12 h-12 flex items-center justify-center border text-sm transition-colors ${s === selectedSize ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'}`}
                                >
                                  {s}
                                </button>
                              ))}
                              {(!product.sizes || product.sizes.length === 0) && (
                                <span className="text-sm text-gray-500">Einheitsgröße</span>
                              )}
                            </div>
                          </div>

                          {/* Material & Description */}
                          <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                            <span className="font-sans text-xs tracking-widest uppercase text-gray-500 mb-2 block">Material</span>
                            <ET id={`product-${product.id}-material`} as="p" initial={product.material} className="font-sans text-sm mb-6" />
                            
                            <span className="font-sans text-xs tracking-widest uppercase text-gray-500 mb-2 block">Beschreibung</span>
                            <ET id={`product-${product.id}-description`} as="p" initial={product.description} className="font-sans text-sm leading-relaxed text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>

                        <button 
                          onClick={() => addToCart(product, currentColor.name, selectedSize || 'One Size', currentImage)}
                          className="w-full bg-[#050505] dark:bg-[#F4F4F0] text-white dark:text-[#050505] py-5 font-sans text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-black/80 dark:hover:bg-white/80 transition-colors flex justify-center items-center gap-2"
                        >
                          <ShoppingBag size={16} /> In den Warenkorb
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* ABOUT US VIEW */}
            {view === 'about' && (
              <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-[1600px] mx-auto px-6 md:px-12 pt-32 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                  <div className="order-2 lg:order-1 max-w-xl">
                    <ET as="h2" initial="Die Philosophie" className="font-sans text-[10px] tracking-[0.3em] uppercase text-gray-400 dark:text-gray-500 mb-8" />
                    <ET as="h1" initial="WIR WEBEN\nCHARAKTER." className="font-serif text-5xl md:text-7xl font-light leading-[0.9] mb-12 italic" />
                    <div className="space-y-8 font-sans text-sm md:text-base text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                      <ET as="p" initial="Rudi Bewer ist nicht nur Mode. Es ist die Manifestation von Gegensätzen. Wir glauben daran, dass wahre Schönheit in der Spannung entsteht: Die Härte von Kevlar verwoben mit der Zartheit von Organza-Seide." />
                      <ET as="p" initial="Jedes Stück in unserem Atelier wird als Rüstung für den modernen Alltag konzipiert. Es schützt, es atmet, es strahlt. Wir lehnen Fast Fashion ab und setzen auf Materialien, die mit der Zeit an Charakter gewinnen." />
                      <ET as="p" initial="Extreme Contrast & Harmony ist kein Slogan. Es ist unser Versprechen an Ihre Individualität." className={`font-serif text-2xl italic ${theme.text} pt-4 border-t ${theme.border}`} />
                    </div>
                  </div>
                  <div className="order-1 lg:order-2 aspect-[3/4] overflow-hidden">
                    <EM initial="https://images.unsplash.com/photo-1558769132-cb1fac08b4af?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover grayscale" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* HISTORY VIEW */}
            {view === 'history' && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-[1000px] mx-auto px-6 md:px-12 pt-32 pb-24">
                <div className="text-center mb-32">
                  <ET as="h2" initial="Unsere Wurzeln" className="font-sans text-[10px] tracking-[0.3em] uppercase text-gray-400 dark:text-gray-500 mb-6" />
                  <ET as="h1" initial="VON METZINGEN\nIN DIE WELT." className="font-serif text-5xl md:text-7xl font-light leading-[0.9] mb-8 italic" />
                </div>

                <div className="space-y-32">
                  {[
                    { year: '1998', title: 'Die Gründung', text: 'Rudi Bewer eröffnet sein erstes kleines Atelier in Metzingen, dem Herzen der deutschen Textilindustrie. Der Fokus: Maßanzüge mit unkonventionellen Schnitten.' },
                    { year: '2010', title: 'Der Material-Durchbruch', text: 'Einführung der "Quiet Moss" Wolle. Ein eigens entwickeltes Verfahren macht den Stoff wasserabweisend, ohne die Atmungsaktivität zu verlieren.' },
                    { year: '2018', title: 'Die erste Boutique', text: 'Eröffnung des Flagship-Stores. Die Marke etabliert sich als Geheimtipp für Avantgarde-Liebhaber in ganz Europa.' },
                    { year: 'Heute', title: 'Extreme Contrast', text: 'Die aktuelle Kollektion definiert die Grenzen zwischen Tech-Wear und Haute Couture neu. Rudi Bewer ist mehr als eine Marke – es ist eine Haltung.' }
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t ${theme.border} pt-12`}>
                      <ET as="div" initial={item.year} className="md:col-span-3 font-serif text-5xl font-light text-[#D9CDB3] dark:text-[#8C7A56]" />
                      <div className="md:col-span-9">
                        <ET as="h3" initial={item.title} className="font-serif text-3xl font-light mb-4" />
                        <ET as="p" initial={item.text} className="font-sans text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* JOURNAL VIEW */}
            {view === 'journal' && (
              <motion.div key="journal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-[1200px] mx-auto px-6 md:px-12 pt-32 pb-24">
                <div className={`text-center mb-24 border-b ${theme.border} pb-16`}>
                  <ET as="h1" initial="Journal" className="font-serif text-6xl md:text-8xl font-light tracking-tighter mb-6" />
                  <ET as="p" initial="Stories, Materials & Visions" className="font-sans text-xs tracking-[0.2em] uppercase text-gray-500 dark:text-gray-400" />
                </div>

                <div className="space-y-24">
                  {NEWS.map((item, i) => (
                    <motion.article key={item.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center group cursor-pointer">
                      <div className={`aspect-[4/3] overflow-hidden ${i % 2 !== 0 ? 'md:order-2' : ''}`}>
                        <EM initial={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                      </div>
                      <div className={`${i % 2 !== 0 ? 'md:order-1 md:text-right' : ''}`}>
                        <div className={`flex items-center gap-4 font-sans text-[10px] tracking-[0.2em] uppercase text-gray-500 dark:text-gray-400 mb-6 ${i % 2 !== 0 ? 'justify-end' : ''}`}>
                          <ET as="span" initial={item.category} />
                          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                          <ET as="span" initial={item.date} />
                        </div>
                        <ET as="h2" initial={item.title} className="font-serif text-4xl md:text-5xl font-light leading-tight mb-6 group-hover:italic transition-all" />
                        <ET as="p" initial="Ein tiefer Einblick in die Prozesse und Inspirationen, die unsere Kollektionen formen. Erfahren Sie mehr über die Handwerkskunst aus Metzingen." className="font-sans text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-md inline-block" />
                      </div>
                    </motion.article>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CART VIEW */}
            {view === 'cart' && (
              <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-[1600px] mx-auto px-6 md:px-12 pt-32 pb-24">
                <ET as="h1" initial="Cart" className={`font-serif text-6xl md:text-8xl font-light tracking-tighter mb-16 border-b ${theme.border} pb-12`} />
                
                {cart.length === 0 ? (
                  <div className="text-center py-32">
                    <ET as="p" initial="Ihre Kollektion ist noch leer." className="font-serif text-3xl text-gray-400 dark:text-gray-500 mb-8 italic" />
                    <button onClick={() => setView('shop')} className="bg-[#050505] dark:bg-[#F4F4F0] text-white dark:text-[#050505] px-8 py-4 font-sans text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-black/80 dark:hover:bg-white/80 transition-colors">
                      Zur Boutique
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                    <div className="flex-[2] space-y-12">
                      {cart.map((item) => (
                        <div key={item.cartItemId} className={`flex gap-8 items-center border-b ${theme.border} pb-12`}>
                          <div className="w-32 md:w-48 aspect-[3/4] bg-gray-100 dark:bg-zinc-900 shrink-0">
                            <img src={item.image || item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-serif text-2xl md:text-3xl font-light">{cmsData[`product-${item.product.id}-name`]?.content || item.product.name}</h3>
                              <span className="font-sans text-sm font-semibold">{getProductPrice(item.product).toLocaleString('de-DE')} €</span>
                            </div>
                            <p className="font-sans text-[10px] tracking-[0.1em] uppercase text-gray-500 dark:text-gray-400 mb-2">Farbe: {item.color}</p>
                            <p className="font-sans text-[10px] tracking-[0.1em] uppercase text-gray-500 dark:text-gray-400 mb-6">Größe: {item.size}</p>
                            <button onClick={() => setCart(cart.filter(c => c.cartItemId !== item.cartItemId))} className="font-sans text-[10px] tracking-[0.2em] uppercase text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors border-b border-transparent hover:border-red-700 dark:hover:border-red-400 pb-1">
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex-1">
                      <div className="bg-[#050505] dark:bg-[#1A1A1A] text-[#F4F4F0] p-10 sticky top-32">
                        <ET as="h2" initial="Summary" className="font-serif text-3xl font-light mb-12" />
                        <div className="space-y-6 font-sans text-sm font-light opacity-80 mb-12">
                          <div className="flex justify-between"><span>Subtotal</span><span>{cartTotal.toLocaleString('de-DE')} €</span></div>
                          <div className="flex justify-between"><span>Express Shipping</span><span>Complimentary</span></div>
                        </div>
                        <div className="border-t border-white/20 pt-8 mb-12">
                          <div className="flex justify-between items-end">
                            <span className="font-sans text-sm uppercase tracking-widest">Total</span>
                            <span className="font-sans text-2xl font-semibold">{cartTotal.toLocaleString('de-DE')} €</span>
                          </div>
                        </div>
                        <button onClick={() => setView('checkout')} className="w-full bg-[#F4F4F0] dark:bg-[#050505] text-[#050505] dark:text-[#F4F4F0] py-5 font-sans text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white dark:hover:bg-black transition-colors flex justify-center items-center gap-2 border border-transparent dark:border-white/20">
                          Checkout <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* CHECKOUT VIEW */}
            {view === 'checkout' && (
              <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-[800px] mx-auto px-6 md:px-12 pt-32 pb-24">
                <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tighter mb-16 text-center">Checkout</h1>
                
                {cart.length === 0 ? (
                  <div className="text-center">
                    <p className="mb-8">Ihre Kollektion ist leer.</p>
                    <button onClick={() => setView('shop')} className="border border-black dark:border-white px-8 py-4 font-sans text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                      Zurück zur Boutique
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setCart([]);
                    setNotification('Vielen Dank für Ihre Bestellung!');
                    setTimeout(() => setNotification(null), 5000);
                    setView('home');
                  }} className="space-y-12">
                    
                    {/* Contact Info */}
                    <div className="space-y-6">
                      <h2 className="font-sans text-xs tracking-[0.2em] uppercase font-bold border-b border-gray-200 dark:border-gray-800 pb-4">Kontaktinformationen</h2>
                      <div className="grid grid-cols-1 gap-4">
                        <input type="email" required placeholder="E-Mail Adresse" className="w-full bg-transparent border border-gray-300 dark:border-gray-700 p-4 font-sans text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-6">
                      <h2 className="font-sans text-xs tracking-[0.2em] uppercase font-bold border-b border-gray-200 dark:border-gray-800 pb-4">Lieferadresse</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" required placeholder="Vorname" className="w-full bg-transparent border border-gray-300 dark:border-gray-700 p-4 font-sans text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                        <input type="text" required placeholder="Nachname" className="w-full bg-transparent border border-gray-300 dark:border-gray-700 p-4 font-sans text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                        <input type="text" required placeholder="Straße und Hausnummer" className="w-full md:col-span-2 bg-transparent border border-gray-300 dark:border-gray-700 p-4 font-sans text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                        <input type="text" required placeholder="PLZ" className="w-full bg-transparent border border-gray-300 dark:border-gray-700 p-4 font-sans text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                        <input type="text" required placeholder="Stadt" className="w-full bg-transparent border border-gray-300 dark:border-gray-700 p-4 font-sans text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                      </div>
                    </div>

                    {/* Payment Info (Dummy) */}
                    <div className="space-y-6">
                      <h2 className="font-sans text-xs tracking-[0.2em] uppercase font-bold border-b border-gray-200 dark:border-gray-800 pb-4">Zahlung</h2>
                      <div className="bg-gray-50 dark:bg-zinc-900 p-6 border border-gray-200 dark:border-gray-800">
                        <p className="font-sans text-sm text-gray-500 mb-4">Dies ist ein Demo-Shop. Es wird keine echte Zahlung durchgeführt.</p>
                        <div className="grid grid-cols-1 gap-4">
                          <input type="text" required placeholder="Kreditkartennummer" className="w-full bg-transparent border border-gray-300 dark:border-gray-700 p-4 font-sans text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" required placeholder="MM/YY" className="w-full bg-transparent border border-gray-300 dark:border-gray-700 p-4 font-sans text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                            <input type="text" required placeholder="CVC" className="w-full bg-transparent border border-gray-300 dark:border-gray-700 p-4 font-sans text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex justify-between items-center font-bold text-xl">
                        <span>Gesamtsumme</span>
                        <span>{cartTotal.toLocaleString('de-DE')} €</span>
                      </div>
                      <button type="submit" className="w-full bg-[#050505] dark:bg-[#F4F4F0] text-white dark:text-[#050505] py-5 font-sans text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-black/80 dark:hover:bg-white/80 transition-colors">
                        Kostenpflichtig bestellen
                      </button>
                    </div>

                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="bg-[#050505] text-[#F4F4F0] pt-32 pb-12 px-6 md:px-12 mt-24">
          <div className="max-w-[1600px] mx-auto">
            <div className="border-b border-white/20 pb-24 mb-24 text-center max-w-2xl mx-auto">
              <ET as="h2" initial="The Inner Circle" className="font-serif text-4xl md:text-5xl font-light mb-6" />
              <ET as="p" initial="Erhalten Sie exklusiven Zugang zu limitierten Drops, Runway-Shows und Private Sales in Metzingen." className="font-sans text-sm font-light text-gray-400 mb-10" />
              <form className="flex border-b border-white/30 pb-2" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Email Address" className="flex-1 bg-transparent border-none outline-none font-sans text-sm placeholder-gray-600" required />
                <button type="submit" className="font-sans text-[10px] tracking-[0.2em] uppercase font-bold hover:text-[#D9CDB3] transition-colors">Subscribe</button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
              <div className="md:col-span-2">
                <ET as="div" initial="RUDI BEWER" className="font-serif text-3xl font-semibold tracking-tighter mb-6" />
                <ET as="p" initial="Extreme Contrast & Harmony. Handgefertigt in Metzingen. Weltweit geschätzt von der Avantgarde." className="font-sans text-xs font-light text-gray-400 max-w-xs mb-8 leading-relaxed" />
                <div className="flex gap-6">
                  <a href="#" className="hover:text-[#D9CDB3] transition-colors"><Instagram size={20} /></a>
                  <a href="#" className="hover:text-[#D9CDB3] transition-colors"><Twitter size={20} /></a>
                </div>
              </div>
              
              <div>
                <h4 className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-8">Boutique</h4>
                <ul className="space-y-4 font-sans text-sm font-light text-gray-300">
                  <li><button onClick={() => { setView('shop'); setShopMode('main'); }} className="hover:text-white hover:italic transition-all">New Arrivals</button></li>
                  <li><button onClick={() => { setView('shop'); setShopMode('men'); }} className="hover:text-white hover:italic transition-all">Herren</button></li>
                  <li><button onClick={() => { setView('shop'); setShopMode('women'); }} className="hover:text-white hover:italic transition-all">Damen</button></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-8">Maison</h4>
                <ul className="space-y-4 font-sans text-sm font-light text-gray-300">
                  <li><button onClick={() => setView('about')} className="hover:text-white hover:italic transition-all">Philosophy</button></li>
                  <li><button onClick={() => setView('runway')} className="hover:text-white hover:italic transition-all">Runway</button></li>
                  <li><button onClick={() => setView('journal')} className="hover:text-white hover:italic transition-all">Journal</button></li>
                  <li><button onClick={() => setView('history')} className="hover:text-white hover:italic transition-all">Heritage</button></li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 font-sans text-[10px] tracking-[0.2em] uppercase text-gray-500">
              <span 
                onClick={() => setIsEditMode(!isEditMode)} 
                className="cursor-pointer hover:text-white transition-colors flex items-center gap-2"
              >
                © 2026 Rudi Bewer Metzingen 
                {isEditMode && <span className="text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded">[EDIT MODE ACTIVE]</span>}
              </span>
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Legal</a>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </EditContext.Provider>
  );
}
