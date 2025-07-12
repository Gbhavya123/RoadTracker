
import React, { useState } from 'react';
import { Filter, MapPin, AlertTriangle, Droplets, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const MapView = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  // Mock data for reported issues
  const mockIssues = [
    { id: 1, type: 'pothole', severity: 'high', location: 'Main Street & 5th Ave', reports: 12, status: 'verified' },
    { id: 2, type: 'crack', severity: 'medium', location: 'Oak Boulevard', reports: 5, status: 'pending' },
    { id: 3, type: 'waterlogged', severity: 'critical', location: 'River Road', reports: 23, status: 'in-progress' },
    { id: 4, type: 'debris', severity: 'low', location: 'Park Avenue', reports: 3, status: 'resolved' },
    { id: 5, type: 'pothole', severity: 'medium', location: 'Commerce Street', reports: 8, status: 'verified' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIssues = mockIssues.filter(issue => {
    if (selectedFilter !== 'all' && issue.type !== selectedFilter) return false;
    if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500 pb-8">
      {/* Heading and underline */}
      <div className="bg-white dark:bg-gray-900 transition-colors duration-500 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 animate-fade-in-up">Live Road Issues Map</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Real-time tracking of reported road issues across the city</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 h-[600px] bg-white dark:bg-gray-800 transition-colors duration-500">
              <CardContent className="p-0 h-full">
                <div className="w-full h-full bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-lg relative overflow-hidden transition-colors duration-500">
                  {/* Map placeholder with interactive elements */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Interactive Map</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        This would show a real map with reported issues, heatmap layers, and interactive markers
                      </p>
                    </div>
                  </div>
                  
                  {/* Mock issue markers */}
                  <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div className="absolute top-2/3 right-1/3 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  
                  {/* Map controls */}
                  <div className="absolute top-4 right-4 z-10">
                    <button className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow border border-gray-200 dark:border-gray-700 font-semibold text-sm transition-colors duration-300">
                      Satellite
                    </button>
                  </div>
                  <div className="absolute top-4 right-4 space-y-2">
                    <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white">
                      <Droplets className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 z-10">
                    <div className="rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow border border-gray-200 dark:border-gray-700 px-4 py-3 text-xs font-medium transition-colors duration-300">
                      <div className="mb-2 font-bold text-gray-700 dark:text-gray-100">Severity Levels</div>
                      <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Critical</div>
                      <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span> High</div>
                      <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span> Medium</div>
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Low</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issues List */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Today's Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">127</div>
                    <div className="text-xs text-gray-500">Active Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">43</div>
                    <div className="text-xs text-gray-500">Resolved Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">89</div>
                    <div className="text-xs text-gray-500">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">234</div>
                    <div className="text-xs text-gray-500">Total Reports</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Issues */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Issues ({filteredIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredIssues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(issue.severity)}`}></div>
                          <span className="font-medium text-sm capitalize">
                            {issue.type.replace('-', ' ')}
                          </span>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{issue.location}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {issue.reports} reports
                        </div>
                        <div className="capitalize">{issue.severity} priority</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
