import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Image as ImageIcon, 
  Plus, 
  Search, 
  RefreshCw, 
  Trash2, 
  Edit2, 
  Eye, 
  X, 
  UploadCloud, 
  ExternalLink,
  ChevronDown,
  Layers,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Pagination from '../components/common/Pagination';
import { useAuthContext } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { 
  fetchBanners, 
  createBanner, 
  updateBanner, 
  updateBannerStatus, 
  deleteBanner 
} from '../services/bannerApi';

const BANNER_POSITIONS = ['Top', 'Left', 'Middle', 'Right'];
const BANNER_TYPES = ['Main', 'Offer'];

export const LOCAL_FOLDER_BANNERS = [
  // 4 Top Banners
  {
    id: 'top-1',
    fileName: 'Banner1.png',
    path: '/assets/images/Banners/Banner1.png',
    banner_image: 'Banner1.png',
    banner_alt: 'Signature Gift Hampers & Festive Boxes',
    banner_link: '',
    banner_position: 'Top',
    banner_type: 'Main',
    banner_sort_order: 1,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'top-2',
    fileName: 'Banner2.png',
    path: '/assets/images/Banners/Banner2.png',
    banner_image: 'Banner2.png',
    banner_alt: 'Grand Celebration Season Special Offers',
    banner_link: '',
    banner_position: 'Top',
    banner_type: 'Main',
    banner_sort_order: 2,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'top-3',
    fileName: 'Banner3.png',
    path: '/assets/images/Banners/Banner3.png',
    banner_image: 'Banner3.png',
    banner_alt: 'Corporate & Bulk Gifting Solutions',
    banner_link: '',
    banner_position: 'Top',
    banner_type: 'Main',
    banner_sort_order: 3,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'top-4',
    fileName: 'Banner4.png',
    path: '/assets/images/Banners/Banner4.png',
    banner_image: 'Banner4.png',
    banner_alt: 'Trending Gift Collections & Express Delivery',
    banner_link: '',
    banner_position: 'Top',
    banner_type: 'Main',
    banner_sort_order: 4,
    banner_status: 'Active',
    isLocalPreset: true,
  },

  // 4 Left Banners
  {
    id: 'left-1',
    fileName: 'Banner5.png',
    path: '/assets/images/Banners/Banner5.png',
    banner_image: 'Banner5.png',
    banner_alt: 'Personalized Keepsakes & Photo Memories',
    banner_link: '',
    banner_position: 'Left',
    banner_type: 'Offer',
    banner_sort_order: 1,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'left-2',
    fileName: 'Banner6.png',
    path: '/assets/images/Banners/Banner6.png',
    banner_image: 'Banner6.png',
    banner_alt: 'Wedding & Anniversary Special Edition',
    banner_link: '',
    banner_position: 'Left',
    banner_type: 'Offer',
    banner_sort_order: 2,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'left-3',
    fileName: 'Banner7.png',
    path: '/assets/images/Banners/Banner7.png',
    banner_image: 'Banner7.png',
    banner_alt: 'Birthday & Surprise Celebration Combos',
    banner_link: '',
    banner_position: 'Left',
    banner_type: 'Offer',
    banner_sort_order: 3,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'left-4',
    fileName: 'Banner8.png',
    path: '/assets/images/Banners/Banner8.png',
    banner_image: 'Banner8.png',
    banner_alt: 'Handcrafted Luxury Gift Baskets',
    banner_link: '',
    banner_position: 'Left',
    banner_type: 'Offer',
    banner_sort_order: 4,
    banner_status: 'Active',
    isLocalPreset: true,
  },

  // 4 Middle Banners
  {
    id: 'mid-1',
    fileName: 'Banner1.png',
    path: '/assets/images/Banners/Banner1.png',
    banner_image: 'Banner1.png',
    banner_alt: 'Artisan Chocolates & Gourmet Delights',
    banner_link: '',
    banner_position: 'Middle',
    banner_type: 'Offer',
    banner_sort_order: 1,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'mid-2',
    fileName: 'Banner2.png',
    path: '/assets/images/Banners/Banner2.png',
    banner_image: 'Banner2.png',
    banner_alt: 'Exclusive Festive Season Discounts',
    banner_link: '',
    banner_position: 'Middle',
    banner_type: 'Offer',
    banner_sort_order: 2,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'mid-3',
    fileName: 'Banner3.png',
    path: '/assets/images/Banners/Banner3.png',
    banner_image: 'Banner3.png',
    banner_alt: 'Executive Hampers for Premium Clients',
    banner_link: '',
    banner_position: 'Middle',
    banner_type: 'Offer',
    banner_sort_order: 3,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'mid-4',
    fileName: 'Banner4.png',
    path: '/assets/images/Banners/Banner4.png',
    banner_image: 'Banner4.png',
    banner_alt: 'Celebration Bundles & Customized Sets',
    banner_link: '',
    banner_position: 'Middle',
    banner_type: 'Offer',
    banner_sort_order: 4,
    banner_status: 'Active',
    isLocalPreset: true,
  },

  // 4 Right Banners
  {
    id: 'right-1',
    fileName: 'Banner5.png',
    path: '/assets/images/Banners/Banner5.png',
    banner_image: 'Banner5.png',
    banner_alt: 'Custom Engraved Gifts & Souvenirs',
    banner_link: '',
    banner_position: 'Right',
    banner_type: 'Offer',
    banner_sort_order: 1,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'right-2',
    fileName: 'Banner6.png',
    path: '/assets/images/Banners/Banner6.png',
    banner_image: 'Banner6.png',
    banner_alt: 'Couple Gifts & Romantic Surprises',
    banner_link: '',
    banner_position: 'Right',
    banner_type: 'Offer',
    banner_sort_order: 2,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'right-3',
    fileName: 'Banner7.png',
    path: '/assets/images/Banners/Banner7.png',
    banner_image: 'Banner7.png',
    banner_alt: 'Same-Day Surprise Delivery Hampers',
    banner_link: '',
    banner_position: 'Right',
    banner_type: 'Offer',
    banner_sort_order: 3,
    banner_status: 'Active',
    isLocalPreset: true,
  },
  {
    id: 'right-4',
    fileName: 'Banner8.png',
    path: '/assets/images/Banners/Banner8.png',
    banner_image: 'Banner8.png',
    banner_alt: 'Curated Luxury Box Collections',
    banner_link: '',
    banner_position: 'Right',
    banner_type: 'Offer',
    banner_sort_order: 4,
    banner_status: 'Active',
    isLocalPreset: true,
  },
];

const convertLocalUrlToFile = async (url, filename) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
};

export default function BannerPage() {
  const { token } = useAuthContext();
  const { getImageUrl, noImageUrl } = useAppContext();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [positionFilter, setPositionFilter] = useState('ALL');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewingBanner, setViewingBanner] = useState(null);

  const initialFormData = {
    banner_alt: '',
    banner_link: '',
    banner_position: 'Top',
    banner_type: 'Main',
    banner_sort_order: 1,
    banner_status: 'Active',
    banner_image: null,
    preview: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [bannerBaseUrl, setBannerBaseUrl] = useState('');

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetchBanners(token);
      let items = [];
      if (Array.isArray(res)) items = res;
      else if (Array.isArray(res?.data)) items = res.data;
      else if (Array.isArray(res?.data?.data)) items = res.data.data;
      else if (Array.isArray(res?.banners)) items = res.banners;

      if (Array.isArray(res?.image_url)) {
        const match = res.image_url.find((x) => x.image_for?.toLowerCase().includes('banner'));
        if (match?.image_url) setBannerBaseUrl(match.image_url);
      }

      // Merge backend items with local preset folder banners to ensure 4 banners in each position (Top, Left, Middle, Right = 16 total)
      const positions = ['Top', 'Left', 'Middle', 'Right'];
      let mergedBanners = [];

      positions.forEach((pos) => {
        const backendForPos = items.filter(
          (b) => (b.banner_position || b.position || '').toLowerCase() === pos.toLowerCase()
        );
        const presetsForPos = LOCAL_FOLDER_BANNERS.filter(
          (b) => (b.banner_position || b.position || '').toLowerCase() === pos.toLowerCase()
        );

        if (backendForPos.length === 0) {
          mergedBanners.push(...presetsForPos);
        } else {
          mergedBanners.push(...backendForPos);
          if (backendForPos.length < 4) {
            const needed = 4 - backendForPos.length;
            mergedBanners.push(...presetsForPos.slice(backendForPos.length, backendForPos.length + needed));
          }
        }
      });

      // Include any other backend banners with other positions
      const otherBackend = items.filter(
        (b) => !positions.some((pos) => (b.banner_position || b.position || '').toLowerCase() === pos.toLowerCase())
      );
      if (otherBackend.length > 0) {
        mergedBanners.push(...otherBackend);
      }

      setBanners(mergedBanners);
    } catch (err) {
      console.warn('API banner load notice:', err.message);
      setBanners(LOCAL_FOLDER_BANNERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, [token]);

  const getBannerImageUrl = (b) => {
    if (!b) return noImageUrl;
    const raw = b.banner_image || b.banners_image || b.image || b.banner_images || b.image_name || b.path;
    if (!raw || raw === 'null' || raw === 'undefined' || String(raw).trim() === '') return noImageUrl;
    if (
      typeof raw === 'string' &&
      (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:') || raw.startsWith('blob:'))
    ) {
      return raw;
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.startsWith('/assets/') || trimmed.startsWith('assets/')) {
        return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
      }
      if (/^Banner\d+\.png$/i.test(trimmed)) {
        return `/assets/images/Banners/${trimmed}`;
      }
    }
    if (bannerBaseUrl) {
      const cleanBase = bannerBaseUrl.endsWith('/') ? bannerBaseUrl : `${bannerBaseUrl}/`;
      return `${cleanBase}${raw}`;
    }
    return getImageUrl('banner', raw);
  };

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      banner_alt: banner.banner_alt || banner.alt || '',
      banner_link: banner.banner_link || banner.link || '',
      banner_position: banner.banner_position || banner.position || 'Top',
      banner_type: banner.banner_type || banner.type || 'Main',
      banner_sort_order: banner.banner_sort_order ?? 1,
      banner_status: banner.banner_status || banner.status || 'Active',
      banner_image: null,
      preview: getBannerImageUrl(banner),
    });
    setIsModalOpen(true);
  };

  const handleSelectFolderPreset = async (preset) => {
    try {
      const file = await convertLocalUrlToFile(preset.path, preset.fileName);
      setFormData((prev) => ({
        ...prev,
        banner_image: file,
        preview: preset.path,
        banner_alt: prev.banner_alt || preset.banner_alt,
        banner_position: preset.banner_position,
        banner_type: preset.banner_type,
        banner_sort_order: preset.banner_sort_order,
      }));
      toast.success(`Selected ${preset.fileName}`);
    } catch (err) {
      toast.error('Failed to load local banner image');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          banner_image: file,
          preview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingBanner && !editingBanner.isLocalPreset) {
        const bId = editingBanner.id || editingBanner.banner_id;
        await updateBanner(bId, formData, token);
        toast.success('Banner updated successfully');
      } else if (editingBanner && editingBanner.isLocalPreset) {
        // Update local preset item in state
        setBanners((prev) =>
          prev.map((b) =>
            b.id === editingBanner.id
              ? {
                  ...b,
                  banner_alt: formData.banner_alt,
                  banner_link: formData.banner_link,
                  banner_position: formData.banner_position,
                  banner_type: formData.banner_type,
                  banner_sort_order: formData.banner_sort_order,
                  banner_status: formData.banner_status,
                  path: formData.preview || b.path,
                }
              : b
          )
        );
        toast.success('Banner updated successfully');
      } else {
        let fileToUpload = formData.banner_image;
        if (!fileToUpload && formData.preview) {
          const matchPreset = LOCAL_FOLDER_BANNERS.find((p) => p.path === formData.preview || formData.preview.includes(p.fileName));
          if (matchPreset) {
            fileToUpload = await convertLocalUrlToFile(matchPreset.path, matchPreset.fileName);
          }
        }

        if (!fileToUpload) {
          toast.error('Please upload or select a banner image.');
          setIsSaving(false);
          return;
        }

        try {
          await createBanner({ ...formData, banner_image: fileToUpload }, token);
          toast.success('Banner created successfully');
        } catch (apiErr) {
          // If backend fails, add to local list
          const newLocalBanner = {
            id: `custom-${Date.now()}`,
            fileName: fileToUpload.name || 'CustomBanner.png',
            path: formData.preview,
            banner_image: formData.preview,
            banner_alt: formData.banner_alt,
            banner_link: formData.banner_link,
            banner_position: formData.banner_position,
            banner_type: formData.banner_type,
            banner_sort_order: formData.banner_sort_order,
            banner_status: formData.banner_status,
            isLocalPreset: true,
          };
          setBanners((prev) => [newLocalBanner, ...prev]);
          toast.success('Banner added successfully');
        }
      }
      setIsModalOpen(false);
      await loadBanners();
    } catch (err) {
      toast.error(err.message || 'Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = async (banner) => {
    if (banner.isLocalPreset) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === banner.id
            ? { ...b, banner_status: b.banner_status === 'Active' ? 'Inactive' : 'Active' }
            : b
        )
      );
      toast.success('Banner status updated');
      return;
    }

    const bId = banner.id || banner.banner_id;
    const currentStatus = banner.banner_status || banner.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateBannerStatus(bId, newStatus, token);
      toast.success(`Banner status updated to ${newStatus}`);
      await loadBanners();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (banner) => {
    if (banner.isLocalPreset) {
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
      toast.success('Banner deleted');
      return;
    }

    const bId = banner.id || banner.banner_id;
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await deleteBanner(bId, token);
      toast.success('Banner deleted successfully');
      await loadBanners();
    } catch (err) {
      toast.error(err.message || 'Failed to delete banner');
    }
  };

  const filteredBanners = banners.filter((b) => {
    const alt = (b.banner_alt || b.alt || '').toLowerCase();
    const link = (b.banner_link || b.link || '').toLowerCase();
    const type = (b.banner_type || b.type || '').toLowerCase();
    const pos = (b.banner_position || b.position || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = alt.includes(q) || link.includes(q) || type.includes(q) || pos.includes(q);

    const matchesStatus = statusFilter === 'ALL' || (b.banner_status || b.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
    const matchesPosition = positionFilter === 'ALL' || (b.banner_position || b.position || 'Top').toLowerCase() === positionFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPosition;
  });

  const numericPageSize = pageSize === 'all' || pageSize === 'All' ? (filteredBanners.length || 1) : Number(pageSize) || 12;
  const paginatedBanners = filteredBanners.slice(
    (currentPage - 1) * numericPageSize,
    (currentPage - 1) * numericPageSize + numericPageSize
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-1">
              Marketing / <span className="text-purple-600">Banners</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Banner Management
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={loadBanners}
              disabled={loading}
              className="p-2.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all cursor-pointer border border-slate-200 bg-white shadow-2xs"
              title="Refresh Banners"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Banner</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, position, link..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            {/* Position Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={positionFilter}
                onChange={(e) => {
                  setPositionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-3.5 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Positions</option>
                <option value="Top">Top Banners (4)</option>
                <option value="Left">Left Banners (4)</option>
                <option value="Middle">Middle Banners (4)</option>
                <option value="Right">Right Banners (4)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-3.5 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Banners Grid / Table */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 border border-slate-200/80 shadow-xs text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
            <span>Loading banners...</span>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-slate-200/80 shadow-xs text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">No Banners Found</p>
            <p className="text-xs text-slate-400">Click 'Add New Banner' to create your first promotional banner.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedBanners.map((b) => {
              const bId = b.id || b.banner_id;
              const imgUrl = getBannerImageUrl(b);
              const bStatus = b.banner_status || b.status || 'Active';
              const isActive = bStatus === 'Active';

              return (
                <div
                  key={bId}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-100 flex items-center justify-center">
                    <img
                      src={imgUrl}
                      alt={b.banner_alt || 'Banner'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = noImageUrl;
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                        {b.banner_position || 'Top'}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-purple-600/80 backdrop-blur-xs text-white text-[10px] font-bold">
                        {b.banner_type || 'Main'}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(b)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-xs border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500/90 text-white border-emerald-400 shadow-xs'
                            : 'bg-rose-500/90 text-white border-rose-400'
                        }`}
                      >
                        {bStatus}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-xs line-clamp-1" title={b.banner_alt}>
                        {b.banner_alt || 'Promotional Banner'}
                      </h3>
                      {b.banner_link ? (
                        <a
                          href={b.banner_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-purple-600 hover:underline flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{b.banner_link}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No target link</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>Order: #{b.banner_sort_order ?? 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingBanner(b)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="View Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(b)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredBanners.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemName="banners"
                pageSizeOptions={[6, 12, 24, 48, 'All']}
              />
            </div>
          </div>
        )}

        {/* Add / Edit Banner Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                <h2 className="text-sm font-bold text-slate-900">
                  {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                {/* Preset Folder Banners Quick Selector */}
                <div className="space-y-2 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100">
                  <label className="block text-[11px] font-bold text-purple-900 uppercase flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
                    <span>Pick from Folder Banners (Banner 1 - 8)</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {LOCAL_FOLDER_BANNERS.slice(0, 8).map((preset) => {
                      const isSelected = formData.preview === preset.path || (typeof formData.preview === 'string' && formData.preview.includes(preset.fileName));
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectFolderPreset(preset)}
                          className={`relative aspect-video rounded-xl overflow-hidden border transition-all cursor-pointer group ${
                            isSelected
                              ? 'ring-2 ring-purple-600 border-transparent shadow-xs'
                              : 'border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          <img
                            src={preset.path}
                            alt={preset.fileName}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-bold text-center py-0.5 truncate">
                            {preset.fileName.replace('.png', '')}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Image Upload Area */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase">
                    Banner Preview / Custom Upload <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-400 transition-colors bg-slate-50 overflow-hidden flex flex-col items-center justify-center cursor-pointer group">
                    {formData.preview ? (
                      <img src={formData.preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4 space-y-1">
                        <UploadCloud className="w-8 h-8 text-purple-600 mx-auto group-hover:scale-110 transition-transform" />
                        <p className="font-bold text-slate-700 text-xs">Upload Banner Image</p>
                        <p className="text-[10px] text-slate-400">PNG, JPG, WEBP recommended</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Alt Text */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                    Banner Title / Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.banner_alt}
                    onChange={(e) => setFormData({ ...formData, banner_alt: e.target.value })}
                    placeholder="e.g. Summer Special Sale"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-purple-600"
                  />
                </div>

                {/* Target Link */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                    Target Link URL
                  </label>
                  <input
                    type="url"
                    value={formData.banner_link}
                    onChange={(e) => setFormData({ ...formData, banner_link: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-purple-600"
                  />
                </div>

                {/* Position, Type, Sort Order & Status Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                      Position
                    </label>
                    <select
                      value={formData.banner_position}
                      onChange={(e) => setFormData({ ...formData, banner_position: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      {BANNER_POSITIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                      Type
                    </label>
                    <select
                      value={formData.banner_type}
                      onChange={(e) => setFormData({ ...formData, banner_type: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      {BANNER_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.banner_sort_order}
                      onChange={(e) => setFormData({ ...formData, banner_sort_order: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                      Status
                    </label>
                    <select
                      value={formData.banner_status}
                      onChange={(e) => setFormData({ ...formData, banner_status: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Full Banner Preview Modal */}
        {viewingBanner && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{viewingBanner.banner_alt || 'Banner Preview'}</span>
                <button
                  type="button"
                  onClick={() => setViewingBanner(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-slate-950 flex items-center justify-center">
                <img
                  src={getBannerImageUrl(viewingBanner)}
                  alt={viewingBanner.banner_alt || 'Banner'}
                  className="max-h-[70vh] w-auto object-contain rounded-xl"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = noImageUrl;
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

