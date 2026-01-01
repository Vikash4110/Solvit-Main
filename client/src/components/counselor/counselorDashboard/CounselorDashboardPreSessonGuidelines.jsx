// CounselorPreSessionGuidelines.jsx - Professional Guidelines for Counselors

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
  FileText,
  Headphones,
  Video,
  CheckCircle2,
  AlertCircle,
  Users,
  UserCheck,
  BriefcaseMedical,
  PhoneCall,
  Ban,
} from 'lucide-react';

export default function CounselorPreSessionGuidelines({
  isOpen,
  onClose,
  onProceed,
  sessionDetails,
}) {
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
              <BriefcaseMedical className="h-6 w-6 text-primary" />
            </div>
            Professional Session Guidelines
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
                <strong>Important:</strong> As a mental health professional, please review these
                guidelines carefully before starting the session. Your acknowledgment is mandatory.
              </AlertDescription>
            </Alert>

            {/* Section 1: Professional Readiness */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                  <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 1: Professional Readiness</h3>
                  <p className="text-sm text-muted-foreground">
                    Prepare yourself and your environment
                  </p>
                </div>
              </div>

              <div className="grid gap-3 ml-14">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:border-primary/50 transition-colors">
                  <Wifi className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">
                      Ensure stable internet and technical setup
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Test camera, microphone, and connection before joining
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:border-primary/50 transition-colors">
                  <Shield className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Maintain a professional, private setting</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Quiet space with appropriate background, free from interruptions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:border-primary/50 transition-colors">
                  <Headphones className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Use professional audio equipment</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Headphones recommended for privacy and audio clarity
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:border-primary/50 transition-colors">
                  <FileText className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Review client information beforehand</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Check session notes, previous history, and treatment plans
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:border-primary/50 transition-colors">
                  <Clock className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Join on time and be punctual</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Start and end sessions as scheduled. Late starts affect client experience
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 2: Professional Conduct */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                  <BriefcaseMedical className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 2: Professional Conduct</h3>
                  <p className="text-sm text-muted-foreground">
                    Maintain ethical standards throughout the session
                  </p>
                </div>
              </div>

              <div className="ml-14 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Provide professional, empathetic counseling</strong> — Maintain
                    therapeutic rapport and active listening
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Maintain professional boundaries</strong> — No personal contact
                    information sharing outside the platform
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Be respectful, non-judgmental, and culturally sensitive</strong> —
                    Create a safe space for clients
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Avoid distractions and multitasking</strong> — Give your full attention
                    to the client
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Dress professionally and appropriately</strong> — Appearance matters in
                    maintaining credibility
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 3: Session Management */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 3: Session Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Time management and session structure
                  </p>
                </div>
              </div>

              <div className="ml-14 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Adhere to scheduled time limits</strong> — Sessions end automatically at
                    the allocated time
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Manage session flow effectively</strong> — Balance listening,
                    assessment, and intervention
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Document session notes promptly</strong> — Update client records after
                    each session
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>If client is late, wait 10 minutes</strong> — Contact support if no-show
                    occurs
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 4: Client Privacy & Confidentiality */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 rounded-lg">
                  <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 4: Client Privacy & Confidentiality</h3>
                  <p className="text-sm text-muted-foreground">Protecting client information</p>
                </div>
              </div>

              <div className="ml-14 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Do not record sessions without explicit client consent</strong> —
                    Platform does not record by default
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Maintain strict confidentiality</strong> — Client information must not
                    be shared outside the platform
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Secure your environment</strong> — Ensure no one else can hear or view
                    the session
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Use platform communication only</strong> — Do not exchange personal
                    phone numbers or emails
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 5: Emergency & Crisis Management */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                  <PhoneCall className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 5: Emergency & Crisis Management</h3>
                  <p className="text-sm text-muted-foreground">Handling emergency situations</p>
                </div>
              </div>

              <div className="ml-14 space-y-4">
                <Alert className="border-red-300 bg-red-50 dark:bg-red-950/50">
                  <AlertDescription className="text-sm text-red-900 dark:text-red-100">
                    <strong>Critical:</strong> If a client expresses suicidal ideation, self-harm
                    intent, or is in immediate danger, follow emergency protocols immediately.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>This platform is not for emergency mental health crises</strong> —
                      Direct clients to emergency services (911, crisis hotlines)
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Assess risk and take appropriate action</strong> — Document and report
                      to platform support immediately
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Know your duty to warn obligations</strong> — Report threats of harm
                      per legal and ethical requirements
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Have emergency contact protocols ready</strong> — Keep crisis
                      resources and support numbers accessible
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 6: Technical Issues */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 6: Technical Issues</h3>
                  <p className="text-sm text-muted-foreground">Handling technical difficulties</p>
                </div>
              </div>

              <div className="ml-14 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>If disconnected, rejoin immediately</strong> — The session link remains
                    active during scheduled time
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Technical issues on your end may affect ratings</strong> — Ensure proper
                    setup to avoid disputes
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Contact support for persistent problems</strong> — support@solvitcounselling.com
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <p className="text-sm">
                    <strong>Session time continues during technical delays</strong> — Be prepared to
                    minimize interruptions
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 7: Platform Policies & Disputes */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-950 rounded-lg">
                  <Ban className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Section 7: Platform Policies & Disputes</h3>
                  <p className="text-sm text-muted-foreground">
                    Understanding your responsibilities
                  </p>
                </div>
              </div>

              <div className="ml-14 space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-600 mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Clients can raise disputes after sessions</strong> — Professional
                      conduct is monitored and reviewed
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-600 mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Clients may submit evidence</strong> — Screenshots, recordings, or
                      documents supporting their complaint
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-600 mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Maintain professionalism to avoid disputes</strong> — Violations may
                      result in account suspension or termination
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-600 mt-2 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Session ratings affect your profile</strong> — Quality service
                      maintains your reputation
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/50 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Prohibited Actions
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-start gap-2">
                      <Ban className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
                      <span>Sharing personal contact information with clients</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
                      <span>Requesting additional payments outside the platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
                      <span>Unprofessional behavior, harassment, or discrimination</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Ban className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
                      <span>Recording sessions without explicit client consent</span>
                    </li>
                  </ul>
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
                    ✅ MANDATORY PROFESSIONAL ACKNOWLEDGMENT
                  </p>
                </AlertDescription>
              </Alert>

              <div
                className={`flex items-start gap-4 p-5 rounded-lg border-2 transition-all ${
                  acknowledged
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-500'
                    : 'bg-muted/50 border-muted-foreground/30'
                }`}
              >
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
                  I have read and understood all professional guidelines (Section 1-7) including
                  professional readiness, conduct standards, session management, client
                  confidentiality, emergency protocols, technical responsibilities, and platform
                  policies. I agree to maintain professional and ethical standards throughout this
                  session and acknowledge that violations may result in account actions.
                </label>
              </div>

              {!acknowledged && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="font-medium">
                    You must acknowledge these professional guidelines to start the session
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 w-full pt-2">
                <Button variant="outline" onClick={onClose} className="flex-1 h-11">
                  Cancel
                </Button>
                <Button
                  onClick={handleProceed}
                  disabled={!acknowledged}
                  className="flex-1 h-11 font-semibold"
                >
                  {acknowledged ? 'Start Session Now →' : 'Please Read & Accept'}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
