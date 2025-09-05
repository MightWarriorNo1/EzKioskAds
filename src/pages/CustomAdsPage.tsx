import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Camera, 
  Video, 
  Palette, 
  Upload, 
  Check, 
  X, 
  AlertCircle,
  MapPin,
  Clock,
  DollarSign,
  FileImage,
  FileVideo,
  Trash2
} from 'lucide-react';
import SiteHeader from '../components/layouts/SiteHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

interface ServiceTile {
  id: string;
  title: string;
  description: string;
  price: number;
  turnaround: string;
  icon: React.ReactNode;
  requiresLocation: boolean;
  timeLimit?: string;
  videoLength?: string;
}

interface OrderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  details: string;
  files: File[];
}

const services: ServiceTile[] = [
  {
    id: 'graphic-design',
    title: 'Vertical Ad with User Uploaded Files',
    description: 'Custom graphic design using your provided assets',
    price: 125,
    turnaround: '5-day turnaround',
    icon: <Palette className="w-8 h-8" />,
    requiresLocation: false
  },
  {
    id: 'photography',
    title: 'Vertical Ad with Custom Photography',
    description: 'Professional photography session for your ad',
    price: 199,
    turnaround: '5-day turnaround',
    icon: <Camera className="w-8 h-8" />,
    requiresLocation: true,
    timeLimit: '2hr time limit'
  },
  {
    id: 'videography',
    title: 'Vertical Ad with Custom Video',
    description: 'Professional video production for your ad',
    price: 399,
    turnaround: '7-day turnaround',
    icon: <Video className="w-8 h-8" />,
    requiresLocation: true,
    timeLimit: '3hr time limit',
    videoLength: '15 sec - 30 sec video'
  }
];

export default function CustomAdsPage() {
  const [selectedService, setSelectedService] = useState<ServiceTile | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    details: '',
    files: []
  });
  const [formErrors, setFormErrors] = useState<Partial<OrderFormData>>({});
  const [isUploading, setIsUploading] = useState(false);
  const { user }=useAuth();
  const navigate=useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleServiceSelect = (service: ServiceTile) => {
    if (!user) {
      navigate('/signin');
      return;
    }
    setSelectedService(service);
    if (service.requiresLocation) {
      setShowDisclaimer(true);
    } else {
      setShowOrderForm(true);
    }
  };

  const handleDisclaimerConfirm = () => {
    setShowDisclaimer(false);
    setShowOrderForm(true);
  };

  const handleDisclaimerCancel = () => {
    setShowDisclaimer(false);
    setSelectedService(null);
  };

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxFiles = 5;
    const maxPhotoSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 500 * 1024 * 1024; // 500MB

    if (files.length + formData.files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      const maxSize = isVideo ? maxVideoSize : maxPhotoSize;

      if (!isVideo && !isImage) {
        errors.push(`${file.name}: Only images and videos are allowed`);
        return;
      }

      if (file.size > maxSize) {
        const sizeLimit = isVideo ? '500MB' : '10MB';
        errors.push(`${file.name}: File size exceeds ${sizeLimit} limit`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...validFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<OrderFormData> = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.details.trim()) errors.details = 'Project details are required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsUploading(true);
    
    try {
      // Here you would integrate with your payment processor
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Order submitted successfully! You will be redirected to payment.');
      // Redirect to payment or show success message
    } catch (error) {
      alert('Error submitting order. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-900 dark:to-slate-800">
      <SiteHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Custom Ads & Creation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Professional ad creation services tailored to your needs. Choose from graphic design, 
            photography, or videography services to create stunning vertical ads for our kiosk network.
          </p>
        </div>

        {/* Service Tiles */}
        {!showOrderForm && (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {services.map((service) => (
              <Card key={service.id} className="text-center hover:shadow-elevated transition-all duration-300 hover:scale-105">
                <div className="p-8">
                  <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-primary-300 flex items-center justify-center mx-auto mb-6">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{service.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center gap-2 text-lg font-semibold text-primary-600">
                      <DollarSign className="w-5 h-5" />
                      <span>${service.price}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{service.turnaround}</span>
                    </div>
                    {service.timeLimit && (
                      <div className="text-sm text-gray-500">
                        {service.timeLimit}
                      </div>
                    )}
                    {service.videoLength && (
                      <div className="text-sm text-gray-500">
                        {service.videoLength}
                      </div>
                    )}
                    {service.requiresLocation && (
                      <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
                        <MapPin className="w-4 h-4" />
                        <span>50-mile radius required</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => handleServiceSelect(service)}
                    className="w-full"
                    size="lg"
                  >
                    Order Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Disclaimer Modal */}
        {showDisclaimer && selectedService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                  <h3 className="text-xl font-bold">Location Requirement</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {selectedService.title} requires a photography or videography session within 50 miles 
                  of available kiosk locations. Please confirm that you can meet this requirement.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleDisclaimerCancel}
                    variant="secondary"
                    className="flex-1"
                  >
                    Go Back
                  </Button>
                  <Button 
                    onClick={handleDisclaimerConfirm}
                    className="flex-1"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Order Form */}
        {showOrderForm && selectedService && (
          <Card className="max-w-4xl mx-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <Button 
                  onClick={() => {
                    setShowOrderForm(false);
                    setSelectedService(null);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      address: '',
                      details: '',
                      files: []
                    });
                    setFormErrors({});
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected Service Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedService.icon}
                    <div>
                      <h3 className="font-semibold">{selectedService.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedService.turnaround} • ${selectedService.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={formErrors.firstName}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={formErrors.lastName}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={formErrors.email}
                    required
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={formErrors.phone}
                    required
                  />
                </div>

                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={formErrors.address}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Details
                  </label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => handleInputChange('details', e.target.value)}
                    className="input min-h-[120px] resize-none"
                    placeholder="Describe how you want your ad to look and any specific requirements..."
                    required
                  />
                  {formErrors.details && (
                    <p className="mt-1 text-xs text-danger-600">{formErrors.details}</p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Media Assets (Max 5 files)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      Images: 10MB max • Videos: 500MB max
                    </p>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="secondary"
                      className="mt-4"
                    >
                      Choose Files
                    </Button>
                  </div>

                  {/* File List */}
                  {formData.files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            {file.type.startsWith('video/') ? (
                              <FileVideo className="w-5 h-5 text-blue-500" />
                            ) : (
                              <FileImage className="w-5 h-5 text-green-500" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeFile(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* reCAPTCHA Placeholder */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    reCAPTCHA verification will be implemented here
                  </p>
                </div>

                {/* Virus Scan Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-blue-500" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      All uploaded files will be automatically scanned for viruses before processing.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Processing...' : `Pay Now - $${selectedService.price}`}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

