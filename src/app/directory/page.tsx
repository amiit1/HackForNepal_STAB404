
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ServiceProvider, ServiceProviderType } from '@/lib/types';
import { mockServiceProviders } from '@/lib/mockData';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Phone, MapPin, Building, Syringe, Wheat, Milk, ListChecks, PlusCircle, LocateFixed, AlertTriangle, Briefcase, Map as MapIcon } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTranslations } from '@/hooks/useTranslations';
import { useToast } from '@/hooks/use-toast';

const serviceTypeIcons: Record<ServiceProviderType, React.ReactNode> = {
  vet: <Syringe className="w-6 h-6 text-red-500" />,
  ai_center: <Briefcase className="w-6 h-6 text-purple-500" />,
  feed_supplier: <Wheat className="w-6 h-6 text-yellow-600" />,
  milk_collection: <Milk className="w-6 h-6 text-green-500" />,
  other: <Building className="w-6 h-6 text-blue-500" />,
};

type ServiceProviderWithDistance = ServiceProvider & { distance?: number };

// API key will now be read from environment variables
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

export default function DirectoryPage() {
  const { t } = useTranslations();
  const { toast } = useToast();

  const [servicesFromLocalStorage, setServicesFromLocalStorage] = useLocalStorage<ServiceProvider[]>('serviceProviders', mockServiceProviders);
  const [servicesFromApi, setServicesFromApi] = useState<ServiceProviderWithDistance[]>([]);
  const [displayedServices, setDisplayedServices] = useState<ServiceProviderWithDistance[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceType, setNewServiceType] = useState<ServiceProviderType>('vet');
  const [newServicePhone, setNewServicePhone] = useState('');
  const [newServiceAddress, setNewServiceAddress] = useState('');
  const [newServiceNotes, setNewServiceNotes] = useState('');

  const [isGettingLocation, setIsGettingLocation] = useState(true);
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);

  const serviceTypeLabels: Record<ServiceProviderType, string> = {
    vet: t('directory.serviceType.vet'),
    ai_center: t('directory.serviceType.ai_center'),
    feed_supplier: t('directory.serviceType.feed_supplier'),
    milk_collection: t('directory.serviceType.milk_collection'),
    other: t('directory.serviceType.other'),
  };

  const mapGeoapifyResultToServiceProvider = useCallback((place: any): ServiceProviderWithDistance => {
    const properties = place.properties;
    let type: ServiceProviderType = 'other'; 

    const categories = properties.categories || [];

    if (categories.includes('pet.veterinary')) {
      type = 'vet';
    } else if (categories.includes('commercial.agrarian')) {
      if (properties.name?.toLowerCase().includes('feed') || properties.name?.toLowerCase().includes('dana')) {
        type = 'feed_supplier';
      } else {
        type = 'ai_center';
      }
    } else if (categories.includes('commercial.food_and_drink.cheese_and_dairy') || categories.includes('commercial.food_and_drink.farm')) {
      type = 'milk_collection';
    } else if (categories.includes('office.government.agriculture')) {
      type = 'ai_center';
    }
    
    const phone = properties.phone || 
                  properties.contact?.phone || 
                  properties.contact?.mobile || 
                  properties.datasource?.raw?.phone || 
                  properties.datasource?.raw?.['contact:phone'] || 
                  properties.datasource?.raw?.mobile;

    return {
      id: properties.place_id || crypto.randomUUID(),
      name: properties.name || properties.address_line1 || t('directory.unknownService'),
      type: type,
      contactPhone: phone || undefined,
      address: properties.address_line2 || properties.formatted,
      notes: categories.join(', '), 
      latitude: properties.lat,
      longitude: properties.lon,
      distance: properties.distance, 
    };
  },[t]);

  const fetchServicesFromGeoapify = useCallback(async (latitude: number, longitude: number) => {
    setIsFetchingApi(true);
    setServicesFromApi([]);
    setLocationError(null);

    if (!GEOAPIFY_API_KEY) {
      console.error("Geoapify API key is missing.");
      setLocationError(t('directory.apiError') + ": Missing API Key");
      setIsFetchingApi(false);
      return;
    }

    const geoapifyCategories = [
      'pet.veterinary',
      'commercial.agrarian', 
      'commercial.food_and_drink.cheese_and_dairy', 
      'commercial.food_and_drink.farm',
      'office.government.agriculture',
    ].join(',');
    
    const radius = 10000; 
    const url = `https://api.geoapify.com/v2/places?categories=${geoapifyCategories}&filter=circle:${longitude},${latitude},${radius}&bias=proximity:${longitude},${latitude}&limit=20&apiKey=${GEOAPIFY_API_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorMsg = `API request failed with status ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) { /* ignore json parsing error */ }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      const mappedServices = data.features.map(mapGeoapifyResultToServiceProvider);
      setServicesFromApi(mappedServices);

      if (mappedServices.length === 0) {
        toast({ title: t('directory.noApiServicesFoundTitle'), description: t('directory.noApiServicesFoundBody') });
      }
    } catch (error) {
      console.error("Error fetching from Geoapify:", error);
      setLocationError(t('directory.apiError') + (error instanceof Error ? `: ${error.message}` : ''));
      setServicesFromApi([]);
    } finally {
      setIsFetchingApi(false);
    }
  }, [t, toast, mapGeoapifyResultToServiceProvider]);


  useEffect(() => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserCoordinates(coords);
          setLocationError(null);
          setIsGettingLocation(false);
          fetchServicesFromGeoapify(coords.latitude, coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(t('directory.locationError') + (error.message ? `: ${error.message}` : ''));
          setUserCoordinates(null);
          setIsGettingLocation(false);
          setServicesFromApi([]);
        },
        { timeout: 10000 }
      );
    } else {
      setLocationError(t('directory.locationNotSupported'));
      setUserCoordinates(null);
      setIsGettingLocation(false);
      setServicesFromApi([]);
    }
  }, [t, fetchServicesFromGeoapify]);


  useEffect(() => {
    if (servicesFromApi.length > 0) {
      setDisplayedServices(servicesFromApi.sort((a,b) => (a.distance ?? Infinity) - (b.distance ?? Infinity) ));
    } else if (locationError || (!isGettingLocation && !isFetchingApi && !userCoordinates) ) {
      let localServices = servicesFromLocalStorage.map(s => ({ ...s, distance: undefined as number | undefined }));
      if (userCoordinates) { 
          localServices = localServices.map(service => {
              if (service.latitude != null && service.longitude != null && userCoordinates) {
                  const R = 6371e3; 
                  const φ1 = userCoordinates.latitude * Math.PI/180;
                  const φ2 = service.latitude * Math.PI/180;
                  const Δφ = (service.latitude-userCoordinates.latitude) * Math.PI/180;
                  const Δλ = (service.longitude-userCoordinates.longitude) * Math.PI/180;

                  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                            Math.cos(φ1) * Math.cos(φ2) *
                            Math.sin(Δλ/2) * Math.sin(Δλ/2);
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                  const d = R * c; 
                  return { ...service, distance: d };
              }
              return { ...service, distance: undefined };
          }).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      } else { 
          localServices.sort((a, b) => a.name.localeCompare(b.name));
      }
      setDisplayedServices(localServices);
    } else if (!isGettingLocation && !isFetchingApi && servicesFromApi.length === 0 && userCoordinates) {
      setDisplayedServices([]); 
    }
  }, [servicesFromApi, servicesFromLocalStorage, userCoordinates, locationError, isFetchingApi, isGettingLocation, t]);

  const resetForm = () => {
    setNewServiceName('');
    setNewServiceType('vet');
    setNewServicePhone('');
    setNewServiceAddress('');
    setNewServiceNotes('');
  };

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServiceType) {
      toast({ title: t('error'), description: t('directory.addForm.validationError'), variant: 'destructive' });
      return;
    }
    const newService: ServiceProvider = {
      id: crypto.randomUUID(),
      name: newServiceName,
      type: newServiceType,
      contactPhone: newServicePhone || undefined,
      address: newServiceAddress || undefined,
      notes: newServiceNotes || undefined,
    };
    setServicesFromLocalStorage(prevServices => [...prevServices, newService]);
    setIsAddDialogOpen(false);
    resetForm();
    toast({title: t('directory.serviceAddedSuccessTitle'), description: t('directory.serviceAddedSuccessBody')});
  };
  
  const getServiceTypeIcon = (type: ServiceProviderType) => {
    return serviceTypeIcons[type] || serviceTypeIcons.other;
  }

  const handleShowRoute = (providerLat: number, providerLng: number, serviceName: string) => {
    if (!userCoordinates) {
      toast({
        title: t('directory.routeErrorTitle'),
        description: t('directory.routeErrorBodyNoUserLocation'),
        variant: 'destructive',
      });
      return;
    }
    // This check is mostly redundant if button is disabled correctly, but good for safety
    if (providerLat == null || providerLng == null) {
      toast({
        title: t('directory.routeErrorTitle'),
        description: t('directory.routeErrorBodyNoServiceLocation'),
        variant: 'destructive',
      });
      return;
    }

    const origin = `${userCoordinates.latitude},${userCoordinates.longitude}`;
    const destination = `${providerLat},${providerLng}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <AppShell>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <ListChecks className="w-8 h-8 mr-2" /> {t('directory.title')}
          </CardTitle>
          <CardDescription>{t('directory.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow space-y-2">
              {isGettingLocation && (
                <div className="flex items-center text-sm text-muted-foreground p-2 border border-dashed rounded-md">
                  <LoadingSpinner size={16} className="mr-2" />
                  {t('directory.fetchingLocation')}
                </div>
              )}
              {isFetchingApi && (
                <div className="flex items-center text-sm text-muted-foreground p-2 border border-dashed rounded-md">
                  <LoadingSpinner size={16} className="mr-2" />
                  {t('directory.fetchingApiServices')}
                </div>
              )}
              {locationError && !isGettingLocation && !isFetchingApi && (
                <div className="flex items-center text-sm text-destructive p-2 border border-destructive/50 border-dashed rounded-md">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {locationError}
                </div>
              )}
              {!isGettingLocation && !isFetchingApi && !locationError && userCoordinates && servicesFromApi.length > 0 && (
                 <div className="flex items-center text-sm text-green-600 p-2 border border-green-500/50 border-dashed rounded-md">
                  <LocateFixed className="w-4 h-4 mr-2" />
                  {t('directory.locationSuccessApi')}
                </div>
              )}
              {!isGettingLocation && !isFetchingApi && !locationError && userCoordinates && servicesFromApi.length === 0 && (
                 <div className="flex items-center text-sm text-yellow-600 p-2 border border-yellow-500/50 border-dashed rounded-md">
                  <LocateFixed className="w-4 h-4 mr-2" />
                  {t('directory.locationSuccessNoApiResults')}
                </div>
              )}
               {!isGettingLocation && !isFetchingApi && !locationError && !userCoordinates && (
                  <div className="flex items-center text-sm text-muted-foreground p-2 border border-dashed rounded-md">
                      <LocateFixed className="w-4 h-4 mr-2 opacity-50" />
                      {t('directory.locationInfoUnavailable')}
                  </div>
              )}
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { setIsAddDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto shrink-0">
                  <PlusCircle className="mr-2 h-5 w-5" /> {t('directory.addNewServiceButton')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-card">
                <DialogHeader>
                  <DialogTitle className="font-headline text-primary">{t('directory.addForm.title')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddServiceSubmit} className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1 md:items-center">
                    <Label htmlFor="serviceName" className="text-left md:text-right">{t('directory.addForm.nameLabel')}:</Label>
                    <Input id="serviceName" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="md:col-span-3" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1 md:items-center">
                    <Label htmlFor="serviceType" className="text-left md:text-right">{t('directory.addForm.typeLabel')}:</Label>
                    <Select value={newServiceType} onValueChange={(value) => setNewServiceType(value as ServiceProviderType)}>
                      <SelectTrigger className="md:col-span-3">
                        <SelectValue placeholder={t('directory.addForm.typePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(serviceTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key as ServiceProviderType}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1 md:items-center">
                    <Label htmlFor="servicePhone" className="text-left md:text-right">{t('directory.addForm.phoneLabel')}:</Label>
                    <Input id="servicePhone" type="tel" value={newServicePhone} onChange={(e) => setNewServicePhone(e.target.value)} className="md:col-span-3" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1 md:items-center">
                    <Label htmlFor="serviceAddress" className="text-left md:text-right">{t('directory.addForm.addressLabel')}:</Label>
                    <Input id="serviceAddress" value={newServiceAddress} onChange={(e) => setNewServiceAddress(e.target.value)} className="md:col-span-3" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1 md:items-start">
                    <Label htmlFor="serviceNotes" className="text-left md:text-right pt-0 md:pt-2">{t('directory.addForm.notesLabel')}:</Label>
                    <Textarea id="serviceNotes" value={newServiceNotes} onChange={(e) => setNewServiceNotes(e.target.value)} className="md:col-span-3" />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">{t('cancel')}</Button></DialogClose>
                    <Button type="submit">{t('add')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {displayedServices.length > 0 ? (
            <div className="space-y-4">
              {displayedServices.map((service) => {
                const serviceHasLocation = service.latitude != null && service.longitude != null;
                return (
                <Card key={service.id} className="bg-muted/30 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center">
                      {getServiceTypeIcon(service.type)}
                      <span className="ml-2">{service.name}</span>
                    </CardTitle>
                    <CardDescription>{serviceTypeLabels[service.type]}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm pb-4"> {/* Adjusted pb */}
                    {service.address && (
                      <p className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                        {t('directory.addressLabel')}: {service.address}
                      </p>
                    )}
                    {service.contactPhone && (
                      <p className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                        {t('directory.phoneLabel')}: 
                        <a href={`tel:${service.contactPhone}`} className="text-primary hover:underline ml-1">
                          {service.contactPhone}
                        </a>
                      </p>
                    )}
                     {service.distance !== undefined && service.distance !== Infinity && (
                        <p className="text-xs text-blue-500 mt-1">
                            {t('directory.approxDistanceLabel')}: {(service.distance / 1000).toFixed(1)} km
                        </p>
                    )}
                    {service.notes && <p className="text-xs text-muted-foreground pt-1">{t('directory.notesLabel')}: {service.notes}</p>}
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4 flex-col sm:flex-row items-start sm:items-center gap-2">
                    {serviceHasLocation ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handleShowRoute(service.latitude!, service.longitude!, service.name)}
                          disabled={!userCoordinates}
                          aria-label={
                            userCoordinates
                              ? t('directory.showRouteButtonLabel', { serviceName: service.name })
                              : t('directory.showRouteDisabledUserLocationButtonLabel', { serviceName: service.name })
                          }
                        >
                          <MapIcon className="w-4 h-4 mr-2" />
                          {t('directory.showRouteButtonText')}
                        </Button>
                        {!userCoordinates && (
                          <p className="text-xs text-muted-foreground text-center sm:text-left">
                            {t('directory.enableLocationForRoute')}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="w-full">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" disabled aria-label={t('directory.showRouteDisabledServiceLocationButtonLabel', { serviceName: service.name })}>
                          <MapIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                          {t('directory.showRouteButtonText')}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 text-center sm:text-left">{t('directory.serviceLocationUnavailable')}</p>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              )})}
            </div>
          ) : (
             !isGettingLocation && !isFetchingApi && <p className="text-muted-foreground py-6 text-center">{t('directory.noServicesFound')}</p>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

