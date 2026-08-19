import React, { useState, useEffect } from 'react';
import { TravelRequest, UserProfile } from './types';
import { INITIAL_TRAVEL_REQUESTS, INITIAL_USER_PROFILE } from './data';
import DashboardView from './components/DashboardView';
import NewTravelForm from './components/NewTravelForm';
import MyRequestsView from './components/MyRequestsView';
import ProfileView from './components/ProfileView';
import RequestDetailsModal from './components/RequestDetailsModal';

import { 
  LayoutDashboard, 
  PlusCircle, 
  Plane, 
  User as UserIcon,
  ShieldAlert,
  Menu,
  ChevronRight
} from 'lucide-react';

export default function App() {
  // Navigation layout state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new-request' | 'my-requests' | 'profile'>('new-request');
  
  // App data states
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  
  // Detail and edit focus states
  const [editingRequest, setEditingRequest] = useState<TravelRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<TravelRequest | null>(null);

  // Load state from API and localStorage on first render
  useEffect(() => {
    // 1. Initial quick load from localStorage as immediate offline fallback
    const savedRequests = localStorage.getItem('stm_travel_requests');
    let fallbackRequests = INITIAL_TRAVEL_REQUESTS;
    if (savedRequests) {
      try {
        const parsed = JSON.parse(savedRequests);
        if (Array.isArray(parsed)) {
          fallbackRequests = parsed.map((r: any) => r.status === 'Rascunho' ? { ...r, status: 'Pendente' } : r);
        }
      } catch (e) {
        fallbackRequests = INITIAL_TRAVEL_REQUESTS;
      }
    }
    setRequests(fallbackRequests);

    const savedProfile = localStorage.getItem('stm_user_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        setUserProfile(INITIAL_USER_PROFILE);
      }
    }

    // 2. Fetch fresh real-time data from PostgreSQL/Supabase DB
    const syncWithBackend = async (isSilent = false) => {
      try {
        // Synchronize and get user profile
        if (!isSilent) {
          const profileRes = await fetch('/api/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData) {
              setUserProfile(profileData);
              localStorage.setItem('stm_user_profile', JSON.stringify(profileData));
            }
          }
        }

        // Fetch travel requests
        const requestsRes = await fetch('/api/requests');
        if (requestsRes.ok) {
          const dbRequests = await requestsRes.json();
          if (Array.isArray(dbRequests)) {
            // Keep all already registered requests so that none are ever deleted or lost on backend restart
            const merged = [...dbRequests];
            const dbIds = new Set(dbRequests.map((r: any) => r.id));
            
            for (const localReq of fallbackRequests) {
              if (!dbIds.has(localReq.id)) {
                merged.push(localReq);
                // Auto upload to persist on the restarted server fallback
                try {
                  await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(localReq)
                  });
                } catch (pe) {
                  console.error('Auto upload error:', pe);
                }
              }
            }
            
            // Sort by id descending
            merged.sort((a, b) => b.id.localeCompare(a.id));
            
            setRequests(merged);
            localStorage.setItem('stm_travel_requests', JSON.stringify(merged));
          }
        }
      } catch (err) {
        if (!isSilent) {
          console.warn('Backend server database of Supabase is not available or initialized. Standing by on local storage.');
        }
      }
    };

    syncWithBackend();

    // Setup background synchronization interval (every 8 seconds) to keep PC and mobile synced in real-time
    const intervalId = setInterval(() => {
      syncWithBackend(true);
    }, 8000);

    return () => clearInterval(intervalId);
  }, []);

  // Sync to database if available, otherwise save locally
  const saveRequestsToStorage = async (updatedRequests: TravelRequest[], singleTarget?: TravelRequest) => {
    setRequests(updatedRequests);
    localStorage.setItem('stm_travel_requests', JSON.stringify(updatedRequests));

    if (singleTarget) {
      try {
        await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(singleTarget)
        });
      } catch (e) {
        console.error('Error synchronizing request saving with Supabase database:', e);
      }
    }
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('stm_user_profile', JSON.stringify(updatedProfile));

    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
    } catch (e) {
      console.error('Error synchronizing profile saving with Supabase database:', e);
    }
  };

  // Create or Update Request Handler (Full Submit)
  const handleSubmitRequest = (formData: Omit<TravelRequest, 'id' | 'dataCriacao' | 'status'>) => {
    if (editingRequest) {
      // Modifying existing
      const updatedRequest: TravelRequest = {
        ...editingRequest,
        ...formData,
        status: 'Pendente' as const
      };
      const updatedList = requests.map(r => r.id === editingRequest.id ? updatedRequest : r);
      saveRequestsToStorage(updatedList, updatedRequest);
      setEditingRequest(null);
    } else {
      // Adding new request
      const highestIdNum = requests.reduce((max, r) => {
        const match = r.id.match(/TR-2026-(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      
      const nextIdNum = highestIdNum + 1;
      const newRequest: TravelRequest = {
        ...formData,
        id: `TR-2026-${String(nextIdNum).padStart(3, '0')}`,
        status: 'Pendente',
        dataCriacao: new Date().toISOString().split('T')[0]
      };
      saveRequestsToStorage([newRequest, ...requests], newRequest);
    }
    
    setActiveTab('my-requests');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save request as Draft (saved as Pendente)
  const handleSaveDraft = (formData: Omit<TravelRequest, 'id' | 'dataCriacao' | 'status'>) => {
    if (editingRequest) {
      // Modifying existing
      const updatedRequest: TravelRequest = {
        ...editingRequest,
        ...formData,
        status: 'Pendente' as const
      };
      const updatedList = requests.map(r => r.id === editingRequest.id ? updatedRequest : r);
      saveRequestsToStorage(updatedList, updatedRequest);
      setEditingRequest(null);
    } else {
      // Adding new
      const highestIdNum = requests.reduce((max, r) => {
        const match = r.id.match(/TR-2026-(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      
      const nextIdNum = highestIdNum + 1;
      const newRequest: TravelRequest = {
        ...formData,
        id: `TR-2026-${String(nextIdNum).padStart(3, '0')}`,
        status: 'Pendente',
        dataCriacao: new Date().toISOString().split('T')[0]
      };
      saveRequestsToStorage([newRequest, ...requests], newRequest);
    }

    setActiveTab('my-requests');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Duplicate traveling requests
  const handleDuplicateRequest = (request: TravelRequest) => {
    const highestIdNum = requests.reduce((max, r) => {
      const match = r.id.match(/TR-2026-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    
    const nextIdNum = highestIdNum + 1;
    const duplicated: TravelRequest = {
      ...request,
      id: `TR-2026-${String(nextIdNum).padStart(3, '0')}`,
      status: 'Pendente',
      sei: '',
      dataCriacao: new Date().toISOString().split('T')[0]
    };

    saveRequestsToStorage([duplicated, ...requests], duplicated);
    setEditingRequest(duplicated);
    setActiveTab('new-request');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Request
  const handleDeleteRequest = async (id: string) => {
    const updated = requests.filter(r => r.id !== id);
    setRequests(updated);
    localStorage.setItem('stm_travel_requests', JSON.stringify(updated));

    try {
      await fetch(`/api/requests/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('Error synchronizing request deletion with Supabase database:', e);
    }
  };

  const handleEditDraft = (request: TravelRequest) => {
    setEditingRequest(request);
    setActiveTab('new-request');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNewClick = () => {
    setEditingRequest(null);
    setActiveTab('new-request');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setEditingRequest(null);
    setActiveTab('my-requests');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-20 md:pb-0">
      
      {/* Upper Brand Header (Desktop) */}
      <header className="bg-[#041627] text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded">
              <PlusCircle className="text-[#b7c8de] h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-slate-300 font-extrabold block">
                Poder Judiciário Militar
              </span>
              <h1 className="text-sm font-bold text-white tracking-snug">
                STM • Solicitação de Viagem
              </h1>
            </div>
          </div>

          {/* Desktop Navigation Link row */}
          <nav className="hidden md:flex gap-1">
            <button
              onClick={handleCreateNewClick}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer
                ${activeTab === 'new-request' ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}
              `}
            >
              Novo Registro
            </button>
            <button
              onClick={() => { setEditingRequest(null); setActiveTab('my-requests'); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer
                ${activeTab === 'my-requests' ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}
              `}
            >
              Diárias Cadastradas
            </button>
          </nav>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView 
            requests={requests}
            onNavigateToNewRequest={handleCreateNewClick}
            onViewRequest={(req) => setViewingRequest(req)}
          />
        )}

        {activeTab === 'new-request' && (
          <NewTravelForm 
            userProfile={userProfile}
            requestToEdit={editingRequest}
            requests={requests}
            onSubmit={handleSubmitRequest}
            onSaveDraft={handleSaveDraft}
            onCancel={handleCancelForm}
          />
        )}

        {activeTab === 'my-requests' && (
          <MyRequestsView 
            requests={requests}
            onViewDetails={(req) => setViewingRequest(req)}
            onEditDraft={handleEditDraft}
            onDuplicate={handleDuplicateRequest}
            onDelete={handleDeleteRequest}
            onClearAll={() => saveRequestsToStorage([])}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView 
            profile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Persistent Bottom Bar (matches mobile image view tab-for-tab!) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f7f9ff] border-t border-slate-200 py-1.5 px-4 flex justify-around items-center z-40 md:hidden shadow-lg">
        {/* Tab 1 - Novo Registro (Active state is heavily isolated with a dark accent block in the screenshot!) */}
        <button 
          onClick={handleCreateNewClick}
          className={`flex flex-col items-center justify-center py-1 px-4 transition-colors cursor-pointer rounded
            ${activeTab === 'new-request' 
              ? 'bg-[#041627] text-white font-bold p-2 -translate-y-2 shadow' 
              : 'text-slate-500 hover:text-primary'
            }
          `}
        >
          <PlusCircle size={20} className={activeTab === 'new-request' ? 'text-white stroke-[2.5px]' : ''} />
          <span className={`text-[10px] mt-0.5 tracking-tighter ${activeTab === 'new-request' ? 'text-white' : ''}`}>
            Novo Registro
          </span>
        </button>

        {/* Tab 2 - Diárias Cadastradas */}
        <button
          onClick={() => { setEditingRequest(null); setActiveTab('my-requests'); }}
          className={`flex flex-col items-center justify-center py-1 px-3 text-secondary transition-colors cursor-pointer
            ${activeTab === 'my-requests' ? 'text-primary font-bold' : 'text-slate-500 hover:text-primary'}
          `}
        >
          <Plane size={20} className={activeTab === 'my-requests' ? 'rotate-45 stroke-[2.5px]' : 'rotate-45'} />
          <span className="text-[10px] mt-0.5 tracking-tighter">Diárias Cadastradas</span>
        </button>
      </div>

      {/* Global Process Detail Viewer Modal */}
      {viewingRequest && (
        <RequestDetailsModal 
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
          onDuplicate={handleDuplicateRequest}
          onEdit={handleEditDraft}
          onDelete={handleDeleteRequest}
        />
      )}
    </div>
  );
}
