// PreSessionGuidelines.jsx - Footer Inside Scrollable Content

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Wifi, 
  Clock, 
  Shield, 
  AlertTriangle,
  FileWarning,
  Headphones,
  Video,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';

export default function PreSessionGuidelines({ isOpen, onClose, onProceed, sessionDetails }) {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleProceed = () => {
    if (acknowledged) {
      onProceed();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh]">
        {/* Header */}
        <DialogHeader className="space-y-3 pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Video className="h-6 w-6 text-primary" />
            </div>
            Session Guidelines
          </DialogTitle>
          
        </DialogHeader>

        <Separator />

        {/* Scrollable Content - INCLUDING FOOTER */}
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6 py-2">
            
            {/* Important Notice */}
            <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/50">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-sm text-amber-900 dark:text-amber-100 ml-2">
                <strong>Important:</strong> Please read all sections carefully. You must acknowledge understanding before joining the session.
              </AlertDescription>
            </Alert>

            {/* Section 1: Session Readiness */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 1: Session Readiness</h3>
                  <p className="text-sm text-muted-foreground">Make sure you're ready before joining</p>
                </div>
              </div>
              
              <div className="grid gap-3 ml-14">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:border-primary/50 transition-colors">
                  <Wifi className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Ensure a stable internet connection</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Test your connection speed beforehand</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:border-primary/50 transition-colors">
                  <Headphones className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Use headphones for better privacy</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Prevents echo and ensures confidentiality</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:border-primary/50 transition-colors">
                  <Shield className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Sit in a quiet, private space</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Minimize background noise and interruptions</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:border-primary/50 transition-colors">
                  <Clock className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Join on time</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Late joins may shorten the session (time lost may not be recoverable)</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 2: Session Guidelines */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 2: Session Guidelines</h3>
                  <p className="text-sm text-muted-foreground">During the session</p>
                </div>
              </div>
              
              <div className="ml-14 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                  <p className="text-sm"><strong>Be respectful and honest</strong> — Open communication helps your counselor assist you better</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                  <p className="text-sm"><strong>This is a professional counseling session, not emergency support</strong> — For emergencies, contact emergency services</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                  <p className="text-sm"><strong>Avoid multitasking or distractions</strong> — Give your full attention to the session</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                  <p className="text-sm"><strong>Sessions are time-bound and end automatically</strong> — Make the most of your allocated time</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 3: Privacy & Safety */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 3: Privacy & Safety</h3>
                  <p className="text-sm text-muted-foreground">Your privacy matters</p>
                </div>
              </div>
              
              <div className="ml-14 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                  <p className="text-sm"><strong>Sessions are not recorded without consent</strong> — Your conversations remain private</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                  <p className="text-sm"><strong>Do not share personal contact details</strong> — Keep all communication within the platform</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                  <p className="text-sm"><strong>The platform ensures secure video communication</strong> — End-to-end encrypted connections</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 4: Technical Disclaimer */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 4: Technical Disclaimer</h3>
                  <p className="text-sm text-muted-foreground">In case of technical issues</p>
                </div>
              </div>
              
              <div className="ml-14 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <p className="text-sm"><strong>If disconnected, rejoin using the same link</strong> — Your session remains active</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <p className="text-sm"><strong>If issues persist, contact support</strong>   — support@solvitcounselling.com</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <p className="text-sm"><strong>Session time lost due to late joining may not be recoverable</strong> — Join on time to get full session duration</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 5: Report Issues or Concerns */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                  <FileWarning className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 5: Report Issues or Concerns</h3>
                  <p className="text-sm text-muted-foreground">If you face any difficulties during the session</p>
                </div>
              </div>
              
              <div className="ml-14 space-y-4">
                <Alert className="border-red-300 bg-red-50 dark:bg-red-950/50">
                  <AlertDescription className="text-sm text-red-900 dark:text-red-100">
                    <strong>Important:</strong> If you experience any unprofessional behavior, technical issues caused by the counselor, 
                    or other concerns during your session, you can raise a dispute.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <p className="text-sm font-semibold">How to raise a dispute:</p>
                  <div className="space-y-2.5 pl-3">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                      <p className="text-sm">Navigate to the <strong>"Raise Issue"</strong> tab in your dashboard</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                      <p className="text-sm">You can submit disputes <strong>only after the scheduled session time ends</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                      <p className="text-sm">Provide detailed description of the issue</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold mb-3">For better dispute resolution, you can attach:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span><strong>Screen recording</strong> of the issue</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span><strong>Screenshots</strong> showing the problem</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span><strong>Audio recordings</strong> (if applicable)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span><strong>PDF or Word documents</strong></span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Note: Gathering evidence helps our support team investigate and resolve your concern faster.
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* FOOTER CONTENT - NOW INSIDE SCROLL AREA */}
            <div className="space-y-4 pb-4">
              {/* MANDATORY ACKNOWLEDGMENT */}
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950/50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertDescription className="ml-2">
                  <p className="font-bold text-red-900 dark:text-red-100 text-base">
                    ✅ MANDATORY ACKNOWLEDGMENT
                  </p>
                </AlertDescription>
              </Alert>

              <div className={`flex items-start gap-4 p-5 rounded-lg border-2 transition-all ${
                acknowledged 
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-500' 
                  : 'bg-muted/50 border-muted-foreground/30'
              }`}>
                <Checkbox 
                  id="acknowledge" 
                  checked={acknowledged}
                  onCheckedChange={setAcknowledged}
                  className="mt-1 h-5 w-5"
                />
                <label 
                  htmlFor="acknowledge" 
                  className="text-sm font-medium leading-relaxed cursor-pointer select-none flex-1"
                >
                  I have read and understood all the session guidelines (Section 1-5) including session readiness, 
                  conduct expectations, privacy policy, technical disclaimers, and dispute reporting process. 
                  I agree to proceed with the session.
                </label>
              </div>

              {!acknowledged && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="font-medium">You must acknowledge the guidelines to join the session</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 w-full pt-2">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleProceed} 
                  disabled={!acknowledged}
                  className="flex-1 h-11 font-semibold"
                >
                  {acknowledged ? 'Join Session Now →' : 'Please Read & Accept'}
                </Button>
              </div>
            </div>

          </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  );
}
