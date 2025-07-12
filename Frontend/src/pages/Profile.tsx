import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { User, FileText, CheckCircle, Award } from 'lucide-react';

const Profile = () => {
  const { user, role } = useAuth();
  const reports = user?.reports || [];
  const resolved = reports.filter((r: any) => r.status === 'resolved').length;

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Please sign in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,rgba(17,24,39,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <Card className="w-full max-w-xl mb-8 shadow-xl relative z-10">
        <CardHeader className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl text-white font-bold mb-4 overflow-hidden">
            {user.picture ? (
              <img src={user.picture} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : '?' 
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</CardTitle>
          <div className="text-gray-500 dark:text-gray-300 mb-2">{user.email}</div>
          {user.sub && <div className="text-xs text-gray-400 mb-1">Google ID: {user.sub}</div>}
          {user.locale && <div className="text-xs text-gray-400 mb-1">Locale: {user.locale}</div>}
          {role && <div className="mt-2 text-blue-700 dark:text-blue-300 font-semibold">Role: {role}</div>}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="flex flex-col items-center">
              <FileText className="w-8 h-8 text-blue-500 mb-2" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">{reports.length}</div>
              <div className="text-xs text-gray-500">Reports Submitted</div>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">{resolved}</div>
              <div className="text-xs text-gray-500">Resolved Reports</div>
            </div>
            <div className="flex flex-col items-center">
              <Award className="w-8 h-8 text-yellow-500 mb-2" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">{reports.length > 0 ? 'Active Reporter' : 'New User'}</div>
              <div className="text-xs text-gray-500">Status</div>
            </div>
          </div>
          <div className="text-center text-gray-600 dark:text-gray-300 text-sm mt-8">
            This is your Google profile. Your data is securely fetched from your Gmail account.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile; 