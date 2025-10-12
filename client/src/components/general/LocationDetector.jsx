import React, { useState } from 'react';
import { MapPin, Loader2, Navigation, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  getCurrentPosition,
  reverseGeocode,
  getCompleteLocation,
  isGeolocationSupported,
  checkLocationPermission,
} from '@/utils/locationService';

const LocationDetector = ({ onLocationDetected, disabled = false, className = '' }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDetectLocation = async () => {
    setError(null);
    setSuccess(false);
    setIsDetecting(true);

    try {
      // Check if geolocation is supported
      if (!isGeolocationSupported()) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Check permission
      const permission = await checkLocationPermission();

      if (permission === 'denied') {
        throw new Error(
          'Location permission denied. Please enable location access in your browser settings.'
        );
      }

      // Show loading toast
      const loadingToast = toast.loading('Detecting your location...', {
        description: 'This may take a few seconds',
      });

      // Get complete location
      const locationData = await getCompleteLocation();
      console.log(locationData)
     

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Validate data
      if (!locationData.address.city && !locationData.address.area) {
        throw new Error('Could not determine your address. Please enter manually.');
      }

      // Call parent callback with location data
      if (onLocationDetected) {
        onLocationDetected(locationData.address);
       
      }

      setSuccess(true);

      // Show success toast
      toast.success('Location Detected Successfully', {
        description: `${locationData.address.area || 'Area'}, ${locationData.address.city || 'City'}`,
        duration: 3000,
      });

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Location detection error:', err);
      setError(err.message);

      toast.error('Location Detection Failed', {
        description: err.message,
        duration: 5000,
      });
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        type="button"
        onClick={handleDetectLocation}
        disabled={disabled || isDetecting}
        variant="outline"
        className="w-full border-[#1c3c63] text-[#1c3c63] hover:bg-[#1c3c63] hover:text-white transition-all duration-300 disabled:opacity-50"
      >
        {isDetecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Detecting Location...
          </>
        ) : success ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Location Detected
          </>
        ) : (
          <>
            <Navigation className="h-4 w-4 mr-2" />
            Auto-Detect Location
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive" className="text-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <div className="space-y-2">
              <p>{error}</p>
              {error.includes('permission denied') && (
                <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                  <p className="text-xs font-medium mb-1">To enable location access:</p>
                  <ol className="text-xs list-decimal list-inside space-y-0.5 ml-2">
                    <li>Click the lock/info icon in your browser's address bar</li>
                    <li>Find "Location" permissions</li>
                    <li>Change setting to "Allow"</li>
                    <li>Refresh the page and try again</li>
                  </ol>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-sm">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-900 dark:text-green-300 ml-2">
            Location detected successfully! Address fields have been filled.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default LocationDetector;
