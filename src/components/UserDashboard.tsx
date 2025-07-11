
import React from 'react';
import { Plus, MapPin, Clock, CheckCircle, AlertTriangle, Trophy, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const UserDashboard = () => {
  // Mock user data
  const user = {
    name: 'Alex Johnson',
    points: 2,
    level: 'Bronze Contributor',
    reportsSubmitted: 15,
    reportsResolved: 8,
    rank: 23
  };

  // Mock user reports
  const userReports = [
    {
      id: 1,
      type: 'Pothole',
      location: 'Main Street & 5th Ave',
      status: 'resolved',
      submittedDate: '2024-01-10',
      resolvedDate: '2024-01-15',
      severity: 'high'
    },
    {
      id: 2,
      type: 'Road Crack',
      location: 'Oak Boulevard',
      status: 'in-progress',
      submittedDate: '2024-01-12',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'Water-logging',
      location: 'River Road',
      status: 'verified',
      submittedDate: '2024-01-14',
      severity: 'critical'
    },
    {
      id: 4,
      type: 'Debris',
      location: 'Park Avenue',
      status: 'pending',
      submittedDate: '2024-01-16',
      severity: 'low'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-green-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const nextLevelPoints = 2500;
  const progressPercentage = (user.points / nextLevelPoints) * 100;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-500 py-12 overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,rgba(17,24,39,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
              <p className="text-gray-600 mt-1">Track your reports and see your community impact</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link to="/report">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Report New Issue
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  {user.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Level</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      <Trophy className="w-3 h-3 mr-1" />
                      {user.level}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Points</span>
                      <span className="text-sm font-bold text-blue-600">
                        {user.points.toLocaleString()} / {nextLevelPoints.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {(nextLevelPoints - user.points).toLocaleString()} points to Silver level
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{user.reportsSubmitted}</div>
                      <div className="text-xs text-gray-500">Reports Submitted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{user.reportsResolved}</div>
                      <div className="text-xs text-gray-500">Issues Resolved</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Your Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900">Community Rank</div>
                        <div className="text-xs text-blue-600">Among all contributors</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-blue-600">#{user.rank}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {((user.reportsResolved / user.reportsSubmitted) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-green-700">Resolution Rate</div>
                    <div className="text-xs text-green-600 mt-1">Above average!</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Your Reports ({userReports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(report.severity)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{report.type}</h3>
                            <p className="text-sm text-gray-600">{report.location}</p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(report.status)} capitalize`}>
                          {report.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Submitted: {new Date(report.submittedDate).toLocaleDateString()}
                        </div>
                        {report.resolvedDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Resolved: {new Date(report.resolvedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {report.status === 'resolved' && (
                        <div className="mt-3 p-2 bg-green-50 rounded-md">
                          <p className="text-sm text-green-800 font-medium">
                            ✓ Issue resolved! Thank you for making your community safer.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Link to="/report">
                    <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                      <Plus className="w-4 h-4 mr-2" />
                      Report Another Issue
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
