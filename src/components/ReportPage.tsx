
import React, { useState } from 'react';
import { Camera, MapPin, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ReportPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [issueType, setIssueType] = useState('');
  const [severity, setSeverity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast({
            title: "Location captured",
            description: "GPS coordinates have been added to your report",
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get your location. Please enter it manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Report submitted successfully!",
      description: "Your road issue has been reported and will be reviewed by our team.",
    });

    // Reset form
    setSelectedImage(null);
    setIssueType('');
    setSeverity('');
    setLocation('');
    setDescription('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen relative bg-gray-50 dark:bg-gray-900 transition-colors duration-500 py-12 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,rgba(17,24,39,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">Report a Road Issue</h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">Help make your community safer by reporting potholes, cracks, and other road hazards</p>
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 items-start w-full">
          {/* Issue Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow p-4 md:p-8 transition-colors duration-500 w-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Issue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Photo Evidence
                  </Label>
                  <div className="mt-1">
                    {selectedImage ? (
                      <div className="relative">
                        <img
                          src={selectedImage}
                          alt="Selected"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white dark:bg-gray-800 dark:hover:bg-gray-700"
                          onClick={() => setSelectedImage(null)}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Issue Type */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Issue Type
                  </Label>
                  <Select onValueChange={setIssueType} value={issueType}>
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800">
                      <SelectItem value="pothole">Pothole</SelectItem>
                      <SelectItem value="crack">Road Crack</SelectItem>
                      <SelectItem value="waterlogged">Water-logging</SelectItem>
                      <SelectItem value="debris">Debris/Obstruction</SelectItem>
                      <SelectItem value="signage">Missing/Damaged Signage</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Severity */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Severity Level
                  </Label>
                  <Select onValueChange={setSeverity} value={severity}>
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800">
                      <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                      <SelectItem value="medium">Medium - Affects traffic flow</SelectItem>
                      <SelectItem value="high">High - Safety hazard</SelectItem>
                      <SelectItem value="critical">Critical - Immediate danger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Location
                  </Label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter address or coordinates"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      className="px-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide any additional details about the issue..."
                    className="min-h-[100px] resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!selectedImage || !issueType || !severity || !location || isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 py-3 text-white dark:text-gray-900"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </div>
          {/* Report Preview + Tips (right column) */}
          <div className="flex flex-col gap-4 w-full mt-4 md:mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow p-4 md:p-8 transition-colors duration-500 w-full">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Preview</h2>
              <CardContent>
                <div className="space-y-4">
                  {selectedImage && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Photo</h4>
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}
                  {issueType && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Type</h4>
                      <p className="text-gray-600 dark:text-gray-400 capitalize">{issueType.replace('-', ' ')}</p>
                    </div>
                  )}
                  {severity && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {severity}
                      </span>
                    </div>
                  )}
                  {location && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Location</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{location}</p>
                    </div>
                  )}
                  {description && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
            {/* Tips Card (right column on md+, below on mobile) */}
            <div className="bg-blue-50 dark:bg-gray-900 rounded-xl p-6 text-left shadow border border-blue-100 dark:border-gray-700 hidden md:block">
              <h3 className="text-blue-700 dark:text-blue-300 font-semibold mb-2 flex items-center gap-2">
                <span>📝</span> Reporting Tips
              </h3>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                <li>Take clear photos showing the full extent of the issue</li>
                <li>Enable location services for accurate GPS coordinates</li>
                <li>Be specific in your description for faster resolution</li>
                <li>Check if the issue has already been reported nearby</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Tips Card for mobile (below grid) */}
        <div className="bg-blue-50 dark:bg-gray-900 rounded-lg p-4 mt-4 text-left shadow border border-blue-100 dark:border-gray-700 md:hidden">
          <h3 className="text-blue-700 dark:text-blue-300 font-semibold mb-2 flex items-center gap-2">
            <span>📝</span> Reporting Tips
          </h3>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
            <li>Take clear photos showing the full extent of the issue</li>
            <li>Enable location services for accurate GPS coordinates</li>
            <li>Be specific in your description for faster resolution</li>
            <li>Check if the issue has already been reported nearby</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
