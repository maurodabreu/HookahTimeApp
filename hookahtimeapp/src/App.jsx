import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  TrendingUp, 
  Plus, 
  Users, 
  DollarSign, 
  Package, 
  ChevronRight,
  LogOut,
  Building2,
  BarChart3,
  ShieldCheck,
  Store,
  Lock,
  AlertCircle,
  Trash2,
  Edit2,
  KeyRound,
  UserCheck,
  UserPlus
} from 'lucide-react';

// Default Venues Setup
const DEFAULT_VENUES = [
  { 
    id: 'venue_1', 
    name: 'Noziva', 
    code: 'NZV', 
    key: '1234',
    prices: { srv_general: 20, srv_vip: 35, srv_descorche: 15, srv_boquillas: 2 }
  },
  { 
    id: 'venue_2', 
    name: 'Zeta Bar', 
    code: 'ZTB', 
    key: '5678',
    prices: { srv_general: 25, srv_vip: 40, srv_descorche: 15, srv_boquillas: 3 }
  },
  { 
    id: 'venue_3', 
    name: 'Avituz', 
    code: 'AVZ', 
    key: '9012',
    prices: { srv_general: 18, srv_vip: 30, srv_descorche: 10, srv_boquillas: 2 }
  }
];

// Services catalog
const SERVICE_CATALOG = [
  { id: 'srv_general', name: 'Servicio General', desc: 'Hookah estándar con sabor tradicional' },
  { id: 'srv_vip', name: 'Servicio VIP', desc: 'Hookah Premium con mezclas especiales' },
  { id: 'srv_descorche', name: 'Servicio Descorche', desc: 'Armado con insumos del cliente' },
  { id: 'srv_boquillas', name: 'Boquillas Adicionales', desc: 'Paquete de boquillas de repuesto' },
];

export default function App() {
  // App Core States
  const [currentUser, setCurrentUser] = useState(null); // { username, role: 'admin'|'operator', venueId? }
  const [activeVenueKey, setActiveVenueKey] = useState('');
  const [venueAuthenticated, setVenueAuthenticated] = useState(false);

  // Master Configurations
  const [venues, setVenues] = useState(DEFAULT_VENUES);
  const [operators, setOperators] = useState([
    { id: 'op_1', username: 'juan', name: 'Juan Pérez', venueId: 'venue_1', pin: '1111' },
    { id: 'op_2', username: 'carlos', name: 'Carlos Mendoza', venueId: 'venue_2', pin: '2222' }
  ]);
  const [admins, setAdmins] = useState([
    { id: 'adm_1', username: 'mauricio', password: 'admin123', name: 'Mauricio' },
    { id: 'adm_2', username: 'kiara', password: 'admin123', name: 'Kiara' }
  ]);

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
  const [editingUser, setEditingUser] = useState(null); // { type: 'admin'|'operator', user: obj }
  const [showNewVenueModal, setShowNewVenueModal] = useState(false);

  // Dynamic Sales & Shifts State
  const [sales, setSales] = useState([
    { id: '1', venueId: 'venue_1', serviceId: 'srv_general', serviceName: 'Servicio General', amount: 20, notes: 'Servicio normal sin novedades', operatorName: 'Juan Pérez', timestamp: Date.now() - 3600000 },
    { id: '2', venueId: 'venue_1', serviceId: 'srv_vip', serviceName: 'Servicio VIP', amount: 35, notes: 'Cliente pagó manguera extra ($5)', operatorName: 'Juan Pérez', timestamp: Date.now() - 7200000 }
  ]);

  const [shifts, setShifts] = useState({
    venue_1: { isOpen: true, startTime: Date.now() - 14400000, startInventory: { tabaco: 50, carbones: 200, boquillas: 100 }, currentInventory: { tabaco: 42, carbones: 160, boquillas: 85 }, notes: 'Inicio de turno sin novedades' },
    venue_2: { isOpen: false, startTime: null, startInventory: { tabaco: 0, carbones: 0, boquillas: 0 }, currentInventory: { tabaco: 0, carbones: 0, boquillas: 0 }, notes: '' },
    venue_3: { isOpen: false, startTime: null, startInventory: { tabaco: 0, carbones: 0, boquillas: 0 }, currentInventory: { tabaco: 0, carbones: 0, boquillas: 0 }, notes: '' }
  });

  // Active Selected Venue for Operator Dashboard
  const activeVenue = useMemo(() => {
    if (!currentUser || currentUser.role !== 'operator') return venues[0];
    return venues.find(v => v.id === currentUser.venueId) || venues[0];
  }, [currentUser, venues]);

  // Handle Authentication submit
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

  // Handle Venue Access Key verification for Operator
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

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setVenueAuthenticated(false);
    setActiveVenueKey('');
  };

  // Shift Opening Action
  const handleStartShift = (startInventory, notes) => {
    setShifts(prev => ({
      ...prev,
      [activeVenue.id]: {
        isOpen: true,
        startTime: Date.now(),
        startInventory: { ...startInventory },
        currentInventory: { ...startInventory },
        notes
      }
    }));
  };

  // Shift Closing Action
  const handleCloseShift = (endInventory, notes) => {
    setShifts(prev => ({
      ...prev,
      [activeVenue.id]: {
        ...prev[activeVenue.id],
        isOpen: false,
        currentInventory: { ...endInventory },
        closingNotes: notes,
        closeTime: Date.now()
      }
    }));
  };

  // Register a New Service Sale (Operator)
  const handleRegisterSale = (serviceId, customAmount, notes, tabacoUsed, carbonesUsed, boquillasUsed) => {
    const srv = SERVICE_CATALOG.find(s => s.id === serviceId);
    const amount = customAmount ? parseFloat(customAmount) : (activeVenue.prices[serviceId] || 0);

    const newSale = {
      id: Date.now().toString(),
      venueId: activeVenue.id,
      serviceId,
      serviceName: srv ? srv.name : 'Servicio Especial',
      amount,
      notes,
      operatorName: currentUser.name,
      timestamp: Date.now()
    };

    setSales(prev => [newSale, ...prev]);

    // Update inventory
    setShifts(prev => {
      const currentShift = prev[activeVenue.id];
      if (!currentShift) return prev;
      return {
        ...prev,
        [activeVenue.id]: {
          ...currentShift,
          currentInventory: {
            tabaco: Math.max(0, currentShift.currentInventory.tabaco - (tabacoUsed || 1)),
            carbones: Math.max(0, currentShift.currentInventory.carbones - (carbonesUsed || 3)),
            boquillas: Math.max(0, currentShift.currentInventory.boquillas - (boquillasUsed || 1))
          }
        }
      };
    });
  };

  // Delete Sale Action
  const handleDeleteSale = (saleId) => {
    setSales(prev => prev.filter(s => s.id !== saleId));
  };

  // Update Sale Action
  const handleUpdateSale = (updatedSale) => {
    setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
    setEditingSale(null);
  };

  // Create New Venue (Admin)
  const handleCreateVenue = (newVenueData) => {
    const id = `venue_${Date.now()}`;
    const newVenue = { id, ...newVenueData };
    setVenues(prev => [...prev, newVenue]);
    setShifts(prev => ({
      ...prev,
      [id]: { isOpen: false, startTime: null, startInventory: { tabaco: 0, carbones: 0, boquillas: 0 }, currentInventory: { tabaco: 0, carbones: 0, boquillas: 0 }, notes: '' }
    }));
    setShowNewVenueModal(false);
  };

  // Update Venue Access Key (Admin)
  const handleKeyUpdate = (venueId, newKey) => {
    setVenues(prev => prev.map(v => v.id === venueId ? { ...v, key: newKey } : v));
  };

  // Update Service Price for Venue (Admin)
  const handlePriceUpdate = (venueId, serviceId, newPrice) => {
    setVenues(prev => prev.map(v => {
      if (v.id === venueId) {
        return {
          ...v,
          prices: { ...v.prices, [serviceId]: parseFloat(newPrice) || 0 }
        };
      }
      return v;
    }));
  };

  // Create New Operator (Admin)
  const handleCreateOperator = (newOp) => {
    const id = `op_${Date.now()}`;
    setOperators(prev => [...prev, { id, ...newOp }]);
  };

  // Update Operator Credentials
  const handleUpdateOperator = (updatedOp) => {
    setOperators(prev => prev.map(op => op.id === updatedOp.id ? updatedOp : op));
    setEditingUser(null);
  };

  // Delete Operator Account
  const handleDeleteOperator = (opId) => {
    setOperators(prev => prev.filter(op => op.id !== opId));
  };

  // Create New Admin (Admin)
  const handleCreateAdmin = (newAdmin) => {
    const id = `adm_${Date.now()}`;
    setAdmins(prev => [...prev, { id, ...newAdmin }]);
  };

  // Update Admin Credentials
  const handleUpdateAdmin = (updatedAdmin) => {
    setAdmins(prev => prev.map(adm => adm.id === updatedAdmin.id ? updatedAdmin : adm));

    // Update current logged session if updating own profile
    if (currentUser && currentUser.id === updatedAdmin.id) {
      setCurrentUser(prev => ({ ...prev, ...updatedAdmin }));
    }
    setEditingUser(null);
  };

  // Delete Admin Account
  const handleDeleteAdmin = (admId) => {
    if (admins.length <= 1) {
      alert("No se puede eliminar el único administrador del sistema.");
      return;
    }
    setAdmins(prev => prev.filter(adm => adm.id !== admId));
  };

  // Filtered Metrics Calculation (Admin)
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
      return true; // 'all'
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
      {/* HEADER NAVBAR */}
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
        {/* LOGIN CONTAINER */}
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

        {/* OPERATOR DASHBOARD FLOW */}
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
                    <label className="block text-xs font-bold text-purple-200 mb-1.5 uppercase tracking-wider">Clave de Acceso del Local</label>
                    <input
                      type="password"
                      required
                      placeholder="PIN del Local"
                      value={activeVenueKey}
                      onChange={e => setActiveVenueKey(e.target.value)}
                      className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-center tracking-widest"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                  >
                    Ingresar a la Discoteca
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* STATUS BAR & SHIFT OPENING/CLOSING */}
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
                    <p className="text-xs text-purple-300/60 mt-0.5">Punto de venta y control de inventario en vivo.</p>
                  </div>

                  {shifts[activeVenue.id]?.isOpen && (
                    <div className="flex items-center space-x-6 text-xs bg-[#09090b] px-4 py-2.5 rounded-2xl border border-purple-950/80">
                      <div>
                        <span className="text-purple-400 font-bold block text-[10px] uppercase">Tabaco</span>
                        <span className="font-mono font-bold text-white">{shifts[activeVenue.id].currentInventory.tabaco} u.</span>
                      </div>
                      <div className="border-l border-purple-950 pl-6">
                        <span className="text-purple-400 font-bold block text-[10px] uppercase">Carbones</span>
                        <span className="font-mono font-bold text-white">{shifts[activeVenue.id].currentInventory.carbones} u.</span>
                      </div>
                      <div className="border-l border-purple-950 pl-6">
                        <span className="text-purple-400 font-bold block text-[10px] uppercase">Boquillas</span>
                        <span className="font-mono font-bold text-white">{shifts[activeVenue.id].currentInventory.boquillas} u.</span>
                      </div>
                    </div>
                  )}
                </div>

                {!shifts[activeVenue.id]?.isOpen ? (
                  <div className="max-w-lg mx-auto bg-[#120e1d] border border-purple-950/80 rounded-3xl p-6 space-y-4">
                    <h3 className="font-extrabold text-white text-base">Apertura de Jornada de Trabajo</h3>
                    <p className="text-xs text-purple-300/60">Ingresa el conteo de insumos iniciales para activar la caja:</p>

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
                          <label className="block text-[10px] font-bold text-purple-300 uppercase mb-1">Tabaco (Unid.)</label>
                          <input type="number" min="0" required name="tabaco" defaultValue="50" className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white font-bold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-purple-300 uppercase mb-1">Carbones (Unid.)</label>
                          <input type="number" min="0" required name="carbones" defaultValue="200" className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white font-bold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-purple-300 uppercase mb-1">Boquillas (Unid.)</label>
                          <input type="number" min="0" required name="boquillas" defaultValue="100" className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white font-bold" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 uppercase mb-1">Observaciones Iniciales</label>
                        <textarea name="notes" rows="2" placeholder="Notas de apertura..." className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white"></textarea>
                      </div>

                      <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg">
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
                            <select name="serviceId" required className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-bold">
                              {SERVICE_CATALOG.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.name} - ${activeVenue.prices[s.id]}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-purple-200 mb-1">Precio Personalizado ($)</label>
                            <input type="number" step="0.5" name="customAmount" placeholder="Opcional" className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono" />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 bg-[#09090b] p-3 rounded-2xl border border-purple-950/80">
                          <div>
                            <label className="block text-[10px] font-bold text-purple-400 uppercase">Tabaco usado</label>
                            <input type="number" name="tabacoUsed" defaultValue="1" min="0" className="w-full bg-transparent font-bold text-white text-xs focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-purple-400 uppercase">Carbones usados</label>
                            <input type="number" name="carbonesUsed" defaultValue="3" min="0" className="w-full bg-transparent font-bold text-white text-xs focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-purple-400 uppercase">Boquillas usadas</label>
                            <input type="number" name="boquillasUsed" defaultValue="1" min="0" className="w-full bg-transparent font-bold text-white text-xs focus:outline-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-purple-200 mb-1">Observaciones / Acuerdos</label>
                          <textarea name="notes" rows="2" placeholder="Detalles de pago o acuerdos..." className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"></textarea>
                        </div>

                        <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all">
                          Cargar Servicio a la Cuenta
                        </button>
                      </form>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-[#120e1d] border border-purple-950/80 rounded-2xl p-6">
                        <h3 className="font-extrabold text-white text-base mb-4 flex items-center space-x-2">
                          <Flame className="w-5 h-5 text-purple-400" />
                          <span>Servicios Vendidos en este Local</span>
                        </h3>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-purple-200">
                            <thead className="bg-[#09090b] text-purple-400 uppercase tracking-wider">
                              <tr>
                                <th className="p-3 rounded-l-lg">Hora</th>
                                <th className="p-3">Servicio</th>
                                <th className="p-3">Observaciones</th>
                                <th className="p-3 text-right">Precio ($)</th>
                                <th className="p-3 text-center rounded-r-lg">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-950/60">
                              {sales.filter(s => s.venueId === activeVenue.id).map((sale, idx) => (
                                <tr key={idx} className="hover:bg-purple-950/30">
                                  <td className="p-3 text-purple-400 font-mono">
                                    {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                  <td className="p-3 font-semibold text-white">{sale.serviceName}</td>
                                  <td className="p-3 text-purple-300/60 italic">{sale.notes || '-'}</td>
                                  <td className="p-3 text-right font-black text-purple-300">${sale.amount?.toFixed(2)}</td>
                                  <td className="p-3 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                      <button onClick={() => setEditingSale(sale)} className="p-1 text-purple-400 hover:text-white">
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => handleDeleteSale(sale.id)} className="p-1 text-purple-400 hover:text-rose-400">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {sales.filter(s => s.venueId === activeVenue.id).length === 0 && (
                                <tr>
                                  <td colSpan="5" className="text-center py-8 text-purple-400/40">
                                    Aún no hay servicios registrados en este turno.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="bg-[#120e1d] border border-purple-950/80 rounded-2xl p-6 space-y-4">
                        <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                          <Package className="w-5 h-5 text-purple-400" />
                          <span>Cierre de Jornada e Inventario Final</span>
                        </h3>

                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target;
                          handleCloseShift({
                            tabaco: Number(form.endTabaco.value),
                            carbones: Number(form.endCarbones.value),
                            boquillas: Number(form.endBoquillas.value)
                          }, form.closeNotes.value);
                        }} className="space-y-3">
                          <p className="text-[11px] text-purple-300/70">Ingresa el conteo físico de inventario al momento de cerrar la discoteca:</p>
                          
                          <div>
                            <label className="block text-[10px] font-bold text-purple-300 uppercase">Tabaco Final (Unid.)</label>
                            <input type="number" min="0" required name="endTabaco" defaultValue={shifts[activeVenue.id]?.currentInventory.tabaco} className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white font-bold" />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-purple-300 uppercase">Carbones Final (Unid.)</label>
                            <input type="number" min="0" required name="endCarbones" defaultValue={shifts[activeVenue.id]?.currentInventory.carbones} className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white font-bold" />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-purple-300 uppercase">Boquillas Final (Unid.)</label>
                            <input type="number" min="0" required name="endBoquillas" defaultValue={shifts[activeVenue.id]?.currentInventory.boquillas} className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white font-bold" />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-purple-300 uppercase">Novedades de Cierre</label>
                            <textarea name="closeNotes" rows="2" placeholder="Observaciones de caja, conteo o faltantes..." className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white"></textarea>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 bg-rose-950/60 hover:bg-rose-900 border border-rose-900 text-rose-200 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
                          >
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

        {/* ADMIN DASHBOARD FLOW */}
        {currentUser && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-950/80 pb-4">
              <div className="flex bg-[#120e1d] p-1.5 rounded-2xl border border-purple-950/80 space-x-1">
                <button
                  onClick={() => setAdminTab('metrics')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    adminTab === 'metrics' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-400/60 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Métricas & Ventas</span>
                </button>

                <button
                  onClick={() => setAdminTab('venues')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    adminTab === 'venues' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-400/60 hover:text-white'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Locales ({venues.length})</span>
                </button>

                <button
                  onClick={() => setAdminTab('pricing')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    adminTab === 'pricing' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-400/60 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Tarifario por Discoteca</span>
                </button>

                <button
                  onClick={() => setAdminTab('operators')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    adminTab === 'operators' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-400/60 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Cuentas & Accesos</span>
                </button>
              </div>

              {adminTab === 'venues' && (
                <button
                  onClick={() => setShowNewVenueModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Nuevo Local</span>
                </button>
              )}
            </div>

            {/* TAB 1: METRICS & SALES DASHBOARD */}
            {adminTab === 'metrics' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#120e1d] border border-purple-950/80 p-5 rounded-3xl">
                  <div>
                    <h2 className="text-2xl font-black text-white">Métricas & Rendimiento</h2>
                    <p className="text-xs text-purple-300/60 mt-0.5">Filtrado inteligente de ventas e historial de transacciones.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="bg-[#09090b] border border-purple-900/50 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
                    />

                    <div className="flex bg-[#09090b] p-1 rounded-2xl border border-purple-950/80">
                      {['daily', 'monthly', 'yearly', 'all'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setTimeFilter(filter)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                            timeFilter === filter ? 'bg-purple-600 text-white shadow-md' : 'text-purple-400/60 hover:text-white'
                          }`}
                        >
                          {filter === 'daily' ? 'Día' : filter === 'monthly' ? 'Mes' : filter === 'yearly' ? 'Año' : 'Todos'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#120e1d] border border-purple-950/80 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-purple-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Ventas Totales</span>
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-black text-white">${adminMetrics.totalRevenue.toFixed(2)}</div>
                    <div className="text-[10px] text-purple-400/60 mt-1 capitalize">Filtro: {timeFilter}</div>
                  </div>

                  <div className="bg-[#120e1d] border border-purple-950/80 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-purple-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Servicios Vendidos</span>
                      <Flame className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-3xl font-black text-white">{adminMetrics.totalServices}</div>
                    <div className="text-[10px] text-purple-400/60 mt-1">Total servicios en período</div>
                  </div>

                  <div className="bg-[#120e1d] border border-purple-950/80 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-purple-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Ticket Promedio</span>
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="text-3xl font-black text-white">
                      ${adminMetrics.totalServices > 0 ? (adminMetrics.totalRevenue / adminMetrics.totalServices).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-[10px] text-purple-400/60 mt-1">Promedio por servicio</div>
                  </div>

                  <div className="bg-[#120e1d] border border-purple-950/80 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-purple-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Puntos de Venta</span>
                      <Store className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-3xl font-black text-white">{venues.length}</div>
                    <div className="text-[10px] text-purple-400/60 mt-1">Locales activos</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {adminMetrics.venueStats.map(v => (
                    <div key={v.id} className="bg-[#120e1d] border border-purple-950/80 p-6 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-white text-base">{v.name}</h3>
                        <span className="text-xs font-mono font-bold text-purple-400">{v.code}</span>
                      </div>

                      <div className="pt-2 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-purple-400 uppercase font-bold">Ingresos acumulados</p>
                          <p className="text-2xl font-black text-emerald-400">${v.revenue.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-purple-400 uppercase font-bold">Servicios</p>
                          <p className="text-base font-bold text-white">{v.count}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* INVENTORY CONTROL PANEL FOR ADMIN */}
                <div className="bg-[#120e1d] border border-purple-950/80 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                        <Package className="w-5 h-5 text-purple-400" />
                        <span>Estado de Inventario Global & Reabastecimiento</span>
                      </h3>
                      <p className="text-xs text-purple-300/60 mt-0.5">Control en tiempo real de los insumos disponibles por discoteca.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {venues.map(v => {
                      const shift = shifts[v.id];
                      const inv = shift?.currentInventory || { tabaco: 0, carbones: 0, boquillas: 0 };
                      const isLowTabaco = inv.tabaco < 15;
                      const isLowCarbones = inv.carbones < 50;
                      const isLowBoquillas = inv.boquillas < 20;

                      return (
                        <div key={v.id} className="bg-[#09090b] border border-purple-950/80 p-5 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center border-b border-purple-950/80 pb-2">
                            <span className="font-bold text-white text-sm">{v.name}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${shift?.isOpen ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60' : 'bg-rose-950/60 text-rose-400 border border-rose-900/60'}`}>
                              {shift?.isOpen ? 'En Jornada' : 'Sin Turno'}
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-purple-300">Tabaco (Unid.):</span>
                              <span className={`font-mono font-bold ${isLowTabaco ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                                {inv.tabaco} u. {isLowTabaco && '⚠️ Reponer'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-purple-300">Carbones (Unid.):</span>
                              <span className={`font-mono font-bold ${isLowCarbones ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                                {inv.carbones} u. {isLowCarbones && '⚠️ Reponer'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-purple-300">Boquillas (Unid.):</span>
                              <span className={`font-mono font-bold ${isLowBoquillas ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                                {inv.boquillas} u. {isLowBoquillas && '⚠️ Reponer'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#120e1d] border border-purple-950/80 p-6 rounded-3xl">
                  <h3 className="text-base font-extrabold text-white mb-4">Registro Global de Ventas (Auditoría)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-purple-200">
                      <thead className="bg-[#09090b] text-purple-400 uppercase tracking-wider">
                        <tr>
                          <th className="p-3 rounded-l-lg">Fecha/Hora</th>
                          <th className="p-3">Discoteca</th>
                          <th className="p-3">Servicio</th>
                          <th className="p-3">Operador</th>
                          <th className="p-3">Observaciones</th>
                          <th className="p-3 text-right">Monto ($)</th>
                          <th className="p-3 text-center rounded-r-lg">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-950/60">
                        {adminMetrics.filteredSales.map((s, idx) => {
                          const vName = venues.find(v => v.id === s.venueId)?.name || 'Local';
                          return (
                            <tr key={idx} className="hover:bg-purple-950/30">
                              <td className="p-3 text-purple-400 font-mono">
                                {new Date(s.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </td>
                              <td className="p-3 font-bold text-white">{vName}</td>
                              <td className="p-3 text-purple-200">{s.serviceName}</td>
                              <td className="p-3 text-purple-400">{s.operatorName}</td>
                              <td className="p-3 text-purple-300/60 italic">{s.notes || '-'}</td>
                              <td className="p-3 text-right font-black text-purple-300">${s.amount?.toFixed(2)}</td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <button onClick={() => setEditingSale(s)} className="p-1 text-purple-400 hover:text-white">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteSale(s.id)} className="p-1 text-purple-400 hover:text-rose-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {adminMetrics.filteredSales.length === 0 && (
                          <tr>
                            <td colSpan="7" className="text-center py-8 text-purple-400/40">
                              No existen transacciones registradas para este filtro de fecha.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VENUES MANAGEMENT */}
            {adminTab === 'venues' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {venues.map(v => (
                  <div key={v.id} className="bg-[#120e1d] border border-purple-950/80 p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-black text-white">{v.name}</h3>
                        <p className="text-xs text-purple-400 font-mono">Código: {v.code}</p>
                      </div>
                      <div className="p-2 bg-purple-950/60 border border-purple-800/40 rounded-xl text-purple-300">
                        <Store className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-purple-950/80">
                      <label className="block text-[10px] font-bold text-purple-400 uppercase">Clave de Acceso del Local</label>
                      <input
                        type="text"
                        defaultValue={v.key}
                        onBlur={e => handleKeyUpdate(v.id, e.target.value)}
                        className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: PRICING CONFIGURATION */}
            {adminTab === 'pricing' && (
              <div className="bg-[#120e1d] border border-purple-950/80 rounded-3xl p-6 overflow-x-auto">
                <h3 className="text-base font-extrabold text-white mb-4">Configurar Precios por Discoteca ($)</h3>
                <table className="w-full text-left text-xs text-purple-200">
                  <thead className="bg-[#09090b] text-purple-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 rounded-l-lg">Servicio</th>
                      {venues.map(v => (
                        <th key={v.id} className="p-3.5 text-center">{v.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-950/60">
                    {SERVICE_CATALOG.map(srv => (
                      <tr key={srv.id} className="hover:bg-purple-950/30">
                        <td className="p-3.5">
                          <p className="font-bold text-white">{srv.name}</p>
                          <p className="text-[10px] text-purple-400/60">{srv.desc}</p>
                        </td>
                        {venues.map(v => (
                          <td key={v.id} className="p-3.5 text-center">
                            <input
                              type="number"
                              step="0.5"
                              defaultValue={v.prices[srv.id] || 0}
                              onBlur={e => handlePriceUpdate(v.id, srv.id, e.target.value)}
                              className="w-24 bg-[#09090b] border border-purple-900/50 rounded-xl px-3 py-1.5 text-center text-xs font-bold text-white focus:outline-none focus:border-purple-500 font-mono"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 4: OPERATOR & ADMIN ACCOUNTS MANAGEMENT */}
            {adminTab === 'operators' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* OPERATORS MANAGEMENT */}
                <div className="bg-[#120e1d] border border-purple-950/80 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-purple-950/80 pb-3">
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span>Cuentas de Operadores ({operators.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {operators.map(op => {
                      const vName = venues.find(v => v.id === op.venueId)?.name || 'Sin Asignar';
                      return (
                        <div key={op.id} className="bg-[#09090b] p-3.5 rounded-2xl border border-purple-950/80 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-white text-xs">{op.name}</p>
                            <p className="text-[10px] text-purple-400 font-mono mt-0.5">
                              Usuario: <span className="text-purple-200 font-bold">{op.username}</span> | Discoteca: {vName}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right font-mono text-xs text-purple-300 font-bold bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/40">
                              PIN: {op.pin}
                            </div>
                            <button
                              onClick={() => setEditingUser({ type: 'operator', user: op })}
                              className="p-2 text-purple-400 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 rounded-xl border border-purple-800/30 transition-all"
                              title="Editar Credenciales"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteOperator(op.id)}
                              className="p-2 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 rounded-xl border border-rose-800/30 transition-all"
                              title="Eliminar Operador por Defecto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {operators.length === 0 && (
                      <p className="text-center py-6 text-purple-400/50 text-xs">No hay operadores registrados actualmente.</p>
                    )}
                  </div>

                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target;
                    handleCreateOperator({
                      name: form.name.value,
                      username: form.username.value,
                      venueId: form.venueId.value,
                      pin: form.pin.value
                    });
                    form.reset();
                  }} className="pt-4 border-t border-purple-950/80 space-y-3">
                    <p className="text-xs font-extrabold text-purple-200 flex items-center space-x-1.5">
                      <UserPlus className="w-4 h-4 text-purple-400" />
                      <span>Crear Nuevo Operador</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" name="name" required placeholder="Nombre Completo" className="bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white" />
                      <input type="text" name="username" required placeholder="Usuario" className="bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select name="venueId" required className="bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white">
                        {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      <input type="password" name="pin" required placeholder="PIN de Acceso" className="bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white font-mono" />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-md">
                      Registrar Operador
                    </button>
                  </form>
                </div>

                {/* ADMINS MANAGEMENT */}
                <div className="bg-[#120e1d] border border-purple-950/80 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-purple-950/80 pb-3">
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      <span>Cuentas de Administradores ({admins.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {admins.map(adm => (
                      <div key={adm.id} className="bg-[#09090b] p-3.5 rounded-2xl border border-purple-950/80 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white text-xs">{adm.name}</p>
                          <p className="text-[10px] text-purple-400 font-mono mt-0.5">
                            Usuario: <span className="text-purple-200 font-bold">{adm.username}</span>
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right font-mono text-xs text-indigo-300 font-bold bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/40">
                            {adm.password}
                          </div>
                          <button
                            onClick={() => setEditingUser({ type: 'admin', user: adm })}
                            className="p-2 text-purple-400 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 rounded-xl border border-purple-800/30 transition-all"
                            title="Editar Credenciales Admin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {admins.length > 1 && (
                            <button
                              onClick={() => handleDeleteAdmin(adm.id)}
                              className="p-2 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 rounded-xl border border-rose-800/30 transition-all"
                              title="Eliminar Administrador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={e => {
                    e.preventDefault();
                    const form = e.target;
                    handleCreateAdmin({
                      name: form.name.value,
                      username: form.username.value,
                      password: form.password.value
                    });
                    form.reset();
                  }} className="pt-4 border-t border-purple-950/80 space-y-3">
                    <p className="text-xs font-extrabold text-purple-200 flex items-center space-x-1.5">
                      <UserPlus className="w-4 h-4 text-indigo-400" />
                      <span>Registrar Nuevo Administrador</span>
                    </p>
                    <input type="text" name="name" required placeholder="Nombre Completo" className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" name="username" required placeholder="Usuario Admin" className="bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white font-mono" />
                      <input type="password" name="password" required placeholder="Contraseña Admin" className="bg-[#09090b] border border-purple-900/50 rounded-xl p-2.5 text-xs text-white font-mono" />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md">
                      Crear Administrador
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL: ADD NEW VENUE */}
      {showNewVenueModal && (
        <ModalNewVenue
          onClose={() => setShowNewVenueModal(false)}
          onSubmit={handleCreateVenue}
        />
      )}

      {/* MODAL: EDIT SALE */}
      {editingSale && (
        <ModalEditSale
          sale={editingSale}
          onClose={() => setEditingSale(null)}
          onSubmit={handleUpdateSale}
        />
      )}

      {/* MODAL: EDIT USER/ADMIN CREDENTIALS */}
      {editingUser && (
        <ModalEditUserCredentials
          target={editingUser}
          venues={venues}
          onClose={() => setEditingUser(null)}
          onSaveAdmin={handleUpdateAdmin}
          onSaveOperator={handleUpdateOperator}
        />
      )}
    </div>
  );
}

// Modal Component: Add New Venue
function ModalNewVenue({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [key, setKey] = useState('');
  const [prices, setPrices] = useState({ srv_general: 20, srv_vip: 35, srv_descorche: 15, srv_boquillas: 2 });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, code, key, prices });
  };

  return (
    <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#120e1d] border border-purple-950/90 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-black text-white mb-1">Agregar Nuevo Local</h3>
        <p className="text-xs text-purple-300/60 mb-4">Registra una nueva discoteca en tu red de HookahTime!</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-purple-200 font-bold mb-1">Nombre de la Discoteca</label>
            <input
              type="text"
              required
              placeholder="Ej: Velvet Club"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-purple-200 font-bold mb-1">Sigla / Código</label>
              <input
                type="text"
                required
                maxLength="4"
                placeholder="Ej: VLV"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-white uppercase font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-purple-200 font-bold mb-1">Clave de Operador</label>
              <input
                type="text"
                required
                placeholder="PIN"
                value={key}
                onChange={e => setKey(e.target.value)}
                className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-purple-900/50 text-purple-300 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black shadow-lg"
            >
              Crear Discoteca
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component: Edit Sale
function ModalEditSale({ sale, onClose, onSubmit }) {
  const [amount, setAmount] = useState(sale.amount || 0);
  const [notes, setNotes] = useState(sale.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...sale,
      amount: Number(amount),
      notes
    });
  };

  return (
    <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#120e1d] border border-purple-950/90 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-black text-white mb-1">Editar Registro de Servicio</h3>
        <p className="text-xs text-purple-300/60 mb-4">{sale.serviceName}</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-purple-200 font-bold mb-1">Monto en Dólares ($)</label>
            <input
              type="number"
              step="0.5"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-purple-200 font-bold mb-1">Observaciones / Novedades</label>
            <textarea
              rows="3"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-purple-900/50 text-purple-300 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black shadow-lg"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component: Edit User or Admin Credentials
function ModalEditUserCredentials({ target, venues, onClose, onSaveAdmin, onSaveOperator }) {
  const isAdmin = target.type === 'admin';
  const user = target.user;

  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || '');
  const [passwordOrPin, setPasswordOrPin] = useState(isAdmin ? (user.password || '') : (user.pin || ''));
  const [venueId, setVenueId] = useState(user.venueId || venues[0]?.id || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAdmin) {
      onSaveAdmin({
        ...user,
        name,
        username,
        password: passwordOrPin
      });
    } else {
      onSaveOperator({
        ...user,
        name,
        username,
        pin: passwordOrPin,
        venueId
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#120e1d] border border-purple-950/90 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center space-x-2 mb-1">
          <KeyRound className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-black text-white">
            Modificar {isAdmin ? 'Administrador' : 'Operador'}
          </h3>
        </div>
        <p className="text-xs text-purple-300/60 mb-4">Actualiza el usuario o la contraseña de acceso.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-purple-200 font-bold mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-purple-200 font-bold mb-1">Nombre de Usuario</label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-purple-200 font-bold mb-1">
              {isAdmin ? 'Nueva Contraseña' : 'Nuevo PIN de Acceso'}
            </label>
            <input
              type="text"
              required
              value={passwordOrPin}
              onChange={e => setPasswordOrPin(e.target.value)}
              className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {!isAdmin && (
            <div>
              <label className="block text-purple-200 font-bold mb-1">Discoteca Asignada</label>
              <select
                value={venueId}
                onChange={e => setVenueId(e.target.value)}
                className="w-full bg-[#09090b] border border-purple-900/50 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-bold"
              >
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-purple-900/50 text-purple-300 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black shadow-lg"
            >
              Guardar Credenciales
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
