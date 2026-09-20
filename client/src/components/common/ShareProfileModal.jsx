import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Share2,
  Copy,
  Check,
  X,
  QrCode,
  Download,
  ExternalLink,
  Sparkles,
  Smartphone,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Calendar,
  Layers,
  Link as LinkIcon,
} from 'lucide-react';
import {
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaInstagram,
  FaTelegramPlane,
  FaEnvelope,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { toast } from 'sonner';

const ShareProfileModal = ({
  isOpen,
  onClose,
  counselor,
  bookingUrl: customBookingUrl,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!counselor) return null;

  const counselorId = counselor._id || counselor.id;
  const counselorName = counselor.fullName || 'Counselor';
  const counselorUsername = counselor.username ? `@${counselor.username}` : '';
  const specializations = Array.isArray(counselor.specialization)
    ? counselor.specialization
    : counselor.specialization
    ? [counselor.specialization]
    : ['Professional Counselling'];
  
  const specializationText = specializations.join(', ');
  const experienceYears = counselor.experienceYears ?? 0;
  const experienceLevel = counselor.experienceLevel || 'Professional';

  const bookingUrl =
    customBookingUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/book-counselor/${counselorId}`
      : '');

  const shareTitle = `Book a Session with ${counselorName} | Solvit`;
  
  // Clean, formatted card-style text message for social media & instant sharing
  const formattedShareMessage = `🌟 *Book a 1-on-1 Counselling Session with ${counselorName}*
🩺 *Specialization:* ${specializationText}
💼 *Experience:* ${experienceYears}+ Years (${experienceLevel})
🌐 *Platform:* Solvit
━━━━━━━━━━━━━━━━━━━━
🔗 *Book your session directly here:*
${bookingUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(bookingUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = bookingUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedLink(true);
      toast.success('Booking link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link.');
    }
  };

  const handleCopyFullCard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(formattedShareMessage);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = formattedShareMessage;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedCard(true);
      toast.success('Profile card text & link copied!', {
        description: 'You can now paste the full profile description into messages or social posts.',
      });
      setTimeout(() => setCopiedCard(false), 2500);
    } catch (err) {
      console.error('Failed to copy card:', err);
      toast.error('Failed to copy card details.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: formattedShareMessage,
          url: bookingUrl,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      handleCopyFullCard();
    }
  };

  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
    bookingUrl
  )}&format=svg`;

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
          bookingUrl
        )}&format=png`
      );
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${counselorName.replace(/\s+/g, '_')}_Booking_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('QR Code downloaded successfully!');
    } catch (err) {
      console.error('Failed to download QR code:', err);
      toast.error('Could not download QR code. Please try again.');
    }
  };

  const socialChannels = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-[#25D366] hover:bg-[#20ba59] text-white',
      badgeColor: 'bg-[#25D366]/10 text-[#25D366]',
      onClick: () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          formattedShareMessage
        )}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'X (Twitter)',
      icon: FaXTwitter,
      color: 'bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200',
      badgeColor: 'bg-neutral-900/10 text-neutral-900 dark:text-white',
      onClick: () => {
        const tweetText = `Book a 1-on-1 counseling session with ${counselorName} (${specializationText}) on Solvit:`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          tweetText
        )}&url=${encodeURIComponent(bookingUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      badgeColor: 'bg-[#1877F2]/10 text-[#1877F2]',
      onClick: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          bookingUrl
        )}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-[#0A66C2] hover:bg-[#095196] text-white',
      badgeColor: 'bg-[#0A66C2]/10 text-[#0A66C2]',
      onClick: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          bookingUrl
        )}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      color: 'bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] hover:opacity-90 text-white',
      badgeColor: 'bg-[#E1306C]/10 text-[#E1306C]',
      onClick: async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: shareTitle,
              text: formattedShareMessage,
              url: bookingUrl,
            });
            return;
          } catch (err) {
            if (err.name === 'AbortError') return;
          }
        }
        await handleCopyLink();
        toast.info('Instagram Link Copied!', {
          description:
            'Paste this link in your Instagram Bio, Story sticker, or Direct Messages to let clients book with you.',
          duration: 6000,
        });
      },
    },
    {
      name: 'Telegram',
      icon: FaTelegramPlane,
      color: 'bg-[#229ED9] hover:bg-[#1e8cc1] text-white',
      badgeColor: 'bg-[#229ED9]/10 text-[#229ED9]',
      onClick: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(
          bookingUrl
        )}&text=${encodeURIComponent(formattedShareMessage)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      color: 'bg-[#EA4335] hover:bg-[#d9382b] text-white',
      badgeColor: 'bg-[#EA4335]/10 text-[#EA4335]',
      onClick: () => {
        const url = `mailto:?subject=${encodeURIComponent(
          shareTitle
        )}&body=${encodeURIComponent(formattedShareMessage)}`;
        window.location.href = url;
      },
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && onClose) onClose(); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-primary-200/50 dark:border-primary-800/40 shadow-2xl rounded-2xl">
        {/* Header with gradient banner */}
        <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-blue-600 text-white p-5 sm:p-6 relative overflow-hidden rounded-t-2xl">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          {/* Custom Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/20 hover:bg-white/35 active:scale-95 text-white backdrop-blur-md border border-white/25 transition-all shadow-md cursor-pointer hover:rotate-90 duration-200"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-3 relative z-10 pr-8">
            <div className="p-3 bg-white/15 backdrop-blur-md rounded-xl shadow-inner border border-white/20">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                Share Counselor Profile
              </DialogTitle>
              <DialogDescription className="text-primary-100 text-xs sm:text-sm mt-0.5">
                Share your personalized booking card and link across social media platforms.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* ==================================================== */}
          {/* 📇 COUNSELOR SHARE CARD (PHOTO ON LEFT, DETAILS ON RIGHT) */}
          {/* ==================================================== */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                Profile Card Preview
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(bookingUrl, '_blank')}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 gap-1.5 h-7 px-2"
                title="Preview public booking page"
              >
                <span>View Booking Page</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>

            <div className="relative rounded-2xl bg-gradient-to-br from-white via-primary-50/20 to-blue-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-primary-200/70 dark:border-primary-800/40 p-4 sm:p-5 shadow-lg overflow-hidden transition-all">
              {/* Subtle top-right accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-bl-full pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                {/* LEFT SIDE: Counselor Profile Picture */}
                <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-primary-500/20 shadow-xl border-2 border-white dark:border-neutral-800">
                    <AvatarImage
                      src={counselor.profilePicture}
                      alt={counselorName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary-700 to-primary-600 text-white font-bold">
                      {counselorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-900 rounded-full p-0.5 shadow-md">
                    <BadgeCheck className="w-5 h-5 text-blue-600 fill-blue-100 dark:fill-blue-950" />
                  </div>
                </div>

                {/* RIGHT SIDE: Counselor Details Description */}
                <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left w-full">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-neutral-100 truncate">
                        {counselorName}
                      </h3>
                      {counselorUsername && (
                        <span className="text-xs text-neutral-400 font-normal">
                          {counselorUsername}
                        </span>
                      )}
                    </div>

                    {/* Experience & Level Badges */}
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="text-[11px] px-2 py-0.5 bg-primary-100/80 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-medium border border-primary-200/50"
                      >
                        <Briefcase className="w-3 h-3 mr-1" />
                        {experienceYears}+ Years Exp.
                      </Badge>
                      {experienceLevel && (
                        <Badge
                          variant="outline"
                          className="text-[11px] px-2 py-0.5 border-primary-300 dark:border-primary-800 text-neutral-700 dark:text-neutral-300"
                        >
                          {experienceLevel}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Specializations List */}
                  <div className="flex items-center justify-center sm:justify-start gap-1 flex-wrap">
                    {specializations.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center text-[10.5px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      >
                        {spec}
                      </span>
                    ))}
                    {specializations.length > 3 && (
                      <span className="text-[10.5px] text-neutral-400 px-1">
                        +{specializations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer: Quick Copy Card Text Action */}
              <div className="mt-4 pt-3 border-t border-primary-100/80 dark:border-neutral-800/80 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Verified Solvit Profile
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyFullCard}
                  className="h-7 text-xs gap-1.5 border-primary-200 dark:border-primary-800 hover:bg-primary-50 text-primary-700 dark:text-primary-300 ml-auto"
                >
                  {copiedCard ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Card!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Card Details</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Social Platforms Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                Share Directly To
              </span>
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  More Apps (Native)
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {socialChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <motion.button
                    key={channel.name}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={channel.onClick}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 group"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl ${channel.color} flex items-center justify-center shadow-md transition-shadow group-hover:shadow-lg`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 text-center truncate max-w-full">
                      {channel.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Direct Booking Link Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              Direct Booking Link
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  readOnly
                  value={bookingUrl}
                  className="pr-10 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-mono select-all focus-visible:ring-primary-500 text-neutral-700 dark:text-neutral-200"
                />
              </div>
              <Button
                onClick={handleCopyLink}
                className={`gap-1.5 flex-shrink-0 transition-all duration-300 ${
                  copiedLink
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="pt-1 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowQr((prev) => !prev)}
                className="text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2 py-2"
              >
                <QrCode className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>{showQr ? 'Hide QR Code' : 'Generate QR Code for offline/print'}</span>
              </button>
            </div>

            <AnimatePresence>
              {showQr && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-center gap-5 text-center sm:text-left">
                    <div className="p-2.5 bg-white rounded-xl shadow-md border border-neutral-100 flex-shrink-0">
                      <img
                        src={qrCodeApiUrl}
                        alt="Booking Profile QR Code"
                        className="w-32 h-32 rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-2 max-w-xs">
                      <h5 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                        Scan to Book Directly
                      </h5>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Download this QR code to add to your visiting cards, posters, WhatsApp status, or Instagram stories.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadQr}
                        className="gap-1.5 text-xs border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download PNG
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProfileModal;
