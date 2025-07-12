
import React, { useState } from 'react';
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
  FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [viewingReport, setViewingReport] = useState<number | null>(null);
  const { toast } = useToast();

  // Mock complaints data
  const complaints = [
    {
      id: 1,
      type: 'Pothole',
      location: 'Main Street & 5th Ave',
      status: 'pending',
      severity: 'high',
      submittedBy: 'Alex Johnson',
      submittedDate: '2024-01-16',
      reports: 12,
      description: 'Large pothole causing traffic disruption',
      image: '/placeholder.svg',
      contractor: null
    },
    {
      id: 2,
      type: 'Road Crack',
      location: 'Oak Boulevard',
      status: 'verified',
      severity: 'medium',
      submittedBy: 'Sarah Wilson',
      submittedDate: '2024-01-15',
      reports: 5,
      description: 'Visible crack extending across the road',
      image: '/placeholder.svg',
      contractor: 'ABC Road Services'
    },
    {
      id: 3,
      type: 'Water-logging',
      location: 'River Road',
      status: 'in-progress',
      severity: 'critical',
      submittedBy: 'Mike Chen',
      submittedDate: '2024-01-14',
      reports: 23,
      description: 'Severe water accumulation after rain',
      image: '/placeholder.svg',
      contractor: 'City Works Ltd'
    },
    {
      id: 4,
      type: 'Debris',
      location: 'Park Avenue',
      status: 'resolved',
      severity: 'low',
      submittedBy: 'Emily Davis',
      submittedDate: '2024-01-13',
      reports: 3,
      description: 'Construction debris blocking lane',
      image: '/placeholder.svg',
      contractor: 'Quick Fix Solutions'
    }
  ];

  const filteredComplaints = complaints.filter(complaint => {
    if (selectedStatus !== 'all' && complaint.status !== selectedStatus) return false;
    if (selectedSeverity !== 'all' && complaint.severity !== selectedSeverity) return false;
    return true;
  });

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

  const handleStatusUpdate = (complaintId: number, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Complaint #${complaintId} status updated to ${newStatus}`,
    });
  };

  const handleAssignContractor = (complaintId: number, contractor: string) => {
    toast({
      title: "Contractor Assigned",
      description: `${contractor} has been assigned to complaint #${complaintId}`,
    });
  };

  const stats = [
    { value: complaints.length, label: 'Total Reports', icon: <MapPin className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100' },
    { value: complaints.filter(c => c.status === 'pending').length, label: 'Pending Review', icon: <Clock className="w-6 h-6 text-orange-600" />, color: 'bg-orange-100' },
    { value: complaints.filter(c => c.status === 'in-progress').length, label: 'In Progress', icon: <Truck className="w-6 h-6 text-blue-600" />, color: 'bg-blue-100' },
    { value: complaints.filter(c => c.status === 'resolved').length, label: 'Resolved', icon: <CheckCircle className="w-6 h-6 text-green-600" />, color: 'bg-green-100' }
  ];

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
          </div>
          <CardContent>
            <div className="space-y-4">
              {filteredComplaints.map((complaint, idx) => (
                <div
                  key={complaint.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-l-4 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-white/90 dark:hover:bg-gray-700/80 cursor-pointer"
                  style={{ animationDelay: `${idx * 0.05 + 0.6}s` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">#{complaint.id} - {complaint.type}</h3>
                        <Badge className={`${getStatusColor(complaint.status)} capitalize`}>
                          {complaint.status.replace('-', ' ')}
                        </Badge>
                        <span className={`text-sm font-medium capitalize ${getSeverityColor(complaint.severity)}`}>
                          {complaint.severity}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{complaint.location}</p>
                      <p className="text-sm text-gray-500 mb-2">{complaint.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {complaint.reports} reports
                        </div>
                        <div>By: {complaint.submittedBy}</div>
                        <div>{new Date(complaint.submittedDate).toLocaleDateString()}</div>
                        {complaint.contractor && (
                          <div className="flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            {complaint.contractor}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 lg:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingReport(complaint.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      
                      {complaint.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(complaint.id, 'verified')}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Verify
                        </Button>
                      )}
                      
                      {complaint.status === 'verified' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(complaint.id, 'in-progress')}
                        >
                          Start Work
                        </Button>
                      )}
                      
                      {complaint.status === 'in-progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(complaint.id, 'resolved')}
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
                    onClick={() => setViewingReport(null)}
                  >
                    Close
                  </Button>
                </div>
                
                {complaints.find(c => c.id === viewingReport) && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <img
                          src="/placeholder.svg"
                          alt="Issue"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="font-medium text-gray-700">Status</label>
                          <Select onValueChange={(value) => handleStatusUpdate(viewingReport, value)} defaultValue={complaints.find(c => c.id === viewingReport)?.status}>
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
                          <Select onValueChange={(value) => handleAssignContractor(viewingReport, value)}>
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue placeholder="Select contractor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ABC Road Services">ABC Road Services</SelectItem>
                              <SelectItem value="City Works Ltd">City Works Ltd</SelectItem>
                              <SelectItem value="Quick Fix Solutions">Quick Fix Solutions</SelectItem>
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
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        Save Changes
                      </Button>
                      <Button variant="outline">
                        <FileImage className="w-4 h-4 mr-2" />
                        Add Resolution Photo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
