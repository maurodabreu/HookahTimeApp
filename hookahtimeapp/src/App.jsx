import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  TrendingUp, 
  Plus, 
  Users, 
  DollarSign, 
  Package, 
  LogOut,
  BarChart3,
  ShieldCheck,
  Store,
  Lock,
  AlertCircle,
  Trash2,
  Edit2,
  KeyRound,
  UserPlus
} from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

// Catalog base
const SERVICE_CATALOG = [
  { id: 'srv_general', name: 'Servicio General', desc: 'Hookah estándar con sabor tradicional' },
  { id: 'srv_vip', name: 'Servicio VIP', desc: 'Hookah Premium con mezclas especiales' },
  { id: 'srv_descorche', name: 'Servicio Descorche', desc: 'Armado con insumos del cliente' },
  { id: 'srv_boquillas', name: 'Boquillas Adicionales', desc: 'Paquete de boquillas de repuesto' },
];

const DEFAULT_VENUES = [
  { id: 'venue_1', name: 'Noziva', code: 'NZV', key: '1234', prices: { srv_general: 20, srv_vip: 35, srv_descorche: 15, srv_boquillas: 2 } },
  { id: 'venue_2', name: 'Zeta Bar', code: 'ZTB', key: '5678', prices: { srv_general: 25, srv_vip: 40, srv_descorche: 15, srv_boquillas: 3 } },
  { id: 'venue_3', name: 'Avituz', code: 'AVZ', key: '9012', prices: { srv_general: 18, srv_vip: 30, srv_descorche: 10, srv_boquillas: 2 } }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeVenueKey, setActiveVenueKey] = useState('');
  const [venueAuthenticated, setVenueAuthenticated] = useState(false);

  // Firestore Collections States
  const [venues, setVenues] = useState(DEFAULT_VENUES);
  const [operators, setOperators] = useState([]);
  const [admins, setAdmins] = useState([
    { id: 'adm_1', username: 'mauricio', password: 'admin123', name: 'Mauricio' },
    { id: 'adm_2', username: 'kiara', password: 'admin123', name: 'Kiara' }
  ]);
  const [sales, setSales] = useState([]);
  const [shifts, setShifts] = useState({});

  // Auth Forms State
  const [loginRole, setLoginRole] = useState('operator');
  const [authInput, setAuthInput] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Admin Toggles & Filters
  const [adminTab, setAdminTab] = useState('metrics');
  const [timeFilter, setTimeFilter] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modals & Editing
  const [editingSale, setEditingSale] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showNewVenueModal, setShowNewVenueModal] = useState(false);

  // Sync Venues from Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'venues'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setVenues(list);
      } else {
        // Initialize default venues in Firestore if empty
        DEFAULT_VENUES.forEach(async (v) => {
          await setDoc(doc(db, 'venues', v.id), v);
        });
      }
    }, (error) => console.log('Firestore Venues sync note:', error));
    return () => unsub();
  }, []);

  // Sync Sales from Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSales(list.sort((a, b) => b.timestamp - a.timestamp));
    }, (error) => console.log('Firestore Sales sync note:', error));
    return () => unsub();
  }, []);

  // Sync Operators from Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'operators'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setOperators(list);
      }
    }, (error) => console.log('Firestore Operators sync note:', error));
    return () => unsub();
  }, []);

  // Sync Shifts from Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'shifts'), (snapshot) => {
      const shiftMap = {};
      snapshot.docs.forEach(d => {
        shiftMap[d.id] = d.data();
      });
      setShifts(shiftMap);
    }, (error) => console.log('Firestore Shifts sync note:', error));
    return () => unsub();
  }, []);

  const activeVenue = useMemo(() => {
    if (!currentUser || currentUser.role !== 'operator') return venues[0] || DEFAULT_VENUES[0];
    return venues.find(v => v.id === currentUser.venueId) || venues[0] || DEFAULT_VENUES[0];
  }, [currentUser, venues]);

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const cleanUsername = authInput.username.trim().toLowerCase();
    const cleanPassword = authInput.password.trim();

    if (loginRole === 'admin') {
      const adminFound = admins.find(a => a.username.toLowerCase() === cleanUsername && a.password === cleanPassword);
      if (adminFound) {
        setCurrentUser({ ...adminFound, role: 'admin' });
        setAuthInput({ username: '', password: '' });
      } else {
        setAuthError('Usuario o contraseña de Administrador incorrectos.');
      }
    } else {
      const operatorFound = operators.find(o => o.username.toLowerCase() === cleanUsername && o.pin === cleanPassword);
      if (operatorFound) {
        setCurrentUser({ ...operatorFound, role: 'operator' });
        setAuthInput({ username: '', password: '' });
        setVenueAuthenticated(false);
      } else {
        setAuthError('Usuario de Operador o PIN incorrecto.');
      }
    }
  };

  const handleVenueKeyVerification = (e) => {
    e.preventDefault();
    if (!activeVenue) return;
    if (activeVenueKey === activeVenue.key) {
      setVenueAuthenticated(true);
      setActiveVenueKey('');
      setAuthError('');
    } else {
      setAuthError(`Clave de acceso incorrecta para ${activeVenue.name}`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setVenueAuthenticated(false);
    setActiveVenueKey('');
  };

  // Shift Opening Action
  const handleStartShift = async (startInventory, notes) => {
    const shiftData = {
      isOpen: true,
      startTime: Date.now(),
      startInventory: { ...startInventory },
      currentInventory: { ...startInventory },
      notes
    };
    setShifts(prev => ({ ...prev, [activeVenue.id]: shiftData }));
    await setDoc(doc(db, 'shifts', activeVenue.id), shiftData);
  };

  // Shift Closing Action
  const handleCloseShift = async (endInventory, notes) => {
    const currentShift = shifts[activeVenue.id] || {};
    const shiftData = {
      ...currentShift,
      isOpen: false,
      currentInventory: { ...endInventory },
      closingNotes: notes,
      closeTime: Date.now()
    };
    setShifts(prev => ({ ...prev, [activeVenue.id]: shiftData }));
    await setDoc(doc(db, 'shifts', activeVenue.id), shiftData);
  };

  // Register Sale to Firestore
  const handleRegisterSale = async (serviceId, customAmount, notes, tabacoUsed, carbonesUsed, boquillasUsed) => {
    const srv = SERVICE_CATALOG.find(s => s.id === serviceId);
    const amount = customAmount ? parseFloat(customAmount) : (activeVenue.prices?.[serviceId] || 0);

    const newSale = {
      venueId: activeVenue.id,
      serviceId,
      serviceName: srv ? srv.name : 'Servicio Especial',
      amount,
      notes,
      operatorName: currentUser.name,
      timestamp: Date.now()
    };

    await addDoc(collection(db, 'sales'), newSale);

    // Update shift inventory in Firestore
    const currentShift = shifts[activeVenue.id];
    if (currentShift && currentShift.isOpen) {
      const updatedShift = {
        ...currentShift,
        currentInventory: {
          tabaco: Math.max(0, (currentShift.currentInventory?.tabaco || 0) - (tabacoUsed || 1)),
          carbones: Math.max(0, (currentShift.currentInventory?.carbones || 0) - (carbonesUsed || 3)),
          boquillas: Math.max(0, (currentShift.currentInventory?.boquillas || 0) - (boquillasUsed || 1))
        }
      };
      await setDoc(doc(db, 'shifts', activeVenue.id), updatedShift);
    }
  };

  const handleDeleteSale = async (saleId) => {
    await deleteDoc(doc(db, 'sales', saleId));
  };

  const handleUpdateSale = async (updatedSale) => {
    await updateDoc(doc(db, 'sales', updatedSale.id), {
      amount: updatedSale.amount,
      notes: updatedSale.notes
    });
    setEditingSale(null);
  };

  // Price Update Syncs directly with Cloud Firestore
  const handlePriceUpdate = async (venueId, serviceId, newPrice) => {
    const venueRef = doc(db, 'venues', venueId);
    const venueToUpdate = venues.find(v => v.id === venueId);
    if (!venueToUpdate) return;

    const updatedPrices = {
      ...venueToUpdate.prices,
      [serviceId]: parseFloat(newPrice) || 0
    };

    setVenues(prev => prev.map(v => v.id === venueId ? { ...v, prices: updatedPrices } : v));
    await updateDoc(venueRef, { prices: updatedPrices });
  };

  const handleKeyUpdate = async (venueId, newKey) => {
    setVenues(prev => prev.map(v => v.id === venueId ? { ...v, key: newKey } : v));
    await updateDoc(doc(db, 'venues', venueId), { key: newKey });
  };

  const handleCreateVenue = async (newVenueData) => {
    const id = `venue_${Date.now()}`;
    const newVenue = { id, ...newVenueData };
    setVenues(prev => [...prev, newVenue]);
    await setDoc(doc(db, 'venues', id), newVenue);
    setShowNewVenueModal(false);
  };

  const handleCreateOperator = async (newOp) => {
    const id = `op_${Date.now()}`;
    const opData = { id, ...newOp };
    setOperators(prev => [...prev, opData]);
    await setDoc(doc(db, 'operators', id), opData);
  };

  const handleUpdateOperator = async (updatedOp) => {
    setOperators(prev => prev.map(op => op.id === updatedOp.id ? updatedOp : op));
    await setDoc(doc(db, 'operators', updatedOp.id), updatedOp);
    setEditingUser(null);
  };

  const handleDeleteOperator = async (opId) => {
    setOperators(prev => prev.filter(op => op.id !== opId));
    await deleteDoc(doc(db, 'operators', opId));
  };

  const handleCreateAdmin = (newAdmin) => {
    const id = `adm_${Date.now()}`;
    setAdmins(prev => [...prev, { id, ...newAdmin }]);
  };

  const handleUpdateAdmin = (updatedAdmin) => {
    setAdmins(prev => prev.map(adm => adm.id === updatedAdmin.id ? updatedAdmin : adm));
    if (currentUser && currentUser.id === updatedAdmin.id) {
      setCurrentUser(prev => ({ ...prev, ...updatedAdmin }));
    }
    setEditingUser(null);
  };

  const handleDeleteAdmin = (admId) => {
    if (admins.length <= 1) {
      alert("No se puede eliminar el único administrador del sistema.");
      return;
    }
    setAdmins(prev => prev.filter(adm => adm.id !== admId));
  };

  const adminMetrics = useMemo(() => {
    const targetDate = new Date(selectedDate);
    const targetDay = targetDate.getDate();
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    const filtered = sales.filter(s => {
      const saleDate = new Date(s.timestamp);
      if (timeFilter === 'daily') {
        return saleDate.getDate() === targetDay && saleDate.getMonth() === targetMonth && saleDate.getFullYear() === targetYear;
      }
      if (timeFilter === 'monthly') {
        return saleDate.getMonth() === targetMonth && saleDate.getFullYear() === targetYear;
      }
      if (timeFilter === 'yearly') {
        return saleDate.getFullYear() === targetYear;
      }
      return true;
    });

    const totalRevenue = filtered.reduce((acc, s) => acc + (s.amount || 0), 0);
    const totalServices = filtered.length;

    const venueStats = venues.map(v => {
      const vSales = filtered.filter(s => s.venueId === v.id);
      const rev = vSales.reduce((acc, s) => acc + (s.amount || 0), 0);
      return { id: v.id, name: v.name, code: v.code, revenue: rev, count: vSales.length };
    });

    return { filteredSales: filtered, totalRevenue, totalServices, venueStats };
  }, [sales, selectedDate, timeFilter, venues]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans antialiased selection:bg-purple-600 selection:text-white">
      <header className="border-b border-purple-950/80 bg-[#120e1d]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/40 border border-purple-400/30">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white flex items-center">
                HOOKAH<span className="text-purple-400">TIME!</span>
              </h1>
              <p className="text-[10px] text-purple-300/60 uppercase font-mono tracking-widest">Enterprise Suite</p>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-extrabold text-white">{currentUser.name}</p>
                <p className="text-[10px] text-purple-400 font-mono capitalize">
                  {currentUser.role === 'admin' ? '🛡️ Administrador' : `👤 Operador - ${activeVenue.name}`}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 bg-purple-950/60 hover:bg-purple-900 border border-purple-800/40 rounded-xl text-purple-300 hover:text-white transition-all shadow-md"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!currentUser && (
          <div className="max-w-md mx-auto my-12 bg-[#120e1d] border border-purple-950/80 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-purple-950/60 border border-purple-800/40 rounded-2xl text-purple-400 mb-1">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Acceso al Sistema</h2>
              <p className="text-xs text-purple-300/60">Selecciona tu rol para ingresar a HookahTime!</p>
            </div>

            <div className="flex bg-[#09090b] p-1.5 rounded-2xl border border-purple-950/80">
              <button
                onClick={() => { setLoginRole('operator'); setAuthError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  loginRole === 'operator' ? 'bg-purple-600 text-white shadow-lg' : 'text-purple-400/60 hover:text-white'
                }`}
              >
                Operador de Local
              </button>
              <button
                onClick={() => { setLoginRole('admin'); setAuthError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  loginRole === 'admin' ? 'bg-purple-600 text-white shadow-lg' : 'text-purple-400/60 hover:text-white'
                }`}
              >
                Administrador
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-rose-950/60 border border-rose-900/60 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1.5 uppercase tracking-wider">Usuario</label>
                <input
                  type="text"
                  required
                  placeholder={loginRole === 'admin' ? 'mauricio' : 'juan'}
                  value={authInput.username}
                  onChange={e => setAuthInput({ ...authInput, username: e.target.value })}
                  className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1.5 uppercase tracking-wider">
                  {loginRole === 'admin' ? 'Contraseña' : 'PIN de Acceso'}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authInput.password}
                  onChange={e => setAuthInput({ ...authInput, password: e.target.value })}
                  className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
              >
                Iniciar Sesión
              </button>
            </form>
          </div>
        )}

        {/* OPERATOR FLOW */}
        {currentUser && currentUser.role === 'operator' && (
          <div className="space-y-6">
            {!venueAuthenticated ? (
              <div className="max-w-md mx-auto my-12 bg-[#120e1d] border border-purple-950/80 rounded-3xl p-8 shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 bg-purple-950/60 border border-purple-800/40 rounded-2xl text-purple-400 mb-1">
                    <Store className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-white">{activeVenue.name}</h2>
                  <p className="text-xs text-purple-300/60">Ingresa la clave del local para verificar acceso.</p>
                </div>

                {authError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-900/60 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleVenueKeyVerification} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1.5 uppercase tracking-wider">Clave del Local</label>
                    <input
                      type="password"
                      required
                      placeholder="PIN"
                      value={activeVenueKey}
                      onChange={e => setActiveVenueKey(e.target.value)}
                      className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-center tracking-widest"
                    />
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all">
                    Ingresar a la Discoteca
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#120e1d] border border-purple-950/80 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-black text-white">{activeVenue.name}</span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                        shifts[activeVenue.id]?.isOpen ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60' : 'bg-rose-950/60 text-rose-400 border border-rose-900/60'
                      }`}>
                        {shifts[activeVenue.id]?.isOpen ? 'Jornada Activa' : 'Jornada Cerrada'}
                      </span>
                    </div>
                  </div>

                  {shifts[activeVenue.id]?.isOpen && (
                    <div className="flex items-center space-x-6 text-xs bg-[#09090b] px-4 py-2.5 rounded-2xl border border-purple-950/80">
                      <div>
                        <span className="text-purple-400 font-bold block text-[10px] uppercase">Tabaco</span>
                        <span className="font-mono font-bold text-white">{shifts[activeVenue.id]?.currentInventory?.tabaco || 0} u.</span>
                      </div>
                      <div className="border-l border-purple-950 pl-6">
                        <span className="text-purple-400 font-bold block text-[10px] uppercase">Carbones</span>
                        <span className="font-mono font-bold text-white">{shifts[activeVenue.id]?.currentInventory?.carbones || 0} u.</span>
                      </div>
                      <div className="border-l border-purple-950 pl-6">
                        <span className="text-purple-400 font-bold block text-[10px] uppercase">Boquillas</span>
                        <span className="font-mono font-bold text-white">{shifts[activeVenue.id]?.currentInventory?.boquillas || 0} u.</span>
                      </div>
                    </div>
                  )}
                </div>

                {!shifts[activeVenue.id]?.isOpen ? (
                  <div className="max-w-lg mx-auto bg-[#120e1d] border border-purple-950/80 rounded-3xl p-6 space-y-4">
                    <h3 className="font-extrabold text-white text-base">Apertura de Jornada de Trabajo</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target;
                      handleStartShift({
                        tabaco: Number(form.tabaco.value),
                        carbones: Number(form.carbones.value),
                        boquillas: Number(form.boquillas.value)
                      }, form.notes.value);
                    }} className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-purple-300 uppercase mb-1">Tabaco</label>
                          <input type="number" min="0" required name="tabaco" defaultValue="50" className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white font-bold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-purple-300 uppercase mb-1">Carbones</label>
                          <input type="number" min="0" required name="carbones" defaultValue="200" className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white font-bold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-purple-300 uppercase mb-1">Boquillas</label>
                          <input type="number" min="0" required name="boquillas" defaultValue="100" className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white font-bold" />
                        </div>
                      </div>
                      <textarea name="notes" rows="2" placeholder="Notas de apertura..." className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white"></textarea>
                      <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg">
                        Iniciar Jornada de Trabajo
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-[#120e1d] border border-purple-950/80 rounded-3xl p-6">
                      <h3 className="font-extrabold text-white mb-4 flex items-center space-x-2">
                        <Plus className="w-5 h-5 text-purple-400" />
                        <span>Registrar Nuevo Servicio / Venta</span>
                      </h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        handleRegisterSale(
                          form.serviceId.value,
                          form.customAmount.value,
                          form.notes.value,
                          Number(form.tabacoUsed.value),
                          Number(form.carbonesUsed.value),
                          Number(form.boquillasUsed.value)
                        );
                        form.reset();
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-purple-200 mb-1">Tipo de Servicio</label>
                            <select name="serviceId" required className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white font-bold">
                              {SERVICE_CATALOG.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.name} - ${activeVenue.prices?.[s.id] || 0}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-purple-200 mb-1">Precio Personalizado ($)</label>
                            <input type="number" step="0.5" name="customAmount" placeholder="Opcional" className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white font-mono" />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 bg-[#09090b] p-3 rounded-2xl border border-purple-950/80">
                          <div>
                            <label className="block text-[10px] font-bold text-purple-400 uppercase">Tabaco usado</label>
                            <input type="number" name="tabacoUsed" defaultValue="1" min="0" className="w-full bg-transparent font-bold text-white text-xs" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-purple-400 uppercase">Carbones usados</label>
                            <input type="number" name="carbonesUsed" defaultValue="3" min="0" className="w-full bg-transparent font-bold text-white text-xs" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-purple-400 uppercase">Boquillas usadas</label>
                            <input type="number" name="boquillasUsed" defaultValue="1" min="0" className="w-full bg-transparent font-bold text-white text-xs" />
                          </div>
                        </div>

                        <textarea name="notes" rows="2" placeholder="Observaciones de venta..." className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white"></textarea>

                        <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg">
                          Cargar Servicio a la Cuenta
                        </button>
                      </form>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-[#120e1d] border border-purple-950/80 rounded-2xl p-6">
                        <h3 className="font-extrabold text-white text-base mb-4 flex items-center space-x-2">
                          <Flame className="w-5 h-5 text-purple-400" />
                          <span>Ventas Registradas en este Local</span>
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-purple-200">
                            <thead className="bg-[#09090b] text-purple-400 uppercase tracking-wider">
                              <tr>
                                <th className="p-3">Hora</th>
                                <th className="p-3">Servicio</th>
                                <th className="p-3">Notas</th>
                                <th className="p-3 text-right">Monto ($)</th>
                                <th className="p-3 text-center">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-950/60">
                              {sales.filter(s => s.venueId === activeVenue.id).map((sale, idx) => (
                                <tr key={sale.id || idx}>
                                  <td className="p-3 text-purple-400 font-mono">
                                    {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                  <td className="p-3 font-bold text-white">{sale.serviceName}</td>
                                  <td className="p-3 text-purple-300/60">{sale.notes || '-'}</td>
                                  <td className="p-3 text-right font-black text-purple-300">${sale.amount?.toFixed(2)}</td>
                                  <td className="p-3 text-center">
                                    <button onClick={() => handleDeleteSale(sale.id)} className="text-purple-400 hover:text-rose-400">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="bg-[#120e1d] border border-purple-950/80 rounded-2xl p-6 space-y-4">
                        <h3 className="font-extrabold text-white text-base">Cierre de Jornada</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target;
                          handleCloseShift({
                            tabaco: Number(form.endTabaco.value),
                            carbones: Number(form.endCarbones.value),
                            boquillas: Number(form.endBoquillas.value)
                          }, form.closeNotes.value);
                        }} className="space-y-3">
                          <input type="number" min="0" required name="endTabaco" defaultValue={shifts[activeVenue.id]?.currentInventory?.tabaco || 0} className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white" />
                          <input type="number" min="0" required name="endCarbones" defaultValue={shifts[activeVenue.id]?.currentInventory?.carbones || 0} className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white" />
                          <input type="number" min="0" required name="endBoquillas" defaultValue={shifts[activeVenue.id]?.currentInventory?.boquillas || 0} className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white" />
                          <textarea name="closeNotes" rows="2" placeholder="Novedades de cierre..." className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white"></textarea>
                          <button type="submit" className="w-full py-3 bg-rose-950/60 hover:bg-rose-900 border border-rose-900 text-rose-200 font-black text-xs uppercase rounded-xl">
                            Finalizar y Cerrar Jornada
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ADMIN FLOW */}
        {currentUser && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex bg-[#120e1d] p-1.5 rounded-2xl border border-purple-950/80 space-x-1">
              <button onClick={() => setAdminTab('metrics')} className={`px-4 py-2 rounded-xl text-xs font-bold ${adminTab === 'metrics' ? 'bg-purple-600 text-white' : 'text-purple-400/60'}`}>Métricas & Ventas</button>
              <button onClick={() => setAdminTab('pricing')} className={`px-4 py-2 rounded-xl text-xs font-bold ${adminTab === 'pricing' ? 'bg-purple-600 text-white' : 'text-purple-400/60'}`}>Tarifario por Discoteca</button>
              <button onClick={() => setAdminTab('operators')} className={`px-4 py-2 rounded-xl text-xs font-bold ${adminTab === 'operators' ? 'bg-purple-600 text-white' : 'text-purple-400/60'}`}>Cuentas & Accesos</button>
            </div>

            {adminTab === 'metrics' && (
              <div className="space-y-6">
                <div className="bg-[#120e1d] border border-purple-950/80 p-5 rounded-3xl flex justify-between items-center">
                  <h2 className="text-xl font-black text-white">Ventas Totales: ${adminMetrics.totalRevenue.toFixed(2)}</h2>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-[#09090b] text-xs px-3 py-2 rounded-xl border border-purple-900/50" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {venues.map(v => (
                    <div key={v.id} className="bg-[#120e1d] border border-purple-950/80 p-5 rounded-2xl">
                      <h3 className="font-bold text-white text-base">{v.name}</h3>
                      <p className="text-xs text-purple-400 font-mono mt-1">Total: ${adminMetrics.venueStats.find(st => st.id === v.id)?.revenue.toFixed(2) || '0.00'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminTab === 'pricing' && (
              <div className="bg-[#120e1d] border border-purple-950/80 rounded-3xl p-6 overflow-x-auto">
                <h3 className="text-base font-extrabold text-white mb-4">Tarifario de Discotecas (Se guarda en tiempo real ☁️)</h3>
                <table className="w-full text-left text-xs text-purple-200">
                  <thead className="bg-[#09090b] text-purple-400 uppercase">
                    <tr>
                      <th className="p-3">Servicio</th>
                      {venues.map(v => <th key={v.id} className="p-3 text-center">{v.name}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-950/60">
                    {SERVICE_CATALOG.map(srv => (
                      <tr key={srv.id}>
                        <td className="p-3 font-bold text-white">{srv.name}</td>
                        {venues.map(v => (
                          <td key={v.id} className="p-3 text-center">
                            <input
                              type="number"
                              step="0.5"
                              defaultValue={v.prices?.[srv.id] || 0}
                              onBlur={e => handlePriceUpdate(v.id, srv.id, e.target.value)}
                              className="w-20 bg-[#09090b] border border-purple-900/50 rounded-xl px-2 py-1 text-center font-mono font-bold text-white"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {adminTab === 'operators' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#120e1d] border border-purple-950/80 rounded-3xl p-6 space-y-4">
                  <h3 className="text-base font-extrabold text-white">Operadores</h3>
                  {operators.map(op => (
                    <div key={op.id} className="bg-[#09090b] p-3 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-xs">{op.name}</p>
                        <p className="text-[10px] text-purple-400 font-mono">{op.username} | PIN: {op.pin}</p>
                      </div>
                      <button onClick={() => handleDeleteOperator(op.id)} className="text-rose-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target;
                    handleCreateOperator({ name: form.name.value, username: form.username.value, venueId: form.venueId.value, pin: form.pin.value });
                    form.reset();
                  }} className="space-y-2 pt-2">
                    <input type="text" name="name" required placeholder="Nombre" className="w-full bg-[#09090b] p-2 text-xs border border-purple-900/50 rounded-xl" />
                    <input type="text" name="username" required placeholder="Usuario" className="w-full bg-[#09090b] p-2 text-xs border border-purple-900/50 rounded-xl font-mono" />
                    <select name="venueId" required className="w-full bg-[#09090b] p-2 text-xs border border-purple-900/50 rounded-xl">
                      {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <input type="password" name="pin" required placeholder="PIN" className="w-full bg-[#09090b] p-2 text-xs border border-purple-900/50 rounded-xl font-mono" />
                    <button type="submit" className="w-full py-2 bg-purple-600 text-white font-bold text-xs rounded-xl">Agregar Operador</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
