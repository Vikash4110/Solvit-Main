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
  ShieldAlert,
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
  Lock,
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
      <DialogContent
        size="xl"
        className="sm:max-w-3xl md:max-w-4xl p-0 max-h-[92vh] md:max-h-[88vh] flex flex-col overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl rounded-2xl sm:rounded-3xl"
      >
        {/* Header - Fixed at Top */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 pr-14 sm:pr-16">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl shrink-0">
              <BriefcaseMedical className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Professional Session Guidelines
              </DialogTitle>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Standard clinical operating procedures and ethical guidelines for practitioners
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
              <strong className="font-semibold text-amber-950 dark:text-amber-100">Professional Notice:</strong>{' '}
              As a verified mental health practitioner, please review these clinical and platform conduct standards. Acknowledgment is mandatory prior to initiating the session.
            </div>
          </div>

          {/* Section 1: Professional Readiness */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 font-semibold text-xs shrink-0">
                1
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 1: Professional Readiness
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Prepare your environment and consultation equipment
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-all group">
                <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Wifi className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Technical Setup
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Test camera, microphone, and stable connection beforehand.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-all group">
                <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Private Workspace
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Quiet room with appropriate backdrop, zero third-party interruptions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-all group">
                <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Headphones className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Audio Equipment
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Dedicated headset recommended for clarity and acoustic confidentiality.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-all group">
                <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Client Records
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Review case history, previous notes, and treatment goals beforehand.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-all group sm:col-span-2 lg:col-span-2">
                <div className="p-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Punctuality
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Be online at the exact scheduled start time to establish rapport promptly.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator className="opacity-60" />

          {/* Section 2: Professional Conduct */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 font-semibold text-xs shrink-0">
                2
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 2: Professional Conduct
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Ethical standards and therapeutic rapport
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Empathetic counseling:</strong> Deliver thoughtful, professional guidance with active listening and non-judgmental stance.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Maintain strict boundaries:</strong> Do not solicit personal contact info or external channels outside Solvit.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Cultural sensitivity:</strong> Respect individual backgrounds, cultural context, and client autonomy.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Undivided attention:</strong> Refrain from multitasking, checking external screens, or answering other calls.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Professional attire:</strong> Present yourself with appropriate professional grooming and decorum.
                </p>
              </div>
            </div>
          </section>

          <Separator className="opacity-60" />

          {/* Section 3: Session Management */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 dark:bg-green-950/70 text-green-700 dark:text-green-400 font-semibold text-xs shrink-0">
                3
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 3: Session Management
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Time allocation and session flow
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Adhere to schedule:</strong> The video room automatically terminates when time expires.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Structured pacing:</strong> Balance intake, active dialogue, and closing recommendations within the window.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Timely documentation:</strong> Fill in post-session summaries and clinical notes promptly.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">10-Minute Waiting Window:</strong> If a client hasn't joined, wait 10 minutes in the room before reporting a no-show.
                </p>
              </div>
            </div>
          </section>

          <Separator className="opacity-60" />

          {/* Section 4: Client Privacy & Confidentiality */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 font-semibold text-xs shrink-0">
                4
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 4: Client Privacy & Confidentiality
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Safeguarding patient data and privacy
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">No recording without consent:</strong> Recording client sessions without mutual signed authorization is strictly prohibited.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Confidentiality compliance:</strong> Client disclosures are legally protected and cannot be shared.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Acoustic privacy:</strong> Ensure no family member or colleague can overhear consultation audio.
                </p>
              </div>
            </div>
          </section>

          <Separator className="opacity-60" />

          {/* Section 5: Emergency & Crisis Management */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 font-semibold text-xs shrink-0">
                5
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 5: Emergency & Crisis Management
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Crisis escalation and duty of care
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-sm text-red-950 dark:text-red-200 leading-relaxed">
                <strong className="font-semibold text-red-900 dark:text-red-100">Critical Crisis Protocol:</strong> If a client exhibits active suicidal ideation, intent for self-harm, or severe risk to others, invoke emergency crisis protocols immediately.
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
                  <PhoneCall className="h-4 w-4 text-red-600 dark:text-red-400 mt-1 shrink-0" />
                  <p className="text-sm leading-relaxed">
                    <strong className="text-neutral-900 dark:text-neutral-100">Non-emergency scope:</strong> Solvit is not an acute emergency crisis center. Provide appropriate national helpline numbers (e.g. 988 / 112 / Kiran 1800-599-0019) when immediate intervention is needed.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
                  <PhoneCall className="h-4 w-4 text-red-600 dark:text-red-400 mt-1 shrink-0" />
                  <p className="text-sm leading-relaxed">
                    <strong className="text-neutral-900 dark:text-neutral-100">Duty to Warn:</strong> Comply with legal mandates to report genuine imminent physical danger according to medical jurisprudence.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
                  <PhoneCall className="h-4 w-4 text-red-600 dark:text-red-400 mt-1 shrink-0" />
                  <p className="text-sm leading-relaxed">
                    <strong className="text-neutral-900 dark:text-neutral-100">Notify Support:</strong> Log an urgent escalation with platform administrators immediately after the incident.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator className="opacity-60" />

          {/* Section 6: Technical Issues */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-400 font-semibold text-xs shrink-0">
                6
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 6: Technical Issues
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Troubleshooting connectivity problems
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30">
                <div className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Instant Reconnection:</strong> If disconnected, rejoin immediately via the dashboard. The room stays alive during your booked session.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30">
                <div className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Quality Impact:</strong> Disconnections caused by counselor network instability can trigger client dispute filings.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30">
                <div className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400 mt-2 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Tech Support:</strong> Reach support at <span className="font-semibold text-primary underline underline-offset-2">support@solvitcounselling.com</span> for system assistance.
                </p>
              </div>
            </div>
          </section>

          <Separator className="opacity-60" />

          {/* Section 7: Platform Policies & Disputes */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 font-semibold text-xs shrink-0">
                7
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Section 7: Platform Policies & Disputes
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Prohibited actions and accountability standards
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2.5 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Strictly Prohibited Conduct
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-amber-200/60 dark:border-amber-900/30">
                    <Ban className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>Sharing personal contacts or socials</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-amber-200/60 dark:border-amber-900/30">
                    <Ban className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>Soliciting direct payments off-platform</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-amber-200/60 dark:border-amber-900/30">
                    <Ban className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>Unprofessional conduct or harassment</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-amber-200/60 dark:border-amber-900/30">
                    <Ban className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>Recording without mutual authorization</span>
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
              I have reviewed and understood all professional guidelines (Sections 1–7), including clinical readiness, ethical conduct, confidentiality, emergency protocols, and platform policies. I agree to uphold these standards throughout this session.
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
              {acknowledged ? 'Start Session Now →' : 'Accept Guidelines to Start'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
