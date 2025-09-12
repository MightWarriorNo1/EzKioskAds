import { useState } from 'react';
import { Search, MapPin, List, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import LeafletMap from '../components/MapContainer';
import { LatLngTuple } from 'leaflet';

interface KioskData {
  id?: string;
  name: string;
  city: string;
  price: string;
  originalPrice?: string;
  traffic: 'Low Traffic' | 'Medium Traffic' | 'High Traffic';
  hasWarning?: boolean;
  position: LatLngTuple;
  address?: string;
  description?: string;
}

export default function KioskSelectionPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKioskIds, setSelectedKioskIds] = useState<string[]>([]);
  const [showContentModal, setShowContentModal] = useState(false);

  const steps = [
    { number: 1, name: 'Setup Service', current: false, completed: true },
    { number: 2, name: 'Select Kiosk', current: true, completed: false },
    { number: 3, name: 'Choose Weeks', current: false, completed: false },
    { number: 4, name: 'Add Media & Duration', current: false, completed: false },
    { number: 5, name: 'Review & Submit', current: false, completed: false }
  ];

  const handleBackToSetup = () => {
    navigate('/client/new-campaign');
  };

  // Mock kiosk data for demonstration
  const kioskData: KioskData[] = [
    {
      id: 'a1b2c3d4-e5f6-4789-abcd-ef1234567890',
      name: 'Murrieta Town Center',
      city: 'Murrieta, CA',
      price: '$90/week',
      originalPrice: '$120/week',
      traffic: 'High Traffic',
      position: [33.5689, -117.1865],
      address: '123 Main St, Murrieta, CA 92562',
      description: 'High-traffic location in the heart of Murrieta'
    },
    {
      id: 'b2c3d4e5-f6a7-4801-bcde-f23456789012',
      name: 'California Oaks Shopping Center',
      city: 'Murrieta, CA',
      price: '$50/week',
      traffic: 'Medium Traffic',
      position: [33.5721, -117.1892],
      address: '456 California Oaks Rd, Murrieta, CA 92562',
      description: 'Popular shopping destination with steady foot traffic'
    },
    {
      id: 'c3d4e5f6-a7b8-4012-cdef-345678901234',
      name: 'North Jeffe Plaza',
      city: 'Murrieta, CA',
      price: '$40/week',
      traffic: 'Low Traffic',
      position: [33.5750, -117.1920],
      address: '789 North Jeffe St, Murrieta, CA 92562',
      description: 'Affordable option in growing neighborhood'
    },
    {
      id: 'd4e5f6a7-b8c9-4123-defa-456789012345',
      name: 'Murrieta Hot Springs',
      city: 'Murrieta, CA',
      price: '$90/week',
      originalPrice: '$120/week',
      traffic: 'High Traffic',
      position: [33.5660, -117.1840],
      address: '321 Hot Springs Blvd, Murrieta, CA 92562',
      description: 'Premium location near popular attractions'
    },
    {
      id: 'e5f6a7b8-c9d0-4234-efab-567890123456',
      name: 'Murrieta Valley Plaza',
      city: 'Murrieta, CA',
      price: '$50/week',
      traffic: 'Medium Traffic',
      position: [33.5700, -117.1880],
      address: '654 Valley Blvd, Murrieta, CA 92562',
      description: 'Well-established retail area with good visibility'
    }
  ];

  const filteredKiosks = kioskData.filter(kiosk =>
    kiosk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kiosk.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (kiosk.address && kiosk.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleSelect = (kioskId?: string) => {
    if (!kioskId) return;
    setSelectedKioskIds(prev => prev.includes(kioskId) ? prev.filter(id => id !== kioskId) : [...prev, kioskId]);
  };

  const selectedKiosks = kioskData.filter(k => selectedKioskIds.includes(k.id || ''));

  return (
    <DashboardLayout
      title="Create New Campaign"
      subtitle=""
      showBreadcrumb={false}
    >

      {/* Progress Indicator */}
      <div className="mb-6 md:mb-8">
        {/* Mobile Progress - Vertical Stack */}
        <div className="block md:hidden">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-soft ${
              steps[1].current 
                ? 'bg-black text-white' 
                : steps[1].completed
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {steps[1].completed ? '✓' : steps[1].number}
            </div>
            <span className={`text-sm font-medium ${
              steps[1].current ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {steps[1].name}
            </span>
          </div>
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            Step 2 of {steps.length}
          </div>
        </div>
        
        {/* Desktop Progress - Horizontal */}
        <div className="hidden md:flex items-center space-x-4 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-soft ${
                step.completed 
                  ? 'bg-green-600 text-white' 
                  : step.current
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {step.completed ? '✓' : step.number}
              </div>
              <span className={`ml-2 text-sm font-medium whitespace-nowrap ${
                step.current ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-1 mx-4 ${
                  step.completed ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Back Navigation */}
      <div className="mb-8">
        <button 
          onClick={handleBackToSetup}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-soft"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Setup Service</span>
        </button>
      </div>

      {/* Section Title */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Kiosk</h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Select one or more kiosks for your advertising campaign</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 md:mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search kiosks by name, city, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 shadow-soft text-sm md:text-base"
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-4 md:mb-6">
        <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-soft">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-black text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <MapPin className="h-3 w-3 md:h-4 md:w-4 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">Map View</span>
            <span className="sm:hidden">Map</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-black text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <List className="h-3 w-3 md:h-4 md:w-4 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">List View</span>
            <span className="sm:hidden">List</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mb-6 md:mb-8">
        {viewMode === 'map' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-[400px] md:h-[600px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-elevated md:col-span-2">
              <LeafletMap
                center={[33.5689, -117.1865]}
                zoom={11}
                className="h-full w-full"
                kioskData={filteredKiosks}
                onKioskSelect={(k) => toggleSelect(k?.id)}
                selectedKioskIds={selectedKioskIds}
              />
            </div>
            <div className="h-[400px] md:h-[600px] rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft bg-white dark:bg-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="font-semibold text-gray-900 dark:text-white">Kiosks</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{filteredKiosks.length} found</div>
              </div>
              <div className="h-full overflow-y-auto p-3 md:p-4 space-y-3">
                {filteredKiosks.map((kiosk) => (
                  <div key={kiosk.id} className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 hover:shadow-elevated transition-shadow ${selectedKioskIds.includes(kiosk.id || '') ? 'ring-2 ring-primary-500' : ''}`}> 
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">{kiosk.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{kiosk.address}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            kiosk.traffic === 'High Traffic'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : kiosk.traffic === 'Medium Traffic'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>{kiosk.traffic}</span>
                          <span className="text-xs text-green-600 dark:text-green-400 font-semibold">{kiosk.price}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleSelect(kiosk.id)}
                        className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          selectedKioskIds.includes(kiosk.id || '')
                            ? 'bg-green-600 text-white'
                            : 'bg-black dark:bg-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-700'
                        }`}
                      >
                        {selectedKioskIds.includes(kiosk.id || '') ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKiosks.map((kiosk) => (
              <div key={kiosk.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 bg-white dark:bg-gray-800 shadow-soft hover:shadow-elevated transition-shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-3 md:space-y-0">
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1">{kiosk.name}</h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-2">{kiosk.address}</p>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 md:mb-4">{kiosk.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium w-fit ${
                        kiosk.traffic === 'High Traffic' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : kiosk.traffic === 'Medium Traffic'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {kiosk.traffic}
                      </span>
                      <div className="text-sm">
                        {kiosk.originalPrice && (
                          <span className="text-gray-400 dark:text-gray-500 line-through mr-2">{kiosk.originalPrice}</span>
                        )}
                        <span className="text-green-600 dark:text-green-400 font-semibold">{kiosk.price}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSelect(kiosk.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full md:w-auto ${
                      selectedKioskIds.includes(kiosk.id || '')
                        ? 'bg-green-600 text-white'
                        : 'bg-black dark:bg-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-700'
                    }`}>
                    {selectedKioskIds.includes(kiosk.id || '') ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Kiosks Summary */}
      {selectedKioskIds.length > 0 && (
        <div className="mb-6 md:mb-8 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 bg-white dark:bg-gray-800 shadow-soft">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-2 text-gray-900 dark:text-white">Selected Kiosks</h3>
          <div className="flex flex-wrap gap-2">
            {selectedKiosks.map(k => (
              <span key={k.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                {k.name}
                <button onClick={() => toggleSelect(k.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-600 dark:text-gray-300">
          {selectedKioskIds.length} selected
        </div>
        <button 
          disabled={selectedKioskIds.length === 0}
          onClick={() => setShowContentModal(true)}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors shadow-soft text-sm md:text-base ${selectedKioskIds.length > 0 ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
          <span className="hidden md:inline">Continue to Select Weeks</span>
          <span className="md:hidden">Continue</span>
        </button>
      </div>

      {/* Content Limitations Modal */}
      {showContentModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md md:max-w-lg p-4 md:p-6 shadow-elevated border border-gray-200 dark:border-gray-700">
            <div className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1">Content Limitations</div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">Please review these content restrictions before proceeding</div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4 mb-4 bg-gray-50 dark:bg-gray-800">
              <div className="font-semibold text-gray-900 dark:text-white mb-1 text-sm md:text-base">Important Notice</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Your business and advertisements must comply with the following limitations. Non-compliant ads will be rejected during the approval process.</div>
            </div>
            <div className="text-gray-900 dark:text-gray-100 text-xs md:text-sm space-y-1 mb-6">
              <div>No Gyms</div>
              <div>No Workout Supplements</div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button onClick={() => setShowContentModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm md:text-base">Cancel</button>
              <button onClick={() => navigate('/client/select-weeks', { state: { kiosks: selectedKiosks } })} className="px-4 py-2 rounded-lg bg-black dark:bg-gray-900 text-white text-sm md:text-base">I Understand & Accept</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
