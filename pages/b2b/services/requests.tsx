import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { servicesAPI, BookingListItem } from '../../../services/api/services.api';
// Temporarily alias BookingListItem as ServiceRequest to satisfy legacy types until full refactor
type ServiceRequest = BookingListItem;

import AdminLayout from '../../../components/AdminLayout';
import {
  FaSearch,
  FaCheck,
  FaTimes,
  FaFilter,
  FaWrench,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaCheckCircle,
  FaCamera,
  FaHourglassHalf,
  FaCreditCard,
  FaEdit,
  FaFileAlt,
  FaUserCircle,
  FaClipboardList,
  FaCheckDouble,
  FaFileInvoiceDollar,
  FaTruck,
  FaCar
} from 'react-icons/fa';
import QuotationModal from '../components/QuotationModal';
import PhotoGalleryModal from './PhotoGalleryModal';
import Swal from 'sweetalert2';
import RejectServiceRequestModal from './RejectServiceRequestModal';
import SubmitPhotosModal from './SubmitPhotosModal';
import CollectPaymentModal from './CollectPaymentModal';
import ServiceRequestDetailModal from './ServiceRequestDetailModal';
import QuotationBuilderModal from './QuotationBuilderModal';
import { useTranslations } from 'next-intl';

// Interface replaced by alias above

// Static data matching the Figma design with all different status combinations
// Static data removed in favor of API

export default function AdminRequests() {
  const router = useRouter();
  const t = useTranslations('servicesRequests');
  const company = useSelector((state: RootState) => state.auth.company);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [requests, setRequests] = useState<BookingListItem[]>([]);
  const [stats, setStats] = useState({
    total_bookings: 0,
    active_requests: 0,
    completed_requests: 0
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modal States
  const [selectedRequest, setSelectedRequest] = useState<BookingListItem | null>(null);

  const fetchRequests = async (silent = false) => {
    if (!company?.id) return;
    try {
      if (!silent) setLoading(true);
      const response = await servicesAPI.getBatchBookingsList(company.id);
      if (response.success && response.data && Array.isArray(response.data.bookings)) {
        setRequests(response.data.bookings);
        setStats({
          total_bookings: response.data.total_bookings || 0,
          active_requests: response.data.active_requests || 0,
          completed_requests: response.data.completed_requests || 0
        });
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // WebSocket Connection
  useEffect(() => {
    if (!company?.id || !accessToken) return;

    const wsUrl = `wss://api-dev.hakimauto.com/ops-tracking/v1/ws/company/${company.id}?token=${accessToken}`;
    console.log('🔌 Connecting to WebSocket:', wsUrl);

    let socket: WebSocket | null = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('✅ WebSocket Connected');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 WebSocket Message:', data);

        if (data.type === 'event' || data.role === 'customer') {
          console.log('🔄 Received generic event or customer update, refreshing data silently...');
          fetchRequests(true);
          return;
        }

        // Handle booking status updates
        // Expected payload structure: { booking_id: "...", status: "...", ... } or { data: { ... } }
        const update = data.data || data;

        if (update && (update.booking_id || update.id) && update.status) {
          const targetId = update.booking_id || update.id;

          setRequests(prevRequests => {
            const exists = prevRequests.find(r => r.booking_id === targetId);
            if (!exists) return prevRequests;

            if (exists.status === update.status) return prevRequests;

            return prevRequests.map(req =>
              req.booking_id === targetId ? { ...req, status: update.status } : req
            );
          });
        }
      } catch (error) {
        console.error('Error parsing WS message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('❌ WebSocket Error:', error);
    };

    socket.onclose = () => {
      console.log('⚠️ WebSocket Disconnected');
    };

    return () => {
      if (socket) {
        socket.close();
        socket = null;
      }
    };
  }, [company?.id, accessToken]);

  useEffect(() => {
    fetchRequests();
  }, [company?.id]);

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  // Typying adjust:


  // View Quotation State
  const [isViewQuotationModalOpen, setIsViewQuotationModalOpen] = useState(false);
  const [viewQuotationData, setViewQuotationData] = useState<Record<string, unknown> | null>(null);
  const [viewBodyCheckPhotos, setViewBodyCheckPhotos] = useState<Array<{ url: string, photo_id: string }>>([]);



  const handleRejectClick = (request: BookingListItem) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedRequest?.booking_id) return;

    try {
      setLoading(true);
      const response = await servicesAPI.rejectQuotations({
        booking_ids: [selectedRequest.booking_id],
        reason: reason
      });

      if (response.success || response.status === 'success') { // Handling potential API variances
        Swal.fire({
          title: t('alerts.rejected.title'),
          text: t('alerts.rejected.quotationSuccess'),
          icon: 'success',
          confirmButtonColor: '#eab308'
        });
        // Refresh list
        if (company?.id) {
          const res = await servicesAPI.getBatchBookingsList(company.id);
          if (res.success && res.data) {
            setRequests(res.data.bookings);
          }
        }
      } else {
        throw new Error(response.error || t('alerts.rejected.failed'));
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      Swal.fire(t('alerts.error.title'), t('alerts.rejected.quotationFailed'), 'error');
    } finally {
      setLoading(false);
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleApproveBodyCheck = async () => {
    const bookingId = String(viewQuotationData?.booking_id || selectedRequest?.booking_id || '');
    if (!bookingId) {
      Swal.fire(t('alerts.error.title'), t('alerts.error.noBookingContext'), 'error');
      return;
    }

    try {
      // Approve all photos
      const approvals = viewBodyCheckPhotos.map(p => ({
        action: 'approve',
        photo_id: p.photo_id
      }));

      if (approvals.length === 0) {
        Swal.fire(t('alerts.warning.title'), t('alerts.warning.noPhotosToApprove'), 'warning');
        return;
      }

      setLoading(true);
      const response = await servicesAPI.respondToBodyCheckPhotos(bookingId, { photo_approvals: approvals });

      if (response.success || response.status === 'success') {
        Swal.fire(t('alerts.success.title'), t('alerts.success.bodyCheckApproved'), 'success');
        setIsPhotoGalleryOpen(false);
        // Refresh
        if (company?.id) {
          const res = await servicesAPI.getBatchBookingsList(company.id);
          if (res.success && res.data) setRequests(res.data.bookings);
        }
      } else {
        throw new Error(response.error || t('alerts.error.approvePhotosFailed'));
      }
    } catch (error) {
      console.error('Error approving photos:', error);
      Swal.fire(t('alerts.error.title'), t('alerts.error.approvePhotosFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBodyCheck = async () => {
    const bookingId = String(viewQuotationData?.booking_id || selectedRequest?.booking_id || '');
    if (!bookingId) return;

    const { value: reason } = await Swal.fire({
      title: t('alerts.rejectBodyCheck.title'),
      input: 'text',
      inputLabel: t('alerts.rejectBodyCheck.reasonLabel'),
      inputPlaceholder: t('alerts.rejectBodyCheck.reasonPlaceholder'),
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return t('alerts.rejectBodyCheck.reasonRequired');
      }
    });

    if (reason) {
      try {
        // Reject all photos
        const refusals = viewBodyCheckPhotos.map(p => ({
          action: 'reject',
          photo_id: p.photo_id,
          rejection_reason: reason
        }));

        setLoading(true);
        const response = await servicesAPI.respondToBodyCheckPhotos(bookingId, { photo_approvals: refusals });

        if (response.success || response.status === 'success') {
        Swal.fire(t('alerts.rejected.title'), t('alerts.rejected.bodyCheckPhotos'), 'success');
          setIsPhotoGalleryOpen(false);
          // Refresh
          if (company?.id) {
            const res = await servicesAPI.getBatchBookingsList(company.id);
            if (res.success && res.data) setRequests(res.data.bookings);
          }
        } else {
        throw new Error(response.error || t('alerts.error.rejectPhotosFailed'));
        }
      } catch (error) {
        console.error('Error rejecting photos:', error);
      Swal.fire(t('alerts.error.title'), t('alerts.error.rejectPhotosFailed'), 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCustomerArrived = async (bookingId: string) => {
    try {
      Swal.fire({
        title: t('alerts.processing.title'),
        text: t('alerts.processing.notifying'),
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Assuming refreshData is a function that re-fetches the booking list
      const refreshData = async () => {
        if (company?.id) {
          const res = await servicesAPI.getBatchBookingsList(company.id);
          if (res.success && res.data) {
            setRequests(res.data.bookings);
          }
        }
      };

      const response = await servicesAPI.customerArrivedAtServiceCenter(bookingId);

      if (response.success) {
        await refreshData();
        Swal.fire(t('alerts.success.title'), t('alerts.success.serviceCenterNotified'), 'success');
      } else {
        throw new Error(response.error || t('alerts.error.notifyServiceCenterFailed'));
      }
    } catch (error: any) {
      console.error('Error notifying arrival:', error);
      Swal.fire({
        title: t('alerts.error.title'),
        text: error.message || t('alerts.error.notifyServiceCenterFailed'),
        icon: 'error',
        confirmButtonText: t('alerts.error.confirm')
      });
    }
  };

  const handleApproveQuotation = async () => {
    // aggregated approve logic
    const bookingId = String(viewQuotationData?.booking_id || selectedRequest?.booking_id || '');
    if (!bookingId || bookingId === 'undefined' || bookingId === 'null') {
      Swal.fire(t('alerts.error.title'), t('alerts.error.noBookingContext'), 'error');
      return;
    }

    try {
      // Show loading or confirm first? Figma doesn't explicitly say, but better UX to valid.
      // Doing direct call as per common admin patterns, or maybe a quick confirm. 
      // Proceeding with direct call + Loading indicator for speed/smoothness.

      const result = await Swal.fire({
        title: t('alerts.approveQuotation.title'),
        text: t('alerts.approveQuotation.text'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FCD34D',
        cancelButtonColor: '#d33',
        confirmButtonText: t('alerts.approveQuotation.confirm'),
        cancelButtonText: t('alerts.approveQuotation.cancel')
      });

      if (!result.isConfirmed) return;

      setIsViewQuotationModalOpen(false); // Close modal first or keep open? Close is better.
      setLoading(true);

      const response = await servicesAPI.approveQuotations({
        booking_ids: [String(bookingId)]
      });

      if (response.success || response.status === 'success') {
        Swal.fire({
          title: t('alerts.approved.title'),
          text: t('alerts.approved.quotationSuccess'),
          icon: 'success',
          confirmButtonColor: '#eab308'
        });
        // Refresh list
        if (company?.id) {
          const res = await servicesAPI.getBatchBookingsList(company.id);
          if (res.success && res.data) {
            setRequests(res.data.bookings);
          }
        }
      } else {
        throw new Error(response.error || t('alerts.approved.failed'));
      }

    } catch (error) {
      console.error('Error approving:', error);
      Swal.fire(t('alerts.error.title'), t('alerts.approved.quotationFailed'), 'error');
    } finally {
      setLoading(false);
      // Ensure modal is closed if not already
      setIsViewQuotationModalOpen(false);
      setViewQuotationData(null);
      setSelectedRequest(null);
    }
  };

  const handleViewQuotation = async (request: BookingListItem) => {
    try {
      setSelectedRequest(request); // Important for context
      // User requested to use GET /bookings/v1/quotations with booking_id
      const response = await servicesAPI.getQuotations({ booking_id: request.booking_id });

      if (response.success && response.data) {
        // API returns a list (pagination). We expect the first one since we filter by booking_id.
        // Adjusting data extraction based on likely response structure (e.g., data.quotations or just data list)
        // If data is array directly:
        const quotation = Array.isArray(response.data) ? response.data[0] :
          (response.data.quotations && Array.isArray(response.data.quotations) ? response.data.quotations[0] : response.data);

        if (quotation) {
          setViewQuotationData(quotation);
          setViewBodyCheckPhotos([]);

          // Check if we should fetch body check photos
          if (request.status === 'Awaiting Body Check Response' || request.status === 'Approve Body Check' || quotation.status === 'Awaiting Body Check Response') {
            try {
              const photoResponse = await servicesAPI.getServiceCenterBodyCheckPhotos(request.booking_id);
              console.log('BodyCheckPhotos API Response:', photoResponse);

              const photosData = Array.isArray(photoResponse.data) ? photoResponse.data : photoResponse.data?.photos;

              if (Array.isArray(photosData)) {
                const photos = photosData.map((p: any) => {
                  if (typeof p === 'string') return { url: p, photo_id: '' };
                  return {
                    url: p.url || p.signed_url || p.photo_url || p.image_url || p.file_url,
                    photo_id: p.photo_id || p.id
                  };
                });
                console.log('Parsed Photos:', photos);
                setViewBodyCheckPhotos(photos.filter((p: any) => p.url));
              } else {
                console.warn('Unknown photos structure:', photoResponse);
              }
            } catch (err) {
              console.error("Failed to fetch body check photos", err);
            }
          }

          setIsViewQuotationModalOpen(true);
        } else {
          Swal.fire(t('alerts.info.title'), t('alerts.info.noQuotation'), 'info');
        }
      } else {
        Swal.fire(t('alerts.error.title'), t('alerts.error.fetchQuotationDetails'), 'error');
      }
    } catch (e) {
      console.error(e);
      Swal.fire(t('alerts.error.title'), t('alerts.error.loadQuotation'), 'error');
    }
  };

  // ... (handleAcceptClick existing logic can remain or be refactored, but focusing on QuotationModal wiring below)

  // ... (keeping existing functions)

  // Skip to render part update



  const handleAcceptClick = (request: ServiceRequest) => {
    Swal.fire({
      title: t('alerts.acceptRequest.title'),
      text: t('alerts.acceptRequest.text', { id: request.booking_id }),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e', // green-500
      cancelButtonColor: '#ef4444', // red-500
      confirmButtonText: t('alerts.acceptRequest.confirm'),
      cancelButtonText: t('alerts.acceptRequest.cancel')
    }).then((result) => {
      if (result.isConfirmed) {
        // Here you would typically call an API to accept the request


        Swal.fire({
          title: t('alerts.accepted.title'),
          text: t('alerts.accepted.text', { id: request.booking_id }),
          icon: 'success',
          confirmButtonColor: '#eab308' // yellow-400
        });
      }
    });
  };

  // Submit Photos Modal State
  const [isSubmitPhotosModalOpen, setIsSubmitPhotosModalOpen] = useState(false);

  const handleSubmitPhotosClick = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsSubmitPhotosModalOpen(true);
  };

  const handleSubmitPhotosConfirm = (files: File[]) => {

    // Here you would typically upload files to API

    setIsSubmitPhotosModalOpen(false);
    setSelectedRequest(null);

    Swal.fire({
      title: t('alerts.success.title'),
      text: t('alerts.success.photosSubmitted', { count: files.length }),
      icon: 'success',
      confirmButtonColor: '#eab308'
    });
  };

  // Collect Payment Modal State
  const [isCollectPaymentModalOpen, setIsCollectPaymentModalOpen] = useState(false);

  const handleCollectPaymentClick = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsCollectPaymentModalOpen(true);
  };

  const handleCollectPaymentConfirm = () => {

    // Here you would typically call an API to record payment

    setIsCollectPaymentModalOpen(false);
    setSelectedRequest(null);

    Swal.fire({
      title: t('alerts.paymentRecorded.title'),
      text: t('alerts.paymentRecorded.text', { id: selectedRequest?.booking_id }),
      icon: 'success',
      confirmButtonColor: '#eab308'
    });
  };

  // Quotation Builder Modal State
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);

  const handleQuotationClick = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsQuotationModalOpen(true);
  };

  const handleQuotationSave = (_quotation: Record<string, unknown>) => {
    const requestId = selectedRequest?.booking_id;
    setIsQuotationModalOpen(false);
    setSelectedRequest(null);
    Swal.fire({
      title: t('alerts.draftSaved.title'),
      text: t('alerts.draftSaved.text', { id: requestId }),
      icon: 'success',
      confirmButtonColor: '#eab308'
    });
  };

  const handleQuotationSend = (_quotation: Record<string, unknown>) => {
    const requestId = selectedRequest?.booking_id;
    setIsQuotationModalOpen(false);
    setSelectedRequest(null);
    Swal.fire({
      title: t('alerts.quotationSent.title'),
      text: t('alerts.quotationSent.text', { id: requestId }),
      icon: 'success',
      confirmButtonColor: '#eab308'
    });
  };

  // Service Request Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Photo Gallery State
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [isPhotoGalleryLoading, setIsPhotoGalleryLoading] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);

  const handleViewBodyCheck = async (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsPhotoGalleryOpen(true);
    setIsPhotoGalleryLoading(true);
    setViewBodyCheckPhotos([]);

    try {
      const photoResponse = await servicesAPI.getServiceCenterBodyCheckPhotos(request.booking_id);
      const photosData = Array.isArray(photoResponse.data) ? photoResponse.data : photoResponse.data?.photos;

      if (Array.isArray(photosData)) {
        const photos = photosData.map((p: any) => {
          if (typeof p === 'string') return { url: p, photo_id: '' };
          return {
            url: p.url || p.signed_url || p.photo_url || p.image_url || p.file_url,
            photo_id: p.photo_id || p.id
          };
        });
        setViewBodyCheckPhotos(photos.filter((p: any) => p.url));
      } else {
        // Just empty if none found
      }
    } catch (error) {
      console.error('Error fetching body check photos:', error);
      Swal.fire(t('alerts.error.title'), t('alerts.error.fetchBodyCheckPhotos'), 'error');
    } finally {
      setIsPhotoGalleryLoading(false);
    }
  };

  // const handleViewDetails = (request: ServiceRequest) => {
  //   // Redirecting 'View Details' (FaEye) to 'View Quotation' as per user request
  //   handleViewQuotation(request);
  // };

  // Filter requests based on search and filters
  const filteredRequests = requests.filter(request => {
    const searchLower = searchTerm.toLowerCase();

    // Assuming vehicle is a string like "uuid year", we can just search the whole string
    const vehicleStr = request.vehicle || '';

    const matchesSearch =
      (request.reference_id || request.booking_id || '').toLowerCase().includes(searchLower) ||
      (request.plate_number || '').toLowerCase().includes(searchLower) ||
      vehicleStr.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (request.category || '').includes(categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Get status badge styling
  // Get status badge styling
  // Get status badge styling
  const getStatusBadge = (status: BookingListItem['status']) => {
    if (!status) return null;
    const s = status.toLowerCase();

    let config = { bg: 'bg-gray-100 text-gray-600', icon: <FaClock className="me-1.5" />, label: status };

    if (s.includes('quotation price') || s.includes('pending price')) {
      config.bg = 'bg-yellow-50 text-yellow-700 border border-yellow-100';
      config.icon = <FaClock className="w-3 h-3 me-2" />;
    } else if (s.includes('approve quotation')) {
      config.bg = 'bg-blue-50 text-blue-700 border border-blue-100';
      config.icon = <FaFileInvoiceDollar className="w-3 h-3 me-2" />;
    } else if (s.includes('technician assignment') || s.includes('pending technician')) {
      config.bg = 'bg-purple-50 text-purple-700 border border-purple-100';
      config.icon = <FaUserCircle className="w-3 h-3 me-2" />;
    } else if (s.includes('technician assigned')) {
      config.bg = 'bg-blue-50 text-blue-700 border border-blue-100';
      config.icon = <FaCheck className="w-3 h-3 me-2" />;
    } else if (s.includes('driver will start') || s.includes('driver is on')) {
      config.bg = 'bg-cyan-50 text-cyan-700 border border-cyan-100';
      config.icon = <FaTruck className="w-3 h-3 me-2" />;
    } else if (s.includes('driver arrived') || s.includes('body checking')) {
      config.bg = 'bg-purple-50 text-purple-700 border border-purple-100';
      config.icon = <FaCamera className="w-3 h-3 me-2" />;
    } else if (s.includes('approve body check')) {
      config.bg = 'bg-orange-50 text-orange-700 border border-orange-100';
      config.icon = <FaClipboardList className="w-3 h-3 me-2" />;
    } else if (s.includes('body check report approved')) {
      config.bg = 'bg-green-50 text-green-700 border border-green-100';
      config.icon = <FaCheckDouble className="w-3 h-3 me-2" />;
    } else if (s.includes('serviced') || s.includes('fixing') || s.includes('start-service')) {
      config.bg = 'bg-indigo-50 text-indigo-700 border border-indigo-100';
      config.icon = <FaWrench className="w-3 h-3 me-2" />;
    } else if (s.includes('complete payment') || s.includes('payment')) {
      config.bg = 'bg-pink-50 text-pink-700 border border-pink-100';
      config.icon = <FaCreditCard className="w-3 h-3 me-2" />;
    } else if (s.includes('car receiving') || s.includes('receiving')) {
      config.bg = 'bg-teal-50 text-teal-700 border border-teal-100';
      config.icon = <FaCar className="w-3 h-3 me-2" />;
    } else if (s.includes('car delivered') || s.includes('completed')) {
      config.bg = 'bg-green-100 text-green-800 border border-green-200';
      config.icon = <FaCheckCircle className="w-3 h-3 me-2" />;
    }

    return { ...config, label: status };
  };

  // Get action buttons based on status
  const getActionButtons = (request: any) => {
    if (request.status === 'Pending Quotation') {
      return (
        <span className="text-sm font-medium text-gray-400 italic">
          {t('actions.waitingQuotation')}
        </span>
      );
    }

    if (request.status === 'Drive to Service Location') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCustomerArrived(request.booking_id);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <FaCheckCircle />
            {t('actions.arrivedAtServiceCenter')}
          </button>
          <button
            onClick={() => handleViewQuotation(request)}
            className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title={t('actions.viewQuotation')}
          >
            <FaFileInvoiceDollar className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (request.status === 'Approve Estimated Price' || request.status === 'Approve Quotation Price') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewQuotation(request)}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <FaFileInvoiceDollar />
            {t('actions.viewEstimatedPrice')}
          </button>
          <button
            onClick={() => handleViewQuotation(request)}
            className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title={t('actions.viewQuotation')}
          >
            <FaFileInvoiceDollar className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (request.status === 'Awaiting Body Check Response' || request.status === 'Approve Body Check' || request.status === 'Approve Body Check Report') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewBodyCheck(request);
            }}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <FaCamera />
            {t('actions.viewBodyCheck')}
          </button>
          <button
            onClick={() => handleViewQuotation(request)}
            className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title={t('actions.viewQuotation')}
          >
            <FaFileInvoiceDollar className="w-4 h-4" />
          </button>
        </div>
      );
    }

    switch (request.status) {
      case 'assigned':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAcceptClick(request)}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaCheck className="w-3 h-3" />
            {t('actions.accept')}
            </button>
            <button
              onClick={() => handleRejectClick(request)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaTimes className="w-3 h-3" />
            {t('actions.reject')}
            </button>
            <button
              onClick={() => handleViewQuotation(request)}
              className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title={t('actions.viewQuotation')}
            >
              <FaFileInvoiceDollar className="w-4 h-4" />
            </button>
          </div>
        );
      case 'accepted':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuotationClick(request)}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <FaFileAlt className="w-3 h-3" />
            {t('actions.submitQuotation')}
            </button>
            <button
              onClick={() => handleViewQuotation(request)}
              className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title={t('actions.viewQuotation')}
            >
              <FaFileInvoiceDollar className="w-4 h-4" />
            </button>

          </div>
        );
      case 'body_checking':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmitPhotosClick(request)}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <FaCamera className="w-3 h-3" />
            {t('actions.submitPhotos')}
            </button>
            <button
              onClick={() => handleViewQuotation(request)}
              className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title={t('actions.viewQuotation')}
            >
              <FaFileInvoiceDollar className="w-4 h-4" />
            </button>

          </div>
        );
      case 'awaiting_approval':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuotationClick(request)}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <FaEdit className="w-3 h-3" />
            {t('actions.editQuotation')}
            </button>
            <button
              onClick={() => handleViewQuotation(request)}
              className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title={t('actions.viewQuotation')}
            >
              <FaFileInvoiceDollar className="w-4 h-4" />
            </button>

          </div>
        );
      case 'fixing':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuotationClick(request)}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <FaEdit className="w-3 h-3" />
            {t('actions.editQuotation')}
            </button>
            <button
              onClick={() => handleViewQuotation(request)}
              className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title={t('actions.viewQuotation')}
            >
              <FaFileInvoiceDollar className="w-4 h-4" />
            </button>

          </div>
        );
      case 'pending_payment':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCollectPaymentClick(request)}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              <span className="text-xs">$</span>
            {t('actions.collectPayment')}
            </button>
            <button
              onClick={() => handleViewQuotation(request)}
              className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title={t('actions.viewQuotation')}
            >
              <FaFileInvoiceDollar className="w-4 h-4" />
            </button>

          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewQuotation(request)}
              className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title={t('actions.viewQuotation')}
            >
              <FaFileInvoiceDollar className="w-4 h-4" />
            </button>

          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewQuotation(request)}
              className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title={t('actions.viewQuotation')}
            >
              <FaFileInvoiceDollar className="w-4 h-4" />
            </button>

          </div>
        );
    }
  };

  const handlePhotoAction = async (action: 'approve_all' | 'reject_all') => {
    const bookingId = String(viewQuotationData?.booking_id || selectedRequest?.booking_id || '');
    if (!bookingId || bookingId === 'undefined' || bookingId === 'null') return;

    const confirmTitle = action === 'approve_all' ? t('alerts.photoReview.approveTitle') : t('alerts.photoReview.rejectTitle');
    const confirmText = action === 'approve_all'
      ? t('alerts.photoReview.approveText')
      : t('alerts.photoReview.rejectText');

    const result = await Swal.fire({
      title: confirmTitle,
      text: confirmText,
      icon: action === 'approve_all' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'approve_all' ? '#22c55e' : '#ef4444',
      confirmButtonText: action === 'approve_all' ? t('alerts.photoReview.approveConfirm') : t('alerts.photoReview.rejectConfirm')
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const response = await servicesAPI.reviewBodyCheckPhotos({
        booking_ids: [String(bookingId)],
        action: action
      });

      if (response.success || response.status === 'success') {
        Swal.fire({
          title: t('alerts.success.title'),
          text: action === 'approve_all' ? t('alerts.photoReview.approved') : t('alerts.photoReview.rejected'),
          icon: 'success',
          confirmButtonColor: '#eab308'
        });
        setIsPhotoGalleryOpen(false);
        if (company?.id) {
          const res = await servicesAPI.getBatchBookingsList(company.id);
          if (res.success && res.data) {
            setRequests(res.data.bookings);
          }
        }
      } else {
        throw new Error(response.error || t('alerts.photoReview.failed'));
      }
    } catch (error) {
      console.error('Error reviewing photos:', error);
      Swal.fire(t('alerts.error.title'), t('alerts.photoReview.failed'), 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <AdminLayout
      title={t('title')}
      subtitle=""

      headerActions={
        <button
          onClick={() => router.push('/b2b/services/create')}
          className="flex items-center gap-2 px-4 py-2 bg-[#FCD34D] rounded-lg text-sm font-bold text-gray-900 hover:bg-[#FBBF24] shadow-sm"
        >
          <FaWrench className="text-gray-900 text-xs" /> {t('actions.requestService')}
        </button>
      }
    >
      <div className="p-6 bg-gray-50 min-h-screen">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Requests */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">{t('stats.totalRequests')}</p>
              <h3 className="text-4xl font-black text-gray-900 mb-2">{stats.total_bookings}</h3>
            </div>
            <div className="w-12 h-12 bg-[#FCD34D] rounded-xl flex items-center justify-center text-gray-900 shadow-sm">
              <FaClipboardList className="text-xl" />
            </div>
          </div>

          {/* Active Requests */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">{t('stats.activeServices')}</p>
              <h3 className="text-4xl font-black text-gray-900 mb-2">{stats.active_requests}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
              <FaWrench className="text-xl" />
            </div>
          </div>

          {/* Completed Requests */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">{t('stats.completed')}</p>
              <h3 className="text-4xl font-black text-gray-900 mb-2">{stats.completed_requests}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shadow-sm">
              <FaCheckDouble className="text-xl" />
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FaSearch className="absolute start-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('filters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full ps-11 pe-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none min-w-[160px] cursor-pointer"
            >
              <option value="all">{t('filters.allStatuses')}</option>
              <option value="assigned">{t('filters.assigned')}</option>
              <option value="accepted">{t('filters.accepted')}</option>
              <option value="body_checking">{t('filters.bodyChecking')}</option>
              <option value="awaiting_approval">{t('filters.awaitingApproval')}</option>
              <option value="fixing">{t('filters.fixing')}</option>
              <option value="pending_payment">{t('filters.pendingPayment')}</option>
              <option value="completed">{t('filters.completed')}</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none min-w-[160px] cursor-pointer"
            >
              <option value="all">{t('filters.allCategories')}</option>
              <option value="Brake Service">Brake Service</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Body Work">Body Work</option>
              <option value="Engine Repair">Engine Repair</option>
              <option value="Car Inspection">Car Inspection</option>
            </select>

            {/* Filter Button */}
            <button className="p-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              <FaFilter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('table.bookingId')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('table.customer')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('table.vehicle')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('table.service')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('table.status')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('table.scheduled')}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('table.payment')}
                  </th>
                  <th className="px-6 py-4 text-end text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin h-8 w-8 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      {t('table.empty')}
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((request) => {
                    const statusBadge = getStatusBadge(request.status) || { bg: 'bg-gray-100', text: 'text-gray-700', icon: null, label: request.status };
                    return (
                      <tr
                        key={request.booking_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Booking ID */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {request.reference_id || request.booking_id.substring(0, 8)}
                          </span>
                        </td>

                        {/* Customer - Not present in API, using placeholder */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                              <FaUserCircle className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                -
                              </div>
                              <div className="text-xs text-gray-500">
                                -
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vehicle */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.vehicle}
                            </div>
                            <div className="text-xs text-gray-400">
                              {t('table.plateLabel')} {request.plate_number}
                            </div>
                          </div>
                        </td>

                        {/* Service */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.category}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.service_type}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.bg}`}>
                            {statusBadge.icon}
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Scheduled */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(request.scheduled_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(request.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>

                        {/* Payment/Cost */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {/* Check if service_cost is a number or numeric string */}
                            {!isNaN(Number(request.service_cost)) && Number(request.service_cost) > 0
                              ? `$${Number(request.service_cost).toFixed(2)}`
                              : request.service_cost}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            {/* Casting as any for now since getActionButtons expects ServiceRequest but we have BookingListItem */}
                            {getActionButtons(request)}
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {t('pagination.showing', {
                start: filteredRequests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0,
                end: Math.min(currentPage * itemsPerPage, filteredRequests.length),
                total: filteredRequests.length
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft className="w-3 h-3 rtl:rotate-180" />
              </button>

              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                    ? 'bg-yellow-400 text-gray-900'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight className="w-3 h-3 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <PhotoGalleryModal
        isOpen={isPhotoGalleryOpen}
        onClose={() => setIsPhotoGalleryOpen(false)}
        photos={viewBodyCheckPhotos.map(p => p.url)}
        title={t('modals.bodyCheckTitle', { vehicle: selectedRequest?.vehicle || t('modals.vehicleFallback') })}
        onApprove={handleApproveBodyCheck}
        onReject={handleRejectBodyCheck}
      />

      {/* Rejection Modal */}
      <RejectServiceRequestModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
      />

      {/* Submit Photos Modal */}
      <SubmitPhotosModal
        isOpen={isSubmitPhotosModalOpen}
        onClose={() => setIsSubmitPhotosModalOpen(false)}
        onSubmit={handleSubmitPhotosConfirm}
      />

      {/* Collect Payment Modal */}
      {selectedRequest && (
        <CollectPaymentModal
          isOpen={isCollectPaymentModalOpen}
          onClose={() => setIsCollectPaymentModalOpen(false)}
          onConfirm={handleCollectPaymentConfirm}
          request={selectedRequest as BookingListItem & { [key: string]: unknown }}
        />
      )}

      {/* Quotation Builder Modal */}
      {selectedRequest && (
        <QuotationBuilderModal
          isOpen={isQuotationModalOpen}
          onClose={() => setIsQuotationModalOpen(false)}
          serviceRequest={selectedRequest}
          onSave={handleQuotationSave}
          onSend={handleQuotationSend}
        />
      )}

      {/* Service Request Detail Modal */}
      {selectedRequest && (
        <ServiceRequestDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          serviceRequest={selectedRequest}
        />
      )}

      {/* View Quotation Modal */}
      {(() => {
        const canApprove = (selectedRequest && (selectedRequest.status === 'Approve Quotation Price' || selectedRequest.status === 'Approve Estimated Price' || selectedRequest.status === 'sent_to_customer'))
          || (viewQuotationData?.status === 'sent_to_customer');

        const isBodyCheckReview =
          (selectedRequest?.status === 'Awaiting Body Check Response' || selectedRequest?.status === 'Approve Body Check' || (selectedRequest?.status || '').includes('Body Check')) ||
          (viewQuotationData?.status === 'Awaiting Body Check Response' || viewQuotationData?.status === 'Approve Body Check');

        return (
          <QuotationModal
            isOpen={isViewQuotationModalOpen}
            onClose={() => setIsViewQuotationModalOpen(false)}
            quotationData={viewQuotationData ? {
              ...viewQuotationData,
              status: (canApprove ? 'sent_to_customer' : (isBodyCheckReview ? 'approved_by_customer' : viewQuotationData.status)) as string // Force status for UI if needed? Or just rely on props
            } : undefined}
            onAccept={isBodyCheckReview ? handleApproveBodyCheck : (canApprove ? handleApproveQuotation : undefined)}
            onPayLater={undefined}
            onReject={isBodyCheckReview ? handleRejectBodyCheck : (canApprove ? () => {
              setIsViewQuotationModalOpen(false);
              setIsRejectModalOpen(true);
            } : undefined)}
            acceptLabel={isBodyCheckReview ? t('actions.approvePhotos') : (canApprove ? t('actions.approveQuotation') : undefined)}
            rejectLabel={isBodyCheckReview ? t('actions.rejectPhotos') : (canApprove ? t('actions.rejectQuotation') : undefined)}
          />
        );
      })()}



      {/* Photo Gallery Modal */}
      <PhotoGalleryModal
        isOpen={isPhotoGalleryOpen}
        onClose={() => setIsPhotoGalleryOpen(false)}
        photos={viewBodyCheckPhotos.map(p => p.url)}
        title={t('modals.bodyCheckTitle', { vehicle: selectedRequest?.vehicle || t('modals.vehicleFallback') })}
        onApprove={handleApproveBodyCheck}
        onReject={handleRejectBodyCheck}
        isLoading={isPhotoGalleryLoading}
      />
    </AdminLayout>
  );
}