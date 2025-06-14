
'use client';
import { useState, useRef, useEffect, type ReactElement } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppShell from '@/components/layout/AppShell';
import { analyzeCowHealth, AnalyzeCowHealthOutput } from '@/ai/flows/cow-health-analysis';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, CheckCircle2, UploadCloud, Stethoscope, Camera, Video, XCircle, Info, ShieldAlert } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

// Helper function to convert File to Data URI
const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function HealthCheckPage() {
  const { t, currentLanguage } = useTranslations();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeCowHealthOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [inputMode, setInputMode] = useState<'file' | 'camera'>('file');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [photoDataForAnalysis, setPhotoDataForAnalysis] = useState<string | null>(null);
  const [languageOfLastAnalysis, setLanguageOfLastAnalysis] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Effect to re-run analysis if language changes while results are displayed
  useEffect(() => {
    const reAnalyzeForLanguageChange = async () => {
      if (analysisResult && photoDataForAnalysis && languageOfLastAnalysis && currentLanguage !== languageOfLastAnalysis) {
        setIsLoading(true);
        try {
          const result = await analyzeCowHealth({ photoDataUri: photoDataForAnalysis, language: currentLanguage });
          setAnalysisResult(result);
          setLanguageOfLastAnalysis(currentLanguage);
          toast({ title: t('healthCheck.success.analysisTitle'), description: t('healthCheck.success.analysisDescription'), variant: 'default' });
        } catch (error) {
          console.error('Error re-analyzing cow health for language change:', error);
          toast({ title: t('healthCheck.error.analysisTitle'), description: t('healthCheck.error.analysisDescription'), variant: 'destructive' });
          // Optionally clear results or revert to old language results if re-analysis fails
        } finally {
          setIsLoading(false);
        }
      }
    };
    reAnalyzeForLanguageChange();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, photoDataForAnalysis, analysisResult, languageOfLastAnalysis, t, toast]);


  const requestCameraPermission = async () => {
    setCameraError(null);
    setHasCameraPermission(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        let message = t('healthCheck.camera.errorGeneric');
        if (err instanceof Error) {
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                message = t('healthCheck.camera.errorPermissionDenied');
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                message = t('healthCheck.camera.errorNotFound');
            }
        }
        setCameraError(message);
        setHasCameraPermission(false);
        toast({ title: t('healthCheck.camera.errorTitle'), description: message, variant: 'destructive' });
      }
    } else {
      const message = t('healthCheck.camera.errorNotSupported');
      setCameraError(message);
      setHasCameraPermission(false);
      toast({ title: t('healthCheck.camera.errorTitle'), description: message, variant: 'destructive' });
    }
  };

  const clearPreviousAnalysis = () => {
    setAnalysisResult(null);
    setLanguageOfLastAnalysis(null);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      clearPreviousAnalysis();
      setPhotoDataForAnalysis(null);
      try {
        const dataUri = await fileToDataUri(file);
        setPreviewUrl(dataUri);
        setPhotoDataForAnalysis(dataUri);
      } catch (error) {
        console.error("Error converting file to data URI", error);
        toast({ title: t('healthCheck.error.fileConversionTitle'), description: t('healthCheck.error.fileConversionDescription'), variant: 'destructive' });
      }
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setPreviewUrl(dataUri);
        setPhotoDataForAnalysis(dataUri);
        setSelectedFile(null);
        clearPreviousAnalysis();
        setInputMode('file'); 

        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setHasCameraPermission(null); 
      }
    }
  };

  const handleSubmit = async () => {
    if (!photoDataForAnalysis) {
      toast({ title: t('healthCheck.error.noPhotoTitle'), description: t('healthCheck.error.noPhotoDescription'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    clearPreviousAnalysis(); 

    try {
      const result = await analyzeCowHealth({ photoDataUri: photoDataForAnalysis, language: currentLanguage });
      setAnalysisResult(result);
      setLanguageOfLastAnalysis(currentLanguage); // Store language of this analysis
      if (result.isCowDetected) {
        toast({ title: t('healthCheck.success.analysisTitle'), description: t('healthCheck.success.analysisDescription'), variant: 'default' });
      } else {
        toast({ title: t('healthCheck.warning.noCowDetectedTitle'), description: result.potentialHealthIssues || t('healthCheck.warning.noCowDetectedDescription'), variant: 'default' });
      }
    } catch (error) {
      console.error('Error analyzing cow health:', error);
      toast({ title: t('healthCheck.error.analysisTitle'), description: t('healthCheck.error.analysisDescription'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openCamera = () => {
    setInputMode('camera');
    setPreviewUrl(null);
    setPhotoDataForAnalysis(null);
    setSelectedFile(null);
    clearPreviousAnalysis();
    requestCameraPermission();
  }

  const closeCamera = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    setInputMode('file');
    setHasCameraPermission(null); 
    setCameraError(null);
  }


  return (
    <AppShell>
      <div className="space-y-8">
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Stethoscope className="w-8 h-8 mr-2" /> {t('healthCheck.title')}
            </CardTitle>
            <CardDescription>{t('healthCheck.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {inputMode === 'file' && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="cow-photo" className="text-base font-medium">{t('healthCheck.selectPhotoLabel')}:</Label>
                  <div className="mt-2 flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-secondary/50 hover:border-primary transition-colors">
                    <Input
                      id="cow-photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => document.getElementById('cow-photo')?.click()} className="flex flex-col items-center space-y-2 py-6 px-10 h-auto">
                      <UploadCloud className="w-10 h-10 text-primary" />
                      <span className="font-semibold text-sm">{selectedFile ? selectedFile.name : t('healthCheck.uploadPlaceholder')}</span>
                      <span className="text-xs text-muted-foreground">{t('healthCheck.fileTypes')}</span>
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={openCamera}
                  className="w-full"
                >
                  <Camera className="mr-2 h-5 w-5" /> {t('healthCheck.useCameraButton')}
                </Button>
              </div>
            )}

            {inputMode === 'camera' && (
              <div className="space-y-4">
                <div className="relative"> 
                  <video ref={videoRef} className="w-full aspect-video rounded-md border bg-muted" autoPlay muted playsInline />
                  
                  {hasCameraPermission === null && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-md">
                      <LoadingSpinner className="mr-2 mb-2" />
                      <p className="text-white">{t('healthCheck.camera.initializing')}</p>
                    </div>
                  )}
                  {hasCameraPermission === false && cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-md p-4">
                      <Alert variant="destructive" className="w-full max-w-sm">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t('healthCheck.camera.errorTitle')}</AlertTitle>
                        <AlertDescription>{cameraError}</AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>

                {hasCameraPermission === true && (
                  <Button onClick={handleCapturePhoto} className="mt-2 w-full" disabled={isLoading}>
                    <Camera className="mr-2 h-5 w-5" /> {t('healthCheck.capturePhotoButton')}
                  </Button>
                )}
                
                 <Button variant="outline" onClick={closeCamera} className="w-full">
                    <XCircle className="mr-2 h-5 w-5" /> {t('healthCheck.camera.closeButton')}
                </Button>
              </div>
            )}
             <canvas ref={canvasRef} className="hidden" />


            {previewUrl && inputMode === 'file' && ( 
              <div className="mt-4 text-center">
                <p className="text-sm font-medium mb-2">{t('healthCheck.previewLabel')}:</p>
                <Image
                  src={previewUrl}
                  alt={t('healthCheck.previewAlt')}
                  width={280}
                  height={280}
                  className="rounded-lg object-contain mx-auto border border-border"
                  data-ai-hint="cow farm animal"
                />
              </div>
            )}

            <Button onClick={handleSubmit} disabled={!photoDataForAnalysis || isLoading} className="w-full text-base py-3" size="lg">
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  {t('healthCheck.analyzingButton')}
                </>
              ) : (
                t('healthCheck.analyzeButton')
              )}
            </Button>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="image-guide">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
                <div className="flex items-center">
                    <Info className="w-5 h-5 mr-2 text-primary" />
                    {t('healthCheck.guide.title')}
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 text-sm">
              <p>{t('healthCheck.guide.intro')}</p>
              <ul className="list-disc space-y-2 pl-5">
                <li><strong>{t('healthCheck.guide.positioningTitle')}:</strong> {t('healthCheck.guide.positioningDesc')}</li>
                <li><strong>{t('healthCheck.guide.lightingTitle')}:</strong> {t('healthCheck.guide.lightingDesc')}</li>
                <li><strong>{t('healthCheck.guide.distanceTitle')}:</strong> {t('healthCheck.guide.distanceDesc')}</li>
                <li><strong>{t('healthCheck.guide.angleTitle')}:</strong> {t('healthCheck.guide.angleDesc')}</li>
                <li><strong>{t('healthCheck.guide.focusTitle')}:</strong> {t('healthCheck.guide.focusDesc')}</li>
              </ul>
              <div className="mt-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">{t('healthCheck.guide.exampleImageLabel')}</p>
                <Image
                  src="https://d39tecv29ke92n.cloudfront.net/assets/blog/body-condition-score-figure-3-a99997168eb6fc951ae1b066fc5fa4606cebb87bd4df368c5586e02737ddd14d.jpg"
                  alt={t('healthCheck.guide.exampleImageAlt')}
                  width={300}
                  height={200}
                  className="rounded-md object-contain mx-auto border border-border"
                  data-ai-hint="cow side view"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {analysisResult && (
          <Card className="shadow-sm border animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary">{t('healthCheck.results.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!analysisResult.isCowDetected && (
                <Alert variant="destructive">
                  <ShieldAlert className="h-5 w-5" />
                  <AlertTitle>{t('healthCheck.warning.noCowDetectedTitle')}</AlertTitle>
                  <AlertDescription>
                    {analysisResult.potentialHealthIssues || t('healthCheck.warning.noCowDetectedDescription')}
                  </AlertDescription>
                </Alert>
              )}

              {analysisResult.isCowDetected && analysisResult.bodyConditionScore !== undefined && (
                <div>
                  <h3 className="font-semibold text-lg flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" /> {t('healthCheck.results.bcs')}:
                  </h3>
                  <p className="text-2xl font-bold text-accent">{analysisResult.bodyConditionScore} / 5</p>
                </div>
              )}

              {analysisResult.isCowDetected && (
                 <div>
                  <h3 className="font-semibold text-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" /> {t('healthCheck.results.issues')}:
                  </h3>
                  <p className="whitespace-pre-wrap text-sm">
                    {analysisResult.potentialHealthIssues || t('healthCheck.results.noIssues')}
                  </p>
                </div>
              )}

              {analysisResult.isCowDetected && analysisResult.suggestedActionItems && (
                <div>
                  <h3 className="font-semibold text-lg flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" /> {t('healthCheck.results.actions')}:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 whitespace-pre-wrap text-sm">
                    {analysisResult.suggestedActionItems.split('\n').map((item, index) => item.trim() && <li key={index}>{item.replace(/^- /, '')}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

