'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { TripsService } from '@/lib/services';
import {
  GooglePlacesService,
  PlacePrediction,
} from '@/lib/services/google-places';
import { toast } from 'sonner';

interface TripData {
  origin: string;
  destination: string;
  originAddress: string;
  destinationAddress: string;
  date: string;
  time: string;
  vehicleType: string;
  vehicleMake: string;
  description: string;
  rules: string[];
  amenities: string[];
  payloadType: 'PARCEL' | 'PASSENGER';
  parcelWeight: string;
  passengerCount: string;
}

interface PlaceData {
  originPlace: PlacePrediction | null;
  destinationPlace: PlacePrediction | null;
}

const steps = [
  { id: 1, title: 'Route', description: 'Where are you going?' },
  { id: 2, title: 'Details', description: 'Trip specifics' },
  { id: 3, title: 'Review', description: 'Confirm and publish' },
];

export function PublishWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [tripData, setTripData] = useState<TripData>({
    origin: '',
    destination: '',
    originAddress: '',
    destinationAddress: '',
    date: '',
    time: '',
    vehicleType: '',
    vehicleMake: '',
    description: '',
    rules: [],
    amenities: [],
    payloadType: 'PARCEL',
    parcelWeight: '',
    passengerCount: '',
  });

  const [placeData, setPlaceData] = useState<PlaceData>({
    originPlace: null,
    destinationPlace: null,
  });

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePublish = async () => {
    if (!placeData.originPlace || !placeData.destinationPlace) {
      toast.error('Please select valid origin and destination locations');
      return;
    }

    // Validate date is tomorrow or later
    const selectedDate = new Date(tripData.date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      toast.error('Please select a date from tomorrow onwards');
      return;
    }

    setIsPublishing(true);

    try {
      // Get coordinates for both places
      const [originCoords, destinationCoords] = await Promise.all([
        GooglePlacesService.getPlaceDetails(placeData.originPlace.place_id),
        GooglePlacesService.getPlaceDetails(
          placeData.destinationPlace.place_id,
        ),
      ]);

      if (!originCoords || !destinationCoords) {
        toast.error('Failed to get location coordinates. Please try again.');
        return;
      }

      // Create WKT POINT strings (longitude first, then latitude)
      const originWKT = `POINT(${originCoords.lng} ${originCoords.lat})`;
      const destinationWKT = `POINT(${destinationCoords.lng} ${destinationCoords.lat})`;

      const payload = {
        origin: originWKT,
        destination: destinationWKT,
        originName: tripData.origin,
        destinationName: tripData.destination,
        departureAt: new Date(
          `${tripData.date}T${tripData.time}:00`,
        ).toISOString(),
        vehicleType: tripData.vehicleType.toUpperCase() as
          | 'CAR'
          | 'VAN'
          | 'TRUCK'
          | 'BIKE',
        payloadType: tripData.payloadType,
        capacity:
          tripData.payloadType === 'PARCEL'
            ? Number(tripData.parcelWeight || 10)
            : Number(tripData.passengerCount || 4),
        pricePerSeat: 1, // Set to 1 as minimum positive value, can be updated later
        // Only include parcelWeight for parcel trips
        ...(tripData.payloadType === 'PARCEL' && {
          parcelWeight: Number(tripData.parcelWeight || 10),
        }),
        // Only include passengerCount for passenger trips
        ...(tripData.payloadType === 'PASSENGER' && {
          passengerCount: Number(tripData.passengerCount || 4),
        }),
        // Always send empty strings for addresses to avoid backend issues
        originAddress: '',
        destinationAddress: '',
      };

      const response = await TripsService.create(payload);

      if (response.ok) {
        const newTrip = await response.json();
        toast.success('Trip published successfully!');
        router.push(`/trips/${newTrip.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to publish trip');
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOriginPlaceSelect = (place: PlacePrediction) => {
    setPlaceData((prev) => ({ ...prev, originPlace: place }));
  };

  const handleDestinationPlaceSelect = (place: PlacePrediction) => {
    setPlaceData((prev) => ({ ...prev, destinationPlace: place }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        // Check if date is valid (tomorrow or later)
        const selectedDate = new Date(tripData.date);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Reset time to start of day

        const isDateValid = tripData.date && selectedDate >= tomorrow;

        return (
          tripData.origin &&
          tripData.destination &&
          placeData.originPlace &&
          placeData.destinationPlace &&
          isDateValid &&
          tripData.time
        );
      case 2:
        return (
          tripData.vehicleType &&
          (tripData.payloadType === 'PARCEL'
            ? tripData.parcelWeight
            : tripData.passengerCount)
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4 text-center">
          <h1 className="text-3xl font-bold">Publish Your Trip</h1>
          <p className="text-muted-foreground">
            Share your journey and help others travel sustainably
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-muted-foreground text-xs">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="bg-border mx-4 hidden h-px w-12 sm:block" />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <AutocompleteInput
                      placeholder="Origin city"
                      value={tripData.origin}
                      onChange={(value) =>
                        setTripData((prev) => ({
                          ...prev,
                          origin: value,
                        }))
                      }
                      onPlaceSelect={handleOriginPlaceSelect}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <AutocompleteInput
                      placeholder="Destination city"
                      value={tripData.destination}
                      onChange={(value) =>
                        setTripData((prev) => ({
                          ...prev,
                          destination: value,
                        }))
                      }
                      onPlaceSelect={handleDestinationPlaceSelect}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <div className="relative">
                      <Calendar className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        type="date"
                        className="pl-10"
                        value={tripData.date}
                        min={(() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          return tomorrow.toISOString().split('T')[0];
                        })()}
                        onChange={(e) =>
                          setTripData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                    </div>
                    {tripData.date &&
                      (() => {
                        const selectedDate = new Date(tripData.date);
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);

                        if (selectedDate < tomorrow) {
                          return (
                            <p className="text-destructive text-sm">
                              Please select a date from tomorrow onwards
                            </p>
                          );
                        }
                        return null;
                      })()}
                  </div>
                  <div className="space-y-2">
                    <Label>Departure time</Label>
                    <Input
                      type="time"
                      value={tripData.time}
                      onChange={(e) =>
                        setTripData((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Vehicle type</Label>
                    <Select
                      value={tripData.vehicleType}
                      onValueChange={(value) =>
                        setTripData((prev) => ({ ...prev, vehicleType: value }))
                      }
                    >
                      <SelectTrigger>
                        <div className="flex items-center">
                          <Car className="text-muted-foreground mr-2 h-4 w-4" />
                          <SelectValue placeholder="Select vehicle" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAR">Car</SelectItem>
                        <SelectItem value="VAN">Van</SelectItem>
                        <SelectItem value="TRUCK">Truck</SelectItem>
                        <SelectItem value="BIKE">Motorcycle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vehicle make/model (optional)</Label>
                  <Input
                    placeholder="e.g., Honda Accord, Toyota Camry"
                    value={tripData.vehicleMake}
                    onChange={(e) =>
                      setTripData((prev) => ({
                        ...prev,
                        vehicleMake: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  <Label>Payload Type</Label>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                        tripData.payloadType === 'PARCEL'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() =>
                        setTripData((prev) => ({
                          ...prev,
                          payloadType: 'PARCEL',
                          passengerCount: '', // Clear passenger count when switching
                        }))
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            tripData.payloadType === 'PARCEL'
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}
                        />
                        <div>
                          <div className="font-medium">Parcel Delivery</div>
                          <div className="text-muted-foreground text-sm">
                            Transport packages and items
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                        tripData.payloadType === 'PASSENGER'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() =>
                        setTripData((prev) => ({
                          ...prev,
                          payloadType: 'PASSENGER',
                          parcelWeight: '', // Clear parcel weight when switching
                        }))
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            tripData.payloadType === 'PASSENGER'
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}
                        />
                        <div>
                          <div className="font-medium">Passenger Transport</div>
                          <div className="text-muted-foreground text-sm">
                            Transport people
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {tripData.payloadType === 'PARCEL' && (
                    <div className="space-y-2">
                      <Label>Parcel Weight (kg)</Label>
                      <Input
                        type="number"
                        placeholder="Enter weight in kilograms"
                        value={tripData.parcelWeight}
                        onChange={(e) =>
                          setTripData((prev) => ({
                            ...prev,
                            parcelWeight: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}

                  {tripData.payloadType === 'PASSENGER' && (
                    <div className="space-y-2">
                      <Label>Number of Passengers</Label>
                      <Select
                        value={tripData.passengerCount}
                        onValueChange={(value) =>
                          setTripData((prev) => ({
                            ...prev,
                            passengerCount: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select passenger count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 passenger</SelectItem>
                          <SelectItem value="2">2 passengers</SelectItem>
                          <SelectItem value="3">3 passengers</SelectItem>
                          <SelectItem value="4">4 passengers</SelectItem>
                          <SelectItem value="5">5 passengers</SelectItem>
                          <SelectItem value="6">6 passengers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Trip description</Label>
                  <Textarea
                    placeholder="Tell passengers about your trip, vehicle amenities, rules, etc."
                    className="min-h-24"
                    value={tripData.description}
                    onChange={(e) =>
                      setTripData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-muted/50 space-y-4 rounded-lg p-6">
                  <h3 className="text-lg font-semibold">Trip Summary</h3>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div>
                        <div className="text-muted-foreground text-sm">
                          Route
                        </div>
                        <div className="font-medium">
                          {placeData.originPlace?.structured_formatting
                            .main_text || tripData.origin}{' '}
                          →{' '}
                          {placeData.destinationPlace?.structured_formatting
                            .main_text || tripData.destination}
                        </div>
                        {(placeData.originPlace?.structured_formatting
                          .secondary_text ||
                          placeData.destinationPlace?.structured_formatting
                            .secondary_text) && (
                          <div className="text-muted-foreground mt-1 text-xs">
                            {
                              placeData.originPlace?.structured_formatting
                                .secondary_text
                            }{' '}
                            →{' '}
                            {
                              placeData.destinationPlace?.structured_formatting
                                .secondary_text
                            }
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-muted-foreground text-sm">
                          Date & Time
                        </div>
                        <div className="font-medium">
                          {new Date(tripData.date).toLocaleDateString()} at{' '}
                          {tripData.time}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-sm">
                          Vehicle
                        </div>
                        <div className="font-medium">
                          {tripData.vehicleType.charAt(0) +
                            tripData.vehicleType.slice(1).toLowerCase()}{' '}
                          {tripData.vehicleMake && `(${tripData.vehicleMake})`}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3"></div>
                  </div>

                  {tripData.description && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-muted-foreground mb-2 text-sm">
                          Description
                        </div>
                        <p className="text-sm">{tripData.description}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                  <h4 className="mb-2 font-medium">Before you publish:</h4>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Make sure your trip details are accurate</li>
                    <li>• Be responsive to passenger requests</li>
                    <li>• Follow safety guidelines and local regulations</li>
                    <li>
                      • You can edit or cancel your trip anytime before
                      departure
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={!isStepValid() || isPublishing}
              className="flex items-center space-x-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <span>Publish Trip</span>
                  <Check className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
