
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
  Map
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
    
    socket.on('report:new', (report) => {
      console.log('📝 New report received:', report);
      setComplaints((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return [report, ...prevArray];
      });
    });
    
    socket.on('report:status', (updatedReport) => {
      console.log('📊 Report status update received:', updatedReport);
      setComplaints((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(r => r._id === updatedReport._id ? updatedReport : r);
      });
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

  const stats = [
    { value: safeComplaints.length, label: 'Total Reports', icon: <MapPin className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100' },
    { value: safeComplaints.filter(c => c.status === 'pending').length, label: 'Pending Review', icon: <Clock className="w-6 h-6 text-orange-600" />, color: 'bg-orange-100' },
    { value: safeComplaints.filter(c => c.status === 'in-progress').length, label: 'In Progress', icon: <Truck className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100' },
    { value: safeComplaints.filter(c => c.status === 'resolved').length, label: 'Resolved', icon: <CheckCircle className="w-6 h-6 text-green-600" />, color: 'bg-green-100' }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-500 py-12 overflow-hidden">
      {/* Make grid lines more visible by increasing opacity */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,rgba(17,24,39,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 animate-fade-in-up">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-10 text-sm sm:text-base">Manage and track road issue reports across the city</p>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
          {/* Stat Cards */}
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-900 border border-indigo-200 dark:border-indigo-700 rounded-2xl shadow-xl p-3 sm:p-6 flex flex-col items-center transition-all duration-300 animate-fade-in-up hover:scale-105 hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-white/90 dark:hover:bg-gray-700/80 cursor-pointer min-w-0"
              style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 text-xl sm:text-2xl ${stat.color}`}>{stat.icon}</div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* AI Analysis Stats */}
        {aiStats && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl shadow-xl p-6 mb-10">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2">
              <span>🤖</span> AI Analysis Performance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{aiStats.totalAnalyses}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Analyses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.round(aiStats.accuracyRate * 100)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round(aiStats.averageConfidence * 100)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Avg Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{aiStats.processingTime.average.toFixed(1)}s</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Avg Processing</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Most Common Issues:</span> {aiStats.mostCommonIssues.join(', ')}
              </div>
            </div>
          </div>
        )}
        {/* Complaint Management Card with bright text and smooth hover */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-8 transition-colors duration-500 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 sm:mb-6 animate-fade-in-up">Complaint Management ({filteredComplaints.length})</h2>
          <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Select onValueChange={setSelectedStatus} defaultValue="all">
                <SelectTrigger className="w-full sm:w-40">
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
                <SelectTrigger className="w-full sm:w-40">
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
            <div className="mt-2 sm:mt-0 w-full sm:w-auto">
              <Link to="/map">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto border-gray-200 text-black hover:bg-blue-50"
                >
                  <Map className="w-4 h-4 mr-2" />
                  View Live Map
                </Button>
              </Link>
            </div>
          </div>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {filteredComplaints.map((complaint, idx) => (
                <div
                  key={complaint._id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-l-4 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-white/90 dark:hover:bg-gray-700/80 cursor-pointer"
                  style={{ animationDelay: `${idx * 0.05 + 0.6}s` }}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleOpenModal(complaint._id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {complaint.status === 'pending' && (
                        <Button
                          size="sm"
                          className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
                          onClick={() => handleStatusUpdate(complaint._id, 'verified')}
                        >
                          Verify
                        </Button>
                      )}
                      {complaint.status === 'verified' && (
                        <Button
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handleStatusUpdate(complaint._id, 'in-progress')}
                        >
                          Start Work
                        </Button>
                      )}
                      {complaint.status === 'in-progress' && (
                        <Button
                          size="sm"
                          className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusUpdate(complaint._id, 'resolved')}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold">Report Details</h2>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          {currentReport.images && currentReport.images.length > 0 ? (
                            <div className="space-y-2">
                              <img
                                src={currentReport.images[0].url}
                                alt="Issue"
                                className="w-full h-40 sm:h-48 object-cover rounded-lg border"
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
                                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border"
                                      onError={(e) => {
                                        e.currentTarget.src = '/placeholder.svg';
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-40 sm:h-48 bg-gray-100 dark:bg-gray-800 rounded-lg border flex items-center justify-center">
                              <span className="text-gray-500">No images available</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 sm:space-y-3">
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
                      <div className="space-y-2 sm:space-y-3">
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
                                  className="w-full h-24 sm:h-32 object-cover rounded-lg border"
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
                              <div className="flex flex-col sm:flex-row gap-2">
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
                                  className="flex-1"
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
    </div>
  );
};

export default AdminDashboard;
