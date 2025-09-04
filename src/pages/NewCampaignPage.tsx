import React from 'react';
import { Users, Settings, Phone, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';

export default function NewCampaignPage() {
  const navigate = useNavigate();
  
  const steps = [
    { number: 1, name: 'Setup Service', current: true },
    { number: 2, name: 'Select Kiosk', current: false },
    { number: 3, name: 'Choose Weeks', current: false },
    { number: 4, name: 'Add Media & Duration', current: false },
    { number: 5, name: 'Review & Submit', current: false }
  ];

  const handleSelfSetup = () => {
    navigate('/client/kiosk-selection');
  };

  return (
    <DashboardLayout
      title="Create New Campaign"
      subtitle=""
      showBreadcrumb={false}
    >

      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.current 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {step.number}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step.current ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-1 bg-gray-200 dark:bg-gray-700 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Setup Service Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Setup Service</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Choose how you'd like to set up your campaign.</p>
        
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How would you like to proceed?</h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">Choose whether you'd like our experts to handle your campaign setup or create it yourself.</p>
        </div>

        {/* Setup Options */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Full-Service Setup */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 bg-white dark:bg-gray-800">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Full-Service Setup</h3>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">Recommended</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">Let our advertising experts handle everything from strategy to execution.</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Custom strategy development</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Professional content creation</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Campaign optimization</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Ongoing management</span>
              </li>
            </ul>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Contact our team:</p>
              <div className="space-y-3">
                <button className="w-full bg-black dark:bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Call (951) 595-7307</span>
                </button>
                <button className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email sales@ezkioskads.com</span>
                </button>
                <button 
                  onClick={() => navigate('/client/contact')}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Contact Form</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Self-Service Setup */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 bg-white dark:bg-gray-800">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Self-Service Setup</h3>
              <p className="text-gray-600 dark:text-gray-300">Create and manage your campaign using our easy-to-use platform.</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Step-by-step campaign builder</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Real-time availability checker</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Instant campaign preview</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Complete control over your ads</span>
              </li>
            </ul>

            <button 
              onClick={handleSelfSetup}
              className="w-full bg-black dark:bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Continue with Self-Setup</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Not sure which option is right for you?{' '}
          <button 
            onClick={() => navigate('/contact')}
            className="text-gray-900 dark:text-white underline hover:no-underline"
          >
            Contact us
          </button>
          {' '}for a free consultation.
        </p>
      </div>
    </DashboardLayout>
  );
}
