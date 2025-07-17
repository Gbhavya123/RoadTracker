import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Filter,
  Eye,
  MessageSquare,
  Truck,
  FileImage,
  Upload,
  X,
  CloudSun,
  Map,
  MapPinIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { getSocket } from '@/services/socket';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { WiDaySunny, WiRain, WiThunderstorm, WiSnow, WiCloudy, WiStrongWind } from 'react-icons/wi';
import { Dialog } from '@headlessui/react';

interface AdminReport {
  _id: string;
  type: string;
  severity: string;
  status: string;
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  description: string;
  reporter: {
    name: string;
    email: string;
  };
  createdAt: string;
  contractor?: {
    name: string;
  };
  upvotes: Array<{ user: string }>;
  images?: Array<{
    url: string;
    publicId: string;
  }>;
  adminNotes?: Array<{
    note: string;
    admin: string;
    createdAt: string;
  }>;
  weather?: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    condition: string;
    description: string;
    icon: string;
    windSpeed: number;
    timestamp: number;
    cityName: string;
  };
  weatherError?: string;
  emailNotificationLog?: Array<{
    timestamp: string;
    type: string;
    status: string;
    message?: string;
  }>;
}

interface AIStats {
  totalAnalyses: number;
  accuracyRate: number;
  averageConfidence: number;
  mostCommonIssues: string[];
  processingTime: {
    average: number;
    min: number;
    max: number;
  };
}

const AdminDashboard = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [viewingReport, setViewingReport] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiStats, setAiStats] = useState<AIStats | null>(null);
  const [modalStatus, setModalStatus] = useState<string>('');
  const [modalContractor, setModalContractor] = useState<string>('');
  const [modalNotes, setModalNotes] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, role: authRole } = useAuth();
  // Add state for weather modal
  const [weatherModal, setWeatherModal] = useState<{ open: boolean, city: string, weather: any } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const weatherIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch live weather for a city
  const fetchLiveWeather = async (city: string) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const response = await api.get(`/weather/live?city=${encodeURIComponent(city)}`);
      setWeatherModal((prev) => prev ? { ...prev, weather: response.data.data } : prev);
    } catch (err) {
      setWeatherError('Failed to fetch weather data.');
    } finally {
      setWeatherLoading(false);
    }
  };

  // When modal is open, poll weather every 30s
  useEffect(() => {
    if (weatherModal?.open && weatherModal.city) {
      fetchLiveWeather(weatherModal.city);
      weatherIntervalRef.current = setInterval(() => fetchLiveWeather(weatherModal.city), 30000);
      return () => {
        if (weatherIntervalRef.current) clearInterval(weatherIntervalRef.current);
      };
    }
    if (weatherIntervalRef.current) clearInterval(weatherIntervalRef.current);
  }, [weatherModal?.open, weatherModal?.city]);

  const getWeatherIcon = (condition: string) => {
    if (!condition) return <WiCloudy size={48} className="text-blue-400" />;
    const c = condition.toLowerCase();
    if (c.includes('rain')) return <WiRain size={48} className="text-blue-400 animate-bounce" />;
    if (c.includes('storm')) return <WiThunderstorm size={48} className="text-purple-600 animate-pulse" />;
    if (c.includes('snow')) return <WiSnow size={48} className="text-blue-200 animate-bounce" />;
    if (c.includes('wind')) return <WiStrongWind size={48} className="text-gray-400 animate-pulse" />;
    if (c.includes('clear') || c.includes('sun')) return <WiDaySunny size={48} className="text-yellow-400 animate-pulse" />;
    return <WiCloudy size={48} className="text-blue-400" />;
  };

  // Remove emailLogs state and related logic

  // Check if user is admin
  useEffect(() => {
    if (user && authRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      // Redirect to home page
      window.location.href = '/';
      return;
    }
  }, [user, authRole, toast]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching admin data...');
        
        const [reportsResponse, aiStatsResponse] = await Promise.all([
          api.get('/admin/reports'),
          api.get('/reports/ai-stats')
        ]);
        
        console.log('📊 Reports response:', reportsResponse.data);
        console.log('🤖 AI Stats response:', aiStatsResponse.data);
        
        // Ensure we always set an array for complaints
        const reportsData = reportsResponse.data?.data?.reports || reportsResponse.data?.data;
        setComplaints(Array.isArray(reportsData) ? reportsData : []);
        
        // Set AI stats if available
        const aiStatsData = aiStatsResponse.data?.data;
        setAiStats(aiStatsData || null);
        
        console.log('✅ Admin data loaded successfully');
        
      } catch (error) {
        console.error('❌ Error fetching admin data:', error);
        // Set empty array on error to prevent filter issues
        setComplaints([]);
        setAiStats(null);
        toast({
          title: "Error",
          description: "Failed to load reports data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin' && authRole === 'admin') {
      fetchAdminData();
      // Add real-time auto-refresh every 1 minute
      const interval = setInterval(() => {
        fetchAdminData();
      }, 60000); // 60,000 ms = 1 minute
      return () => clearInterval(interval);
    }
  }, [user, authRole, toast]);

  useEffect(() => {
    const socket = getSocket();
    
    console.log('🔌 Connecting to websocket...');
    
    // Join admin room
    socket.emit('join-admin');
    console.log('👑 Joined admin room');
    
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
    
    socket.on('report:new', async (report) => {
      console.log('📝 New report received:', report);
      // Fetch the full report with weather data
      try {
        const response = await api.get(`/api/reports/${report._id}`);
        const fullReport = response.data.data;
        setComplaints((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [fullReport, ...prevArray];
        });
      } catch (error) {
        console.error('Error fetching full report for new report:', error);
        // Fallback to adding the basic report if fetching fails
        setComplaints((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [report, ...prevArray];
        });
      }
    });
    
    socket.on('report:status', async (updatedReport) => {
      console.log('📊 Report status update received:', updatedReport);
      // Fetch the full report with updated weather data
      try {
        const response = await api.get(`/api/reports/${updatedReport._id}`);
        const fullUpdatedReport = response.data.data;
        setComplaints((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return prevArray.map(r => r._id === fullUpdatedReport._id ? fullUpdatedReport : r);
        });
      } catch (error) {
        console.error('Error fetching full report for status update:', error);
        // Fallback to updating with basic report if fetching fails
        setComplaints((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return prevArray.map(r => r._id === updatedReport._id ? updatedReport : r);
        });
      }
    });

    socket.on('status:update', (data) => {
      console.log('🔄 Status update received:', data);
      setComplaints((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(r => 
          r._id === data.reportId 
            ? { ...r, status: data.status }
            : r
        );
      });
    });

    socket.on('contractor:assign', (data) => {
      console.log('👷 Contractor assignment received:', data);
      setComplaints((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(r => 
          r._id === data.reportId 
            ? { ...r, contractor: data.contractor }
            : r
        );
      });
    });
    
    return () => {
      console.log('🔌 Cleaning up socket listeners');
      socket.off('report:new');
      socket.off('report:status');
      socket.off('status:update');
      socket.off('contractor:assign');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // Ensure complaints is always an array
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  
  const filteredComplaints = safeComplaints.filter((complaint: AdminReport) => {
    if (selectedStatus !== 'all' && complaint.status !== selectedStatus) return false;
    if (selectedSeverity !== 'all' && complaint.severity !== selectedSeverity) return false;
    return true;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Admin Dashboard...</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (user && authRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You don't have permission to access the admin dashboard. Only administrators can view this page.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Show not authenticated message
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please sign in as an administrator to access this dashboard.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
    try {
      console.log('🔄 Updating status for report:', complaintId, 'to:', newStatus);
      
      const response = await api.patch(`/admin/reports/${complaintId}/status`, { status: newStatus });
      console.log('✅ Status update response:', response.data);
      
      toast({
        title: "Status Updated",
        description: `Report status updated to ${newStatus}`,
      });
      
      // Update the local state immediately for better UX
      setComplaints((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(r => 
          r._id === complaintId 
            ? { ...r, status: newStatus }
            : r
        );
      });
      
    } catch (error) {
      console.error('❌ Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleAssignContractor = async (complaintId: string, contractor: string) => {
    try {
      console.log('👷 Assigning contractor:', contractor, 'to report:', complaintId);
      
      // Validate contractor name
      if (!contractor || contractor.trim().length === 0) {
        toast({
          title: "Error",
          description: "Contractor name is required",
          variant: "destructive",
        });
        return;
      }

      const contractorData = {
        name: contractor.trim(),
        assignedAt: new Date().toISOString(),
        assignedBy: user?._id
      };
      
      const response = await api.patch(`/admin/reports/${complaintId}/assign`, { 
        contractor: contractorData 
      });
      console.log('✅ Contractor assignment response:', response.data);
      
      toast({
        title: "Contractor Assigned",
        description: `${contractor} has been assigned to the report`,
      });
      
      // Update the local state immediately for better UX
      setComplaints((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(r => 
          r._id === complaintId 
            ? { ...r, contractor: contractorData }
            : r
        );
      });
      
      // Emit socket event for real-time updates to all clients
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('contractor-assign', {
          reportId: complaintId,
          contractor: contractorData,
          assignedBy: user?.name
        });
      }
      
    } catch (error) {
      console.error('❌ Error assigning contractor:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error?.message || "Failed to assign contractor",
        variant: "destructive",
      });
    }
  };

  const handleSaveModalChanges = async () => {
    if (!viewingReport) return;

    try {
      console.log('💾 Saving modal changes for report:', viewingReport);
      
      // Save status changes if modified
      if (modalStatus && modalStatus !== complaints.find(c => c._id === viewingReport)?.status) {
        await handleStatusUpdate(viewingReport, modalStatus);
      }
      
      // Save contractor changes if modified
      if (modalContractor && modalContractor !== complaints.find(c => c._id === viewingReport)?.contractor?.name) {
        await handleAssignContractor(viewingReport, modalContractor);
      }
      
      // Save notes if provided
      if (modalNotes.trim()) {
        try {
          await api.post(`/admin/reports/${viewingReport}/notes`, { note: modalNotes.trim() });
          toast({
            title: "Note Added",
            description: "Resolution notes have been added successfully",
          });
        } catch (error) {
          console.error('❌ Error adding note:', error);
          toast({
            title: "Error",
            description: error.response?.data?.error?.message || "Failed to add note",
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: "Changes Saved",
        description: "Report details have been updated successfully",
      });
      
      // Reset modal state
      setModalStatus('');
      setModalContractor('');
      setModalNotes('');
      setViewingReport(null);
      
    } catch (error) {
      console.error('❌ Error saving modal changes:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenModal = (reportId: string) => {
    const report = complaints.find(c => c._id === reportId);
    if (report) {
      setModalStatus(report.status);
      setModalContractor(report.contractor?.name || '');
      setModalNotes('');
      setViewingReport(reportId);
    }
  };

  const handleCloseModal = () => {
    setModalStatus('');
    setModalContractor('');
    setModalNotes('');
    setSelectedImage(null);
    setImagePreview('');
    setUploadingImage(false);
    setViewingReport(null);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage || !viewingReport) return;

    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('reportId', viewingReport);

      const response = await api.post('/admin/reports/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: "Image Uploaded",
        description: "Resolution image uploaded successfully",
      });

      // Update the report in the list
      setComplaints((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(r => 
          r._id === viewingReport 
            ? { ...r, images: [...(r.images || []), response.data.image] }
            : r
        );
      });

      // Reset image state
      setSelectedImage(null);
      setImagePreview('');
      
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error?.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove emailLogs state and related logic
  // Remove handleRefreshWeather and handleFetchEmailLog functions

  const stats = [
    { value: safeComplaints.length, label: 'Total Reports', icon: <MapPin className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100' },
    { value: safeComplaints.filter(c => c.status === 'pending').length, label: 'Pending Review', icon: <Clock className="w-6 h-6 text-orange-600" />, color: 'bg-orange-100' },
    { value: safeComplaints.filter(c => c.status === 'in-progress').length, label: 'In Progress', icon: <Truck className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100' },
    { value: safeComplaints.filter(c => c.status === 'resolved').length, label: 'Resolved', icon: <CheckCircle className="w-6 h-6 text-green-600" />, color: 'bg-green-100' }
  ];

  const renderWeather = (weather: AdminReport['weather'] | undefined) => {
    if (!weather || typeof weather.temperature === 'undefined') {
      return <span style={{ color: 'gray' }}>Weather data not available.</span>;
    }
    
    // Professional suggestion based on weather condition
    let suggestion = null;
    if (weather.condition.toLowerCase().includes('rain')) {
      suggestion = <span style={{ color: 'orange', marginLeft: 8 }}>⚠️ Rainy weather: Road work may be delayed.</span>;
    } else if (weather.condition.toLowerCase().includes('snow')) {
      suggestion = <span style={{ color: 'blue', marginLeft: 8 }}>❄️ Snowy weather: Road work not recommended.</span>;
    } else if (weather.condition.toLowerCase().includes('storm')) {
      suggestion = <span style={{ color: 'red', marginLeft: 8 }}>⛈️ Thunderstorm: Avoid road work for safety.</span>;
    } else {
      suggestion = <span style={{ color: 'green', marginLeft: 8 }}>✅ Clear weather: Conditions are favorable for work.</span>;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {weather.icon && (
          <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.description} width={32} height={32} />
        )}
        <span>{weather.temperature}°C, {weather.condition}</span>
        <span style={{ color: '#888', fontSize: 12 }}>({weather.cityName})</span>
        {suggestion}
      </div>
    );
  };

  // Count report types for the pie chart
  const reportTypeCounts = complaints.reduce((acc, report) => {
    const type = report.type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(reportTypeCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Helper for weather category, suggestion, and color
  const getWeatherCategoryAndSuggestion = (weather) => {
    if (!weather) return { category: 'Unknown', suggestion: 'Weather data unavailable.', color: 'bg-gray-200', icon: <CloudSun className="w-12 h-12 text-gray-400" /> };
    const temp = weather.temperature;
    const cond = weather.condition?.toLowerCase() || '';
    if (cond.includes('rain')) return { category: 'Rainy', suggestion: '⚠️ Rainy: Road work may be delayed.', color: 'bg-blue-200', icon: <CloudSun className="w-12 h-12 text-blue-500" /> };
    if (cond.includes('storm')) return { category: 'Stormy', suggestion: '⛈️ Storm: Avoid road work for safety.', color: 'bg-purple-200', icon: <CloudSun className="w-12 h-12 text-purple-500" /> };
    if (cond.includes('snow')) return { category: 'Snowy', suggestion: '❄️ Snowy: Road work not recommended.', color: 'bg-blue-100', icon: <CloudSun className="w-12 h-12 text-blue-300" /> };
    if (cond.includes('clear') || cond.includes('sun')) {
      if (temp > 32) return { category: 'Hot & Sunny', suggestion: '☀️ Hot: Hydration required for workers.', color: 'bg-yellow-200', icon: <CloudSun className="w-12 h-12 text-yellow-400" /> };
      if (temp < 15) return { category: 'Cold & Clear', suggestion: '🧥 Cold: Ensure proper clothing for workers.', color: 'bg-blue-100', icon: <CloudSun className="w-12 h-12 text-blue-400" /> };
      return { category: 'Clear', suggestion: '✅ Clear: Conditions are favorable for work.', color: 'bg-green-100', icon: <CloudSun className="w-12 h-12 text-green-400" /> };
    }
    if (cond.includes('cloud')) {
      if (temp > 28) return { category: 'Humid/Cloudy', suggestion: '🌥️ Humid: Monitor for heat stress.', color: 'bg-yellow-100', icon: <CloudSun className="w-12 h-12 text-yellow-400" /> };
      return { category: 'Cloudy', suggestion: '☁️ Cloudy: Generally safe for work.', color: 'bg-gray-200', icon: <CloudSun className="w-12 h-12 text-gray-400" /> };
    }
    if (temp < 10) return { category: 'Cold', suggestion: '🧥 Cold: Ensure proper clothing for workers.', color: 'bg-blue-100', icon: <CloudSun className="w-12 h-12 text-blue-400" /> };
    if (temp > 32) return { category: 'Hot', suggestion: '☀️ Hot: Hydration required for workers.', color: 'bg-yellow-200', icon: <CloudSun className="w-12 h-12 text-yellow-400" /> };
    return { category: 'Moderate', suggestion: '✅ Moderate: Good conditions for work.', color: 'bg-green-100', icon: <CloudSun className="w-12 h-12 text-green-400" /> };
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-500 py-12 overflow-hidden">
      {/* Make grid lines more visible by increasing opacity */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,rgba(17,24,39,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 animate-fade-in-up">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-10">Manage and track road issue reports across the city</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {/* Stat Cards with smooth hover, no sparkle border */}
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-900 border border-indigo-200 dark:border-indigo-700 rounded-2xl shadow-xl p-6 flex flex-col items-center transition-all duration-300 animate-fade-in-up hover:scale-105 hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-white/90 dark:hover:bg-gray-700/80 cursor-pointer"
              style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-2xl ${stat.color}`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* AI Analysis Stats */}
        <div className="relative z-10">
        {aiStats && pieChartData.length > 0 ? (
          <div className="backdrop-blur-lg bg-white/60 dark:bg-gray-900/60 border border-purple-200 dark:border-purple-700 rounded-3xl shadow-2xl p-8 mb-12 flex flex-col md:flex-row gap-10 items-center justify-between transition-all duration-500 hover:shadow-3xl hover:scale-[1.01]">
            <div className="flex-1 flex flex-col gap-4 min-w-[300px]">
              <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-blue-600 to-indigo-500 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-300 mb-2 tracking-tight flex items-center gap-2">
                <span className="inline-block animate-pulse">🤖</span> AI Analysis Performance
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={[
                    { name: 'Total Analyses', value: aiStats.totalAnalyses },
                    { name: 'Accuracy Rate', value: Math.round(aiStats.accuracyRate * 100) },
                    { name: 'Avg Confidence', value: Math.round(aiStats.averageConfidence * 100) },
                    { name: 'Avg Processing (s)', value: aiStats.processingTime.average }
                  ]}
                  margin={{ top: 30, right: 30, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e0e7ff" />
                  <XAxis dataKey="name" tick={{ fill: '#7c3aed', fontWeight: 700, fontSize: 13 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#7c3aed', fontWeight: 700, fontSize: 13 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, background: '#fff', color: '#7c3aed', fontWeight: 600 }} />
                  <Bar dataKey="value" fill="url(#barGradient)" radius={[12, 12, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center min-w-[300px]">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <defs>
                    <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f59e42" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                    <linearGradient id="pieGradient3" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="pieGradient4" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                    <linearGradient id="pieGradient5" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="url(#pieGradient1)"
                    label={({ name }) => name}
                    labelLine={false}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {pieChartData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={`url(#pieGradient${(idx % 5) + 1})`} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
                  <Tooltip contentStyle={{ borderRadius: 12, background: '#fff', color: '#7c3aed', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-base text-gray-700 dark:text-gray-200 text-center font-semibold tracking-wide">
                Report Type Distribution
              </div>
            </div>
          </div>
        ) : (
          <div className="backdrop-blur-lg bg-white/60 dark:bg-gray-900/60 border border-purple-200 dark:border-purple-700 rounded-3xl shadow-2xl p-8 mb-12 flex items-center justify-center text-gray-400 min-h-[200px]">
            No AI analysis data available.
          </div>
        )}
        </div>
        {/* Complaint Management Card with bright text and smooth hover */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-900 rounded-2xl shadow-2xl p-8 transition-colors duration-500 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-6 animate-fade-in-up">Complaint Management ({filteredComplaints.length})</h2>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div className="flex gap-3">
              <Select onValueChange={setSelectedStatus} defaultValue="all">
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select onValueChange={setSelectedSeverity} defaultValue="all">
                <SelectTrigger className="w-40">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <Link to="/map">
                <Button 
                  variant="outline" 
                  className="border-gray-200 text-black hover:bg-blue-50"
                >
                  <Map className="w-4 h-4 mr-2" />
                  View Live Map
                </Button>
              </Link>
            </div>
          </div>
          <CardContent>
            <div className="space-y-4">
              {filteredComplaints.map((complaint, idx) => (
                <div
                  key={complaint._id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-l-4 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-white/90 dark:hover:bg-gray-700/80 cursor-pointer"
                  style={{ animationDelay: `${idx * 0.05 + 0.6}s` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">#{complaint._id.slice(-6)} - {complaint.type}</h3>
                        <Badge className={`${getStatusColor(complaint.status)} capitalize`}>
                          {complaint.status.replace('-', ' ')}
                        </Badge>
                        <span className={`text-sm font-medium capitalize ${getSeverityColor(complaint.severity)}`}>{complaint.severity}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 truncate">{complaint.location.address}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-2 break-words">{complaint.description}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {complaint.upvotes?.length || 0} upvotes
                        </div>
                        <div>By: {complaint.reporter?.name || 'Unknown'}</div>
                        <div>{new Date(complaint.createdAt).toLocaleDateString()}</div>
                        {complaint.contractor && (
                          <div className="flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            {complaint.contractor.name}
                          </div>
                        )}
                      </div>
                      {/* Live Weather Button */}
                      <Button
                        variant="outline"
                        className="border-gray-200 text-black hover:bg-blue-50 my-2"
                        onClick={() => setWeatherModal({ open: true, city: complaint.location.address, weather: null })}
                      >

                        <CloudSun className="w-4 h-4" />
                        Live Weather
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 lg:mt-0">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenModal(complaint._id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      
                      {complaint.status === 'pending' && (
                        <Button
                          onClick={() => handleStatusUpdate(complaint._id, 'verified')}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Verify
                        </Button>
                      )}
                      
                      {complaint.status === 'verified' && (
                        <Button
                          onClick={() => handleStatusUpdate(complaint._id, 'in-progress')}
                        >
                          Start Work
                        </Button>
                      )}
                      
                      {complaint.status === 'in-progress' && (
                        <Button
                          onClick={() => handleStatusUpdate(complaint._id, 'resolved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </div>

        {/* Report Detail Modal */}
        {viewingReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Report Details</h2>
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                  >
                    Close
                  </Button>
                </div>
                
                                {(() => {
                  const currentReport = complaints.find(c => c._id === viewingReport);
                  if (!currentReport) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          {currentReport.images && currentReport.images.length > 0 ? (
                            <div className="space-y-2">
                              <img
                                src={currentReport.images[0].url}
                                alt="Issue"
                                className="w-full h-48 object-cover rounded-lg border"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              {currentReport.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto">
                                  {currentReport.images.slice(1).map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img.url}
                                      alt={`Issue ${idx + 2}`}
                                      className="w-20 h-20 object-cover rounded border"
                                      onError={(e) => {
                                        e.currentTarget.src = '/placeholder.svg';
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg border flex items-center justify-center">
                              <span className="text-gray-500">No images available</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="font-medium text-gray-700">Status</label>
                            <Select onValueChange={setModalStatus} value={modalStatus}>
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="font-medium text-gray-700">Assign Contractor</label>
                            <Select onValueChange={setModalContractor} value={modalContractor}>
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Select contractor" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ABC Road Services">ABC Road Services</SelectItem>
                                <SelectItem value="City Works Ltd">City Works Ltd</SelectItem>
                                <SelectItem value="Quick Fix Solutions">Quick Fix Solutions</SelectItem>
                                <SelectItem value="Metro Construction">Metro Construction</SelectItem>
                                <SelectItem value="Urban Repair Co">Urban Repair Co</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="font-medium text-gray-700">Resolution Notes</label>
                        <Textarea
                          placeholder="Add notes about the resolution..."
                          className="mt-1"
                          value={modalNotes}
                          onChange={(e) => setModalNotes(e.target.value)}
                        />
                      </div>
                      
                      {/* Image Upload Section */}
                      <div className="space-y-3">
                        <label className="font-medium text-gray-700">Add Resolution Photo</label>
                        <div className="space-y-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          
                          {!selectedImage ? (
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Select Image
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <div className="relative">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-32 object-cover rounded-lg border"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute top-2 right-2"
                                  onClick={removeSelectedImage}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleImageUpload}
                                  disabled={uploadingImage}
                                  className="flex-1"
                                >
                                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={removeSelectedImage}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={handleSaveModalChanges}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Weather Modal */}
      {weatherModal?.open && (
        <Dialog open={weatherModal.open} onClose={() => setWeatherModal(null)} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={() => setWeatherModal(null)} />
          <div className={`relative rounded-2xl shadow-2xl max-w-md w-full z-10 animate-fade-in-up overflow-hidden border border-blue-200 dark:border-blue-800`}
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(200,220,255,0.85) 100%)`,
              ...(document.documentElement.classList.contains('dark') && {
                background: 'linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(51,65,85,0.92) 100%)'
              })
            }}
          >
            <button
              className="absolute top-3 right-3 text-2xl font-bold p-2 rounded-full bg-white/80 dark:bg-blue-900/80 text-gray-700 dark:text-blue-100 shadow-lg hover:bg-gray-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 z-20 transition"
              onClick={() => setWeatherModal(null)}
              aria-label="Close"
            >
              &times;
            </button>
            {weatherLoading ? (
              <div className="flex items-center justify-center h-32">Loading...</div>
            ) : weatherError ? (
              <div className="text-red-500 p-8">{weatherError}</div>
            ) : weatherModal.weather ? (
              (() => {
                const { category, suggestion, color, icon } = getWeatherCategoryAndSuggestion(weatherModal.weather);
                return (
                  <div className={`flex flex-col items-center gap-4 py-8 px-6 w-full min-h-[340px] ${color}`}>
                    <div className="flex flex-col items-center gap-2">
                      {icon}
                      <div className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-lg">{category}</div>
                      <div className="text-base text-gray-600 dark:text-gray-300 capitalize">{weatherModal.weather.condition} in {weatherModal.weather.cityName}</div>
                    </div>
                    <div className="flex flex-row gap-8 items-center justify-center mt-2">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl font-extrabold text-blue-700 dark:text-blue-200">{weatherModal.weather.temperature}°C</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Temperature</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-blue-700 dark:text-blue-200">{weatherModal.weather.feelsLike}°C</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Feels Like</span>
                      </div>
                    </div>
                    <div className="flex flex-row gap-8 items-center justify-center mt-2">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-blue-700 dark:text-blue-200">{weatherModal.weather.humidity}%</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Humidity</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-blue-700 dark:text-blue-200">{weatherModal.weather.windSpeed} km/h</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Wind</span>
                      </div>
                    </div>
                    <div className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 text-blue-900 dark:text-blue-100 font-medium shadow text-center">
                      {suggestion}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-gray-400 p-8">No weather data available.</div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default AdminDashboard;

