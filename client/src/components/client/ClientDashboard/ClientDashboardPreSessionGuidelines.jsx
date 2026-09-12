import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Wifi,
  Clock,
  Shield,
  ShieldCheck,
  AlertTriangle,
  FileWarning,
  Headphones,
  Video,
  CheckCircle2,
  AlertCircle,
  Mail,
  FileCheck,
  Check,
  Radio,
  FileUp,
  ExternalLink,
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
      <DialogContent
        size="xl"
        className="sm:max-w-3xl md:max-w-4xl p-0 max-h-[92vh] md:max-h-[88vh] flex flex-col overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl rounded-2xl sm:rounded-3xl"
      >
        {/* Header - Fixed at Top */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 pr-14 sm:pr-16">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl shrink-0">
              <Video className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Session Guidelines
              </DialogTitle>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Please review these essential guidelines before joining your counseling session
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-5 space-y-6 overscroll-contain text-neutral-800 dark:text-neutral-200 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400">
          {/* Important Notice */}
          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-amber-300/80 bg-amber-50/70 dark:border-amber-700/50 dark:bg-amber-950/30">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong className="font-semibold text-amber-950 dark:text-amber-100">Important Notice:</strong>{' '}
              Please read all sections thoroughly. You are required to acknowledge and accept these guidelines before entering the video counseling room.
            </div>
          </div>

          {/* Section 1: Session Readiness */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 font-semibold text-xs shrink-0">
                1
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 1: Session Readiness
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Check your setup before joining
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-all group">
                <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Wifi className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Stable Internet Connection
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Ensure adequate bandwidth and test your connection beforehand.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-all group">
                <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Headphones className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Use Headphones for Privacy
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Eliminates audio echo and safeguards privacy on your end.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-all group">
                <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Quiet, Private Space
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Sit in a comfortable room free from background noise and interruptions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-all group">
                <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Join on Time
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Punctuality ensures you utilize your complete allocated counseling time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator className="opacity-60" />

          {/* Section 2: Session Guidelines */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 font-semibold text-xs shrink-0">
                2
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 2: Session Guidelines
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Expected conduct during the session
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Be respectful and honest:</strong> Open, truthful communication helps your counselor provide the most effective guidance.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Professional counseling, not emergency response:</strong> If you or someone you know is in immediate crisis or danger, please contact national emergency hotlines right away.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Avoid multitasking:</strong> Minimize distractions, close other browser tabs, and give your full attention to the consultation.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Sessions are time-bound:</strong> The session room automatically concludes at the scheduled end time.
                </p>
              </div>
            </div>
          </section>

          <Separator className="opacity-60" />

          {/* Section 3: Privacy & Safety */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-semibold text-xs shrink-0">
                3
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 3: Privacy & Safety
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your confidentiality is strictly protected
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">No recording without consent:</strong> Video sessions are strictly confidential and are never recorded without explicit, written mutual consent.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Platform-only communication:</strong> To safeguard your privacy, do not share personal phone numbers, home addresses, or off-platform payment info.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">End-to-End Secure Streaming:</strong> High-grade encryption protocols safeguard your video and audio stream at all times.
                </p>
              </div>
            </div>
          </section>

          <Separator className="opacity-60" />

          {/* Section 4: Technical Disclaimer */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 font-semibold text-xs shrink-0">
                4
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 4: Technical Disclaimer
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  What to do if unexpected issues arise
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30">
                <div className="h-2 w-2 rounded-full bg-amber-600 dark:bg-amber-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Disconnection recovery:</strong> If accidentally disconnected, simply refresh and rejoin using the same session button on your dashboard.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30">
                <div className="h-2 w-2 rounded-full bg-amber-600 dark:bg-amber-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Support assistance:</strong> If persistent connection problems occur, our team is available at{' '}
                  <span className="font-semibold text-primary underline underline-offset-2">support@solvitcounselling.com</span>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30">
                <div className="h-2 w-2 rounded-full bg-amber-600 dark:bg-amber-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Late joining:</strong> Session time lost due to late attendance cannot be extended past the scheduled slot.
                </p>
              </div>
            </div>
          </section>

          <Separator className="opacity-60" />

          {/* Section 5: Report Issues or Concerns */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 font-semibold text-xs shrink-0">
                5
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 5: Report Issues or Concerns
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Our dispute resolution and support process
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-sm text-rose-950 dark:text-rose-200 leading-relaxed">
                <strong className="font-semibold text-rose-900 dark:text-rose-100">Resolution Policy:</strong> If you experience any unprofessional behavior, misconduct, or severe technical disruption caused by the counselor, you can file an official dispute from your dashboard.
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  How to raise a dispute
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-1">1. Navigate</span>
                    Go to the <strong>"Raise Issue"</strong> tab on your dashboard.
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-1">2. Timing</span>
                    Submit dispute <strong>after</strong> scheduled time concludes.
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-1">3. Details</span>
                    Provide detailed facts and descriptions.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-2.5">
                  Supporting evidence you may attach
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-blue-100 dark:border-blue-900/30 text-neutral-800 dark:text-neutral-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">Screen Recording</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-blue-100 dark:border-blue-900/30 text-neutral-800 dark:text-neutral-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">Screenshots</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-blue-100 dark:border-blue-900/30 text-neutral-800 dark:text-neutral-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">Audio Notes</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-blue-100 dark:border-blue-900/30 text-neutral-800 dark:text-neutral-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">PDF Documents</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Footer with Acknowledgment & Action Controls */}
        <div className="px-5 sm:px-7 py-4 border-t border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-md shrink-0 space-y-3.5">
          {/* Mandatory Checkbox */}
          <div
            onClick={() => setAcknowledged(!acknowledged)}
            className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
              acknowledged
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-neutral-800/70 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400'
            }`}
          >
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={setAcknowledged}
              className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <label
              htmlFor="acknowledge"
              className="text-xs sm:text-sm font-medium leading-snug cursor-pointer flex-1 text-neutral-900 dark:text-neutral-100"
              onClick={(e) => e.stopPropagation()}
            >
              I have read and understood all session guidelines (Sections 1–5), including session readiness, conduct standards, privacy policies, technical disclaimers, and dispute procedures. I agree to proceed.
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-1/3 h-11 text-sm font-medium rounded-xl border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleProceed}
              disabled={!acknowledged}
              className={`w-full sm:w-2/3 h-11 text-sm font-semibold rounded-xl transition-all shadow-md ${
                acknowledged
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:shadow-primary/30'
                  : 'opacity-50 cursor-not-allowed bg-neutral-300 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {acknowledged ? 'Join Session Now →' : 'Accept Guidelines to Join'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
