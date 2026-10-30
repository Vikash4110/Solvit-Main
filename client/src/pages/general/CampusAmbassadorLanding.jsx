// pages/general/CampusAmbassadorLanding.jsx - Public Campus Ambassador Program Landing & Application

import { useState } from 'react';
import { toast } from 'sonner';
import {
  GraduationCap,
  Users,
  Percent,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  School,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Home/Footer';

export default function CampusAmbassadorLanding() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    degreeAndYear: '',
    upiId: '',
    reasonToJoin: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'Full name must be at least 3 characters.';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim().replace(/[\s-]/g, ''))) {
      errs.phone = 'Please enter a valid phone number with country code if applicable.';
    }
    if (!formData.collegeName.trim() || formData.collegeName.trim().length < 3) {
      errs.collegeName = 'College name is required.';
    }
    if (!formData.degreeAndYear.trim() || formData.degreeAndYear.trim().length < 2) {
      errs.degreeAndYear = 'Please provide your degree and year (e.g. B.Tech 3rd Year).';
    }
    if (!formData.upiId.trim() || !formData.upiId.includes('@')) {
      errs.upiId = 'Please enter a valid UPI ID (e.g. yourname@oksbi).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please resolve validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(API_ENDPOINTS.CAMPUS_AMBASSADOR_REGISTER, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        collegeName: formData.collegeName.trim(),
        degreeAndYear: formData.degreeAndYear.trim(),
        upiId: formData.upiId.trim(),
        reasonToJoin: formData.reasonToJoin.trim(),
      });

      if (response.data?.success) {
        setSubmitted(true);
        setSubmittedData(response.data.data);
        toast.success('Application submitted successfully!');
      } else {
        toast.error(response.data?.message || 'Failed to submit application.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'An unexpected error occurred during registration.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-32 pb-16 sm:pt-36 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-xs font-semibold shadow-xs">
            <GraduationCap className="w-4 h-4 text-primary-600" />
            <span>Solvit Campus Ambassador Program</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Champion Mental Wellness on Campus.
            <br />
            <span className="text-primary-600">Earn 5% on Every Session for 60 Days.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Represent Solvit at your university. Help your peers access professional, confidential emotional counseling and earn an ongoing 5% monthly revenue share on every session they complete during their first 60 days.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <a
              href="#apply"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md transition-colors"
            >
              Apply as Campus Ambassador
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. Program Highlights */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600">How The Program Works</h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Built for Transparency and Reliable Monthly Payouts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200/90 shadow-xs hover:border-primary-300 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">1. Frictionless Link Sharing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive your unique Solvit tracking link upon admin approval. When students open your link, they are automatically attributed to you without needing to type promo codes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 shadow-xs hover:border-primary-300 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">2. Multi-Session Revenue Share (60 Days)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Earn a flat 5% incentive on every session your referred student completes on Solvit for 60 days from their first booking.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 shadow-xs hover:border-primary-300 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">3. Direct Monthly UPI Settlements</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                All earnings accrue in an auditable ledger. On a monthly cycle, administrators review your accumulated balance and disburse payments directly to your registered UPI ID.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Registration Form Section */}
      <section id="apply" className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <Card className="border-slate-200/90 shadow-sm bg-white overflow-hidden rounded-2xl">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-linear-to-r from-slate-50/80 via-white to-primary-50/30">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Campus Ambassador Application
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Complete your student profile below. Our admissions team reviews and activates ambassador accounts within 24 to 48 hours.
            </p>
          </div>

          <CardContent className="p-6 sm:p-8">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you for applying, <span className="font-semibold text-slate-800">{submittedData?.fullName}</span>. Your application for <span className="font-semibold text-slate-800">{submittedData?.collegeName}</span> is currently under administrative review.
                </p>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 max-w-md mx-auto text-left text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span>Review Window: 24 - 48 business hours</span>
                  </div>
                  <p className="text-slate-500">
                    Once approved, your unique referral code and tracking link will be activated and sent to your registered email address ({submittedData?.email}).
                  </p>
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        phone: '',
                        collegeName: '',
                        degreeAndYear: '',
                        upiId: '',
                        reasonToJoin: '',
                      });
                    }}
                    className="text-xs"
                  >
                    Submit Another Application
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary-600" />
                    1. Personal Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amb-name" className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="amb-name"
                        placeholder="e.g. Rohit Sharma"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className={`h-10 text-sm border-slate-200 bg-white focus-visible:border-primary-500 focus-visible:ring-primary-500/20 ${
                          errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="amb-email" className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="amb-email"
                        type="email"
                        placeholder="e.g. rohit.sharma@college.edu"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`h-10 text-sm border-slate-200 bg-white focus-visible:border-primary-500 focus-visible:ring-primary-500/20 ${
                          errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="amb-phone" className="text-xs font-semibold text-slate-700 block mb-1.5">
                      WhatsApp / Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amb-phone"
                      placeholder="e.g. +91 9876543210"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`h-10 text-sm border-slate-200 bg-white focus-visible:border-primary-500 focus-visible:ring-primary-500/20 ${
                        errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* College & Academic Details */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <School className="w-3.5 h-3.5 text-primary-600" />
                    2. College & Academic Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amb-college" className="text-xs font-semibold text-slate-700 block mb-1.5">
                        College or University Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="amb-college"
                        placeholder="e.g. Delhi University / IIT Delhi"
                        value={formData.collegeName}
                        onChange={(e) => handleChange('collegeName', e.target.value)}
                        className={`h-10 text-sm border-slate-200 bg-white focus-visible:border-primary-500 focus-visible:ring-primary-500/20 ${
                          errors.collegeName ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.collegeName && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.collegeName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="amb-degree" className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Degree & Academic Year <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="amb-degree"
                        placeholder="e.g. B.Tech CSE, 3rd Year"
                        value={formData.degreeAndYear}
                        onChange={(e) => handleChange('degreeAndYear', e.target.value)}
                        className={`h-10 text-sm border-slate-200 bg-white focus-visible:border-primary-500 focus-visible:ring-primary-500/20 ${
                          errors.degreeAndYear ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.degreeAndYear && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.degreeAndYear}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payout Information */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-primary-600" />
                    3. Monthly Incentive Disbursement
                  </h3>

                  <div>
                    <Label htmlFor="amb-upi" className="text-xs font-semibold text-slate-700 block mb-1.5">
                      UPI ID for Payouts <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amb-upi"
                      placeholder="e.g. rohitsharma@okhdfcbank"
                      value={formData.upiId}
                      onChange={(e) => handleChange('upiId', e.target.value)}
                      className={`h-10 text-sm border-slate-200 bg-white font-mono focus-visible:border-primary-500 focus-visible:ring-primary-500/20 ${
                        errors.upiId ? 'border-red-500 focus-visible:ring-red-500' : ''
                      }`}
                    />
                    {errors.upiId ? (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.upiId}</p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Monthly 5% commission settlements will be directly transferred to this UPI address.
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="amb-reason" className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Why do you want to be a Solvit Campus Ambassador? (Optional)
                    </Label>
                    <Textarea
                      id="amb-reason"
                      rows={3}
                      placeholder="Tell us briefly about student clubs, outreach networks, or your interest in mental wellness..."
                      value={formData.reasonToJoin}
                      onChange={(e) => handleChange('reasonToJoin', e.target.value)}
                      className="text-sm border-slate-200 bg-white focus-visible:border-primary-500 focus-visible:ring-primary-500/20"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    By applying, you agree to Solvit’s Community Standards.
                  </p>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-10 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
