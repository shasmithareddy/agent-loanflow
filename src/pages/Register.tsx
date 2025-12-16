import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Calendar, MapPin, Mail, Upload, Camera, 
  ArrowRight, Loader2, AlertCircle, Check, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLoanStore } from '@/store/loanStore';


const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { customerProfile, updateCustomerProfile, updateVerificationDetails } = useLoanStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if user has mobile number (came from auth)
  useEffect(() => {
    if (!customerProfile.mobileNumber) {
      navigate('/auth');
    } else if (customerProfile.isRegistered) {
      navigate('/');
    }
  }, [navigate, customerProfile.mobileNumber, customerProfile.isRegistered]);

  const validatePAN = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  };

  const validatePincode = (pincode: string) => {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      updateCustomerProfile({ 
        aadhaarFile: file, 
        aadhaarFileName: file.name 
      });
      toast.success('Aadhaar document uploaded');
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (error) {
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const closeCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  }, [stream]);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        updateCustomerProfile({ livePhoto: photoData });
        closeCamera();
        toast.success('Photo captured successfully');
      }
    }
  };

  const isFormValid = () => {
    return (
      customerProfile.pan && validatePAN(customerProfile.pan) &&
      customerProfile.fullName.trim().length >= 3 &&
      customerProfile.dob &&
      customerProfile.gender &&
      customerProfile.maritalStatus &&
      customerProfile.residenceAddress.trim().length >= 10 &&
      customerProfile.residencePincode && validatePincode(customerProfile.residencePincode) &&
      customerProfile.residenceCity.trim().length >= 2 &&
      customerProfile.residenceState &&
      customerProfile.email && validateEmail(customerProfile.email) &&
      customerProfile.aadhaarFile &&
      customerProfile.livePhoto
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setIsLoading(true);

    try {
      // Update verification details from customer profile
      updateVerificationDetails({
        fullName: customerProfile.fullName,
        dob: customerProfile.dob,
        pan: customerProfile.pan,
      });

      updateCustomerProfile({ isRegistered: true });
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <span className="font-bold text-lg text-primary-foreground">TC</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">Tata Capital</h1>
            <p className="text-xs text-muted-foreground">Complete Your Profile</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Customer Registration</h2>
            <p className="text-muted-foreground mt-2">
              Please fill in your details to proceed with your loan application
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Section */}
            <div className="flex flex-col items-center mb-8">
              <div 
                className="relative w-32 h-32 rounded-full border-4 border-dashed border-primary/30 bg-muted flex items-center justify-center cursor-pointer hover:border-primary/60 transition-colors overflow-hidden"
                onClick={openCamera}
              >
                {customerProfile.livePhoto ? (
                  <img 
                    src={customerProfile.livePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                    <span className="text-xs text-muted-foreground">Take Photo</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Click to capture live photo *</p>
            </div>

            {/* PAN & Employment Type */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PAN Number *</Label>
                <Input
                  value={customerProfile.pan}
                  onChange={(e) => updateCustomerProfile({ pan: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className={customerProfile.pan && !validatePAN(customerProfile.pan) ? 'border-destructive' : ''}
                />
                {customerProfile.pan && !validatePAN(customerProfile.pan) && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Invalid PAN format
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Employment Type *</Label>
                <Select 
                  value={customerProfile.employmentType} 
                  onValueChange={(value: 'salaried' | 'self-employed' | 'business') => 
                    updateCustomerProfile({ employmentType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="self-employed">Self Employed Individual</SelectItem>
                    <SelectItem value="business">Business Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4" /> Personal Details
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={customerProfile.dob}
                      onChange={(e) => updateCustomerProfile({ dob: e.target.value })}
                      className="pl-10"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Customer Name (as per PAN) *</Label>
                  <Input
                    value={customerProfile.fullName}
                    onChange={(e) => updateCustomerProfile({ fullName: e.target.value })}
                    placeholder="Full name as per PAN"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select 
                    value={customerProfile.gender} 
                    onValueChange={(value: 'male' | 'female' | 'other') => 
                      updateCustomerProfile({ gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Marital Status *</Label>
                  <Select 
                    value={customerProfile.maritalStatus} 
                    onValueChange={(value: 'single' | 'married' | 'divorced' | 'widowed') => 
                      updateCustomerProfile({ maritalStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Residence Address
              </h3>

              <div className="space-y-2">
                <Label>Address *</Label>
                <Textarea
                  value={customerProfile.residenceAddress}
                  onChange={(e) => updateCustomerProfile({ residenceAddress: e.target.value })}
                  placeholder="Enter your complete residence address"
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>PIN Code *</Label>
                  <Input
                    value={customerProfile.residencePincode}
                    onChange={(e) => updateCustomerProfile({ 
                      residencePincode: e.target.value.replace(/\D/g, '').slice(0, 6) 
                    })}
                    placeholder="560001"
                    maxLength={6}
                    className={customerProfile.residencePincode && !validatePincode(customerProfile.residencePincode) ? 'border-destructive' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={customerProfile.residenceCity}
                    onChange={(e) => updateCustomerProfile({ residenceCity: e.target.value })}
                    placeholder="City name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select 
                    value={customerProfile.residenceState} 
                    onValueChange={(value) => updateCustomerProfile({ residenceState: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact & Documents */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> Contact & Documents
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Personal Email ID *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={customerProfile.email}
                      onChange={(e) => updateCustomerProfile({ email: e.target.value })}
                      placeholder="your@email.com"
                      className="pl-10"
                    />
                  </div>
                  {customerProfile.email && !validateEmail(customerProfile.email) && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Invalid email format
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Aadhaar Document Upload *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="aadhaar-upload"
                    />
                    <label htmlFor="aadhaar-upload" className="cursor-pointer">
                      {customerProfile.aadhaarFileName ? (
                        <div className="flex items-center justify-center gap-2 text-success">
                          <Check className="h-5 w-5" />
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {customerProfile.aadhaarFileName}
                          </span>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          <Upload className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-sm">Upload Aadhaar</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </main>

      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={() => closeCamera()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take a Live Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={closeCamera} className="flex-1">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="h-4 w-4 mr-2" /> Capture
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
