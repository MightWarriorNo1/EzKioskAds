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
      <div className="mb-8 md:mb-12">
        {/* Mobile Progress - Vertical Stack */}
        <div className="block md:hidden">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              steps[0].current 
                ? 'bg-black text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {steps[0].number}
            </div>
            <span className={`text-sm font-medium ${
              steps[0].current ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {steps[0].name}
            </span>
          </div>
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            Step 1 of {steps.length}
          </div>
        </div>
        
        {/* Desktop Progress - Horizontal */}
        <div className="hidden md:flex items-center space-x-4 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.current 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {step.number}
              </div>
              <span className={`ml-2 text-sm font-medium whitespace-nowrap ${
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
      <div className="mb-8 md:mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Setup Service</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 md:mb-8 text-sm md:text-base">Choose how you'd like to set up your campaign.</p>
        
        <div className="text-center mb-8 md:mb-12 px-4">
          <h3 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 leading-tight">How would you like to proceed?</h3>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">Choose whether you'd like our experts to handle your campaign setup or create it yourself.</p>
        </div>

        {/* Setup Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Full-Service Setup */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-8 bg-white dark:bg-gray-800">
            <div className="text-center mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-2 mb-2">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Full-Service Setup</h3>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">Recommended</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">Let our advertising experts handle everything from strategy to execution.</p>
            </div>
            
            <ul className="space-y-3 mb-6 md:mb-8">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">Custom strategy development</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">Professional content creation</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">Campaign optimization</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">Ongoing management</span>
              </li>
            </ul>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Contact our team:</p>
              <div className="space-y-2 md:space-y-3">
                <button className="w-full bg-black dark:bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 text-sm md:text-base">
                  <Phone className="h-4 w-4" />
                  <span className="truncate">Call (951) 595-7307</span>
                </button>
                <button className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm md:text-base">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">Email sales@ezkioskads.com</span>
                </button>
                <button 
                  onClick={() => navigate('/client/contact')}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
                >
                  <span>Contact Form</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Self-Service Setup */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-8 bg-white dark:bg-gray-800">
            <div className="text-center mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-6 w-6 md:h-8 md:w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Self-Service Setup</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">Create and manage your campaign using our easy-to-use platform.</p>
            </div>
            
            <ul className="space-y-3 mb-6 md:mb-8">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">Step-by-step campaign builder</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">Real-time availability checker</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">Instant campaign preview</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">Complete control over your ads</span>
              </li>
            </ul>

            <button 
              onClick={handleSelfSetup}
              className="w-full bg-black dark:bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
            >
              <span>Continue with Self-Setup</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="text-center px-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
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
