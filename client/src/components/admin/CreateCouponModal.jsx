// components/admin/CreateCouponModal.jsx - Interactive Enterprise Coupon & Campaign Creation Dialog

import { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import {
  TicketPercent,
  Sparkles,
  Percent,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  Check,
  Clock,
  ShieldCheck,
  Search,
  X,
  UserCheck,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CreateCouponModal({ open, onOpenChange, onSuccess }) {
  const { createCouponAdmin, getCounselorsForCouponSelectorAdmin } = useAdminAuth();

  // Form State
  const initialFormData = {
    code: '',
    description: '',
    discountType: 'percentage', // 'percentage' | 'flat'
    discountValue: '',
    maxDiscountAmount: '',
    minOrderAmount: '',
    validFrom: dayjs().format('YYYY-MM-DDTHH:mm'),
    validUntil: dayjs().add(30, 'day').format('YYYY-MM-DDTHH:mm'),
    maxTotalUses: '',
    maxUsesPerUser: 1,
    firstBookingOnly: false,
    isAutoApplied: false,
    scopeToCounselors: false,
    applicableCounselors: [],
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Counselor selector state
  const [counselorsList, setCounselorsList] = useState([]);
  const [loadingCounselors, setLoadingCounselors] = useState(false);
  const [counselorSearch, setCounselorSearch] = useState('');

  // Fetch approved counselors when modal opens
  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
      setErrors({});
      setCounselorSearch('');
      fetchCounselors();
    }
  }, [open]);

  const fetchCounselors = async () => {
    setLoadingCounselors(true);
    try {
      const result = await getCounselorsForCouponSelectorAdmin();
      if (result.success && Array.isArray(result.data)) {
        setCounselorsList(result.data);
      }
    } catch (err) {
      console.error('Error fetching counselors:', err);
    } finally {
      setLoadingCounselors(false);
    }
  };

  // Field change handler
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Auto-uppercase code formatter
  const handleCodeChange = (e) => {
    const rawVal = e.target.value;
    const sanitized = rawVal.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 30);
    handleChange('code', sanitized);
  };

  // Generate random code helper
  const handleGenerateCode = () => {
    const prefixes = ['SOLV', 'PROMO', 'SAVE', 'CARE', 'FESTIVE', 'HEAL'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    const generated = `${prefix}${num}`;
    handleChange('code', generated);
  };

  // Quick validity duration preset
  const handleSetValidityPreset = (days) => {
    const from = formData.validFrom ? dayjs(formData.validFrom) : dayjs();
    const until = from.add(days, 'day').format('YYYY-MM-DDTHH:mm');
    handleChange('validUntil', until);
  };

  // Toggle counselor selection
  const handleToggleCounselor = (counselorId) => {
    setFormData((prev) => {
      const exists = prev.applicableCounselors.includes(counselorId);
      const updated = exists
        ? prev.applicableCounselors.filter((id) => id !== counselorId)
        : [...prev.applicableCounselors, counselorId];
      return { ...prev, applicableCounselors: updated };
    });
  };

  // Remove single counselor chip
  const handleRemoveCounselor = (counselorId) => {
    setFormData((prev) => ({
      ...prev,
      applicableCounselors: prev.applicableCounselors.filter((id) => id !== counselorId),
    }));
  };

  // Filtered counselors list memoized for performance
  const filteredCounselors = useMemo(() => {
    if (!counselorSearch.trim()) return counselorsList;
    const term = counselorSearch.toLowerCase();
    return counselorsList.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
    );
  }, [counselorsList, counselorSearch]);

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.code || formData.code.trim().length < 3) {
      newErrors.code = 'Coupon code must be at least 3 characters.';
    }

    if (!formData.description || formData.description.trim().length < 3) {
      newErrors.description = 'Campaign description is required (min 3 chars).';
    }

    const discountNum = Number(formData.discountValue);
    if (!formData.discountValue || isNaN(discountNum) || discountNum <= 0) {
      newErrors.discountValue = 'Please enter a valid positive discount value.';
    } else if (formData.discountType === 'percentage' && discountNum > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%.';
    }

    if (formData.maxDiscountAmount && Number(formData.maxDiscountAmount) <= 0) {
      newErrors.maxDiscountAmount = 'Max discount cap must be greater than 0.';
    }

    if (formData.minOrderAmount && Number(formData.minOrderAmount) < 0) {
      newErrors.minOrderAmount = 'Minimum order spend cannot be negative.';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Expiration date is required.';
    } else {
      const fromTime = new Date(formData.validFrom).getTime();
      const untilTime = new Date(formData.validUntil).getTime();
      if (untilTime <= fromTime) {
        newErrors.validUntil = 'Expiry date must be strictly later than start date.';
      }
    }

    if (formData.maxTotalUses && Number(formData.maxTotalUses) < 1) {
      newErrors.maxTotalUses = 'Total redemptions limit must be at least 1.';
    }

    if (formData.maxUsesPerUser && Number(formData.maxUsesPerUser) < 1) {
      newErrors.maxUsesPerUser = 'Per-user limit must be at least 1.';
    }

    if (formData.scopeToCounselors && formData.applicableCounselors.length === 0) {
      newErrors.applicableCounselors = 'Select at least one counselor or switch back to All Counselors.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        couponType: formData.firstBookingOnly
          ? 'first_booking'
          : formData.scopeToCounselors && formData.applicableCounselors.length > 0
          ? 'counselor_exclusive'
          : 'standard',
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount:
          formData.discountType === 'percentage' && formData.maxDiscountAmount
            ? Number(formData.maxDiscountAmount)
            : null,
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        maxTotalUses: formData.maxTotalUses ? parseInt(formData.maxTotalUses, 10) : null,
        maxUsesPerUser: parseInt(formData.maxUsesPerUser, 10) || 1,
        firstBookingOnly: Boolean(formData.firstBookingOnly),
        isAutoApplied: Boolean(formData.isAutoApplied),
        applicableCounselors: formData.scopeToCounselors ? formData.applicableCounselors : [],
        isActive: Boolean(formData.isActive),
      };

      const result = await createCouponAdmin(payload);
      if (result.success) {
        toast.success(result.message || `Coupon "${payload.code}" created successfully!`);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || 'Failed to create coupon.');
      }
    } catch (err) {
      console.error('Submit coupon error:', err);
      toast.error('An unexpected error occurred while saving the coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="xl"
        className="sm:max-w-4xl lg:max-w-4xl w-[95vw] max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl border-slate-200/90 shadow-2xl bg-white"
      >
        {/* Modal Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 bg-linear-to-r from-slate-50/90 via-white to-blue-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <TicketPercent className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                Create New Coupon
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Configure promotional rules, discount rates, validity windows, and target audience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body (Scrollable with clean padding) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Section 1: Campaign Identity */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                1. Campaign Identity
              </h3>
              <span className="text-[11px] text-slate-400">Step 1 of 4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Coupon Code */}
              <div>
                <div className="flex items-center justify-between h-7 mb-1.5">
                  <Label htmlFor="coupon-code" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    Coupon Code <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateCode}
                    className="h-6 px-2 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 rounded-md shrink-0"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Generate Random</span>
                  </Button>
                </div>
                <Input
                  id="coupon-code"
                  placeholder="e.g. NEWSTART, DIWALI25"
                  value={formData.code}
                  onChange={handleCodeChange}
                  className={`font-mono uppercase font-bold tracking-wider text-sm h-10 border-slate-200 bg-white focus-visible:border-blue-600 focus-visible:ring-blue-600/20 ${
                    errors.code ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                />
                <div className="h-4 mt-1">
                  {errors.code ? (
                    <p className="text-[11px] text-red-600 font-medium leading-none">{errors.code}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-none">
                      Uppercase letters, numbers, hyphens, and underscores only.
                    </p>
                  )}
                </div>
              </div>

              {/* Initial Status Toggle */}
              <div>
                <div className="flex items-center justify-between h-7 mb-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Initial Campaign Status
                  </Label>
                  <span className="text-[11px] text-slate-400">Kill-switch state</span>
                </div>
                <div className="flex items-center justify-between h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        formData.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-xs font-medium text-slate-700">
                      {formData.isActive ? 'Active (Ready to redeem)' : 'Draft / Inactive (Paused)'}
                    </span>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(val) => handleChange('isActive', val)}
                    className="data-[state=checked]:bg-emerald-600 cursor-pointer"
                  />
                </div>
                <div className="h-4 mt-1">
                  <p className="text-[11px] text-slate-400 leading-none">
                    Active coupons can be redeemed immediately upon publishing.
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Description */}
            <div>
              <div className="flex items-center justify-between h-7 mb-1.5">
                <Label htmlFor="coupon-desc" className="text-xs font-semibold text-slate-700">
                  Campaign Description <span className="text-red-500">*</span>
                </Label>
                <span className="text-[11px] text-slate-400">Shown to clients at checkout</span>
              </div>
              <Input
                id="coupon-desc"
                placeholder="e.g. 15% discount for first-time counseling sessions"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`h-10 border-slate-200 bg-white focus-visible:border-blue-600 focus-visible:ring-blue-600/20 ${
                  errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
              />
              <div className="h-4 mt-1">
                {errors.description && (
                  <p className="text-[11px] text-red-600 font-medium leading-none">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Discount Structure & Pricing */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Percent className="w-3.5 h-3.5 text-blue-600" />
                2. Discount Rules & Pricing
              </h3>
              <span className="text-[11px] text-slate-400">Step 2 of 4</span>
            </div>

            {/* Discount Type Radio Cards */}
            <div>
              <Label className="text-xs font-semibold text-slate-700 block mb-2">
                Discount Calculation Type <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleChange('discountType', 'percentage')}
                  onKeyDown={(e) => e.key === 'Enter' && handleChange('discountType', 'percentage')}
                  className={`relative flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.discountType === 'percentage'
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      formData.discountType === 'percentage'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Percent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">Percentage Discount (%)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">e.g. 15% off the total session fee</p>
                  </div>
                  {formData.discountType === 'percentage' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 absolute right-3.5 top-4" />
                  )}
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleChange('discountType', 'flat')}
                  onKeyDown={(e) => e.key === 'Enter' && handleChange('discountType', 'flat')}
                  className={`relative flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.discountType === 'flat'
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      formData.discountType === 'flat'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="font-bold text-lg">₹</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">Flat Rupee Discount (₹)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">e.g. Deduct ₹150 from session fee</p>
                  </div>
                  {formData.discountType === 'flat' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 absolute right-3.5 top-4" />
                  )}
                </div>
              </div>
            </div>

            {/* Inputs: Discount Value, Max Cap, Min Spend */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Discount Value */}
              <div>
                <div className="flex items-center justify-between h-7 mb-1.5">
                  <Label htmlFor="discount-val" className="text-xs font-semibold text-slate-700">
                    Discount Value <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[11px] text-slate-400">
                    {formData.discountType === 'percentage' ? 'Max 100%' : 'In ₹'}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="discount-val"
                    type="number"
                    min="1"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    placeholder={formData.discountType === 'percentage' ? 'e.g. 15' : 'e.g. 150'}
                    value={formData.discountValue}
                    onChange={(e) => handleChange('discountValue', e.target.value)}
                    className={`h-10 pr-9 border-slate-200 bg-white focus-visible:border-blue-600 focus-visible:ring-blue-600/20 font-semibold ${
                      errors.discountValue ? 'border-red-500' : ''
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {formData.discountType === 'percentage' ? '%' : '₹'}
                  </span>
                </div>
                <div className="h-4 mt-1">
                  {errors.discountValue ? (
                    <p className="text-[11px] text-red-600 font-medium leading-none">{errors.discountValue}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-none">
                      {formData.discountType === 'percentage' ? 'Value between 1 and 100%' : 'Amount in Indian Rupees'}
                    </p>
                  )}
                </div>
              </div>

              {/* Max Discount Cap (for Percentage) */}
              <div>
                <div className="flex items-center justify-between h-7 mb-1.5">
                  <Label htmlFor="max-cap" className="text-xs font-semibold text-slate-700">
                    Max Cap (₹)
                  </Label>
                  <span className="text-[11px] text-slate-400">
                    {formData.discountType === 'flat' ? 'Disabled' : 'Optional'}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="max-cap"
                    type="number"
                    min="1"
                    disabled={formData.discountType === 'flat'}
                    placeholder={formData.discountType === 'flat' ? 'N/A for flat' : 'e.g. 250'}
                    value={formData.maxDiscountAmount}
                    onChange={(e) => handleChange('maxDiscountAmount', e.target.value)}
                    className={`h-10 pr-9 border-slate-200 bg-white focus-visible:border-blue-600 focus-visible:ring-blue-600/20 disabled:bg-slate-100 disabled:text-slate-400 ${
                      errors.maxDiscountAmount ? 'border-red-500' : ''
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                </div>
                <div className="h-4 mt-1">
                  <p className="text-[11px] text-slate-400 leading-none">
                    {formData.discountType === 'flat' ? 'Disabled for flat discount' : 'Optional ceiling cap for %'}
                  </p>
                </div>
              </div>

              {/* Minimum Order Spend */}
              <div>
                <div className="flex items-center justify-between h-7 mb-1.5">
                  <Label htmlFor="min-spend" className="text-xs font-semibold text-slate-700">
                    Min Spend (₹)
                  </Label>
                  <span className="text-[11px] text-slate-400">Order floor</span>
                </div>
                <div className="relative">
                  <Input
                    id="min-spend"
                    type="number"
                    min="0"
                    placeholder="e.g. 300"
                    value={formData.minOrderAmount}
                    onChange={(e) => handleChange('minOrderAmount', e.target.value)}
                    className={`h-10 pr-9 border-slate-200 bg-white focus-visible:border-blue-600 focus-visible:ring-blue-600/20 ${
                      errors.minOrderAmount ? 'border-red-500' : ''
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                </div>
                <div className="h-4 mt-1">
                  <p className="text-[11px] text-slate-400 leading-none">Minimum session booking fee</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Target Audience & Scope */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                3. Target Audience & Behavior Rules
              </h3>
              <span className="text-[11px] text-slate-400">Step 3 of 4</span>
            </div>

            {/* Audience Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Booking Only */}
              <div className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="pr-3">
                  <p className="text-xs font-bold text-slate-800">First Booking Only</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Restricted strictly to new clients booking their very first counseling session.
                  </p>
                </div>
                <Switch
                  checked={formData.firstBookingOnly}
                  onCheckedChange={(val) => handleChange('firstBookingOnly', val)}
                  className="data-[state=checked]:bg-blue-600 cursor-pointer mt-0.5"
                />
              </div>

              {/* Auto-Apply in Modal */}
              <div className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="pr-3">
                  <p className="text-xs font-bold text-slate-800">Auto-Apply at Checkout</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Automatically fills in and applies when the booking modal opens for clients.
                  </p>
                </div>
                <Switch
                  checked={formData.isAutoApplied}
                  onCheckedChange={(val) => handleChange('isAutoApplied', val)}
                  className="data-[state=checked]:bg-blue-600 cursor-pointer mt-0.5"
                />
              </div>
            </div>

            {/* Counselor Scoping Toggle & List */}
            <div className="pt-1 space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div>
                  <p className="text-xs font-bold text-slate-800">Restrict to Specific Counselors</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formData.scopeToCounselors
                      ? 'Only valid when booking sessions with selected counselors.'
                      : 'Applicable platform-wide to all approved counselors.'}
                  </p>
                </div>
                <Switch
                  checked={formData.scopeToCounselors}
                  onCheckedChange={(val) => handleChange('scopeToCounselors', val)}
                  className="data-[state=checked]:bg-purple-600 cursor-pointer"
                />
              </div>

              {/* Counselor Multi-Selector */}
              {formData.scopeToCounselors && (
                <div className="p-4 border border-purple-200 rounded-xl bg-purple-50/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-purple-950">
                        Select Counselors
                      </Label>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] font-semibold">
                        {formData.applicableCounselors.length} selected
                      </Badge>
                    </div>
                    <div className="relative w-full sm:w-60">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <Input
                        placeholder="Search counselors..."
                        value={counselorSearch}
                        onChange={(e) => setCounselorSearch(e.target.value)}
                        className="h-8 pl-8 text-xs bg-white border-slate-200 focus-visible:border-purple-500"
                      />
                    </div>
                  </div>

                  {errors.applicableCounselors && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.applicableCounselors}</p>
                  )}

                  {/* Selected Counselor Chips */}
                  {formData.applicableCounselors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pt-1">
                      {formData.applicableCounselors.map((cId) => {
                        const counselor = counselorsList.find((c) => c._id === cId);
                        return (
                          <span
                            key={cId}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-purple-100 text-purple-900 border border-purple-200"
                          >
                            <span>{counselor?.fullName || 'Counselor'}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCounselor(cId)}
                              className="text-purple-600 hover:text-purple-900 ml-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <ScrollArea className="h-36 rounded-lg border border-slate-200 bg-white p-2">
                    {loadingCounselors ? (
                      <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        Loading counselors...
                      </div>
                    ) : filteredCounselors.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">No counselors match your search.</div>
                    ) : (
                      <div className="space-y-1">
                        {filteredCounselors.map((counselor) => {
                          const isSelected = formData.applicableCounselors.includes(counselor._id);
                          return (
                            <div
                              key={counselor._id}
                              onClick={() => handleToggleCounselor(counselor._id)}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                                isSelected
                                  ? 'bg-purple-100/80 text-purple-950 font-medium'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={counselor.profilePic} />
                                  <AvatarFallback className="text-[10px] bg-purple-100 text-purple-700 font-bold">
                                    {counselor.fullName ? counselor.fullName[0].toUpperCase() : 'C'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-slate-900">{counselor.fullName}</p>
                                  <p className="text-[10px] text-slate-400">{counselor.email}</p>
                                </div>
                              </div>
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-purple-600 border-purple-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-3" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Validity & Usage Limits */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                4. Validity Window & Usage Caps
              </h3>
              <span className="text-[11px] text-slate-400">Step 4 of 4</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Presets:</span>
              {[
                { label: '+7 Days', days: 7 },
                { label: '+14 Days', days: 14 },
                { label: '+30 Days', days: 30 },
                { label: '+60 Days', days: 60 },
                { label: '+90 Days', days: 90 },
              ].map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => handleSetValidityPreset(preset.days)}
                  className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between h-7 mb-1.5">
                  <Label htmlFor="valid-from" className="text-xs font-semibold text-slate-700">
                    Valid From
                  </Label>
                  <span className="text-[11px] text-slate-400">Start Date & Time</span>
                </div>
                <Input
                  id="valid-from"
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => handleChange('validFrom', e.target.value)}
                  className="h-10 text-xs border-slate-200 bg-white focus-visible:border-blue-600 focus-visible:ring-blue-600/20"
                />
                <div className="h-4 mt-1">
                  <p className="text-[11px] text-slate-400 leading-none">Campaign launch datetime</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between h-7 mb-1.5">
                  <Label htmlFor="valid-until" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    Valid Until <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[11px] text-slate-400">Expiration Date & Time</span>
                </div>
                <Input
                  id="valid-until"
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => handleChange('validUntil', e.target.value)}
                  className={`h-10 text-xs border-slate-200 bg-white focus-visible:border-blue-600 focus-visible:ring-blue-600/20 ${
                    errors.validUntil ? 'border-red-500' : ''
                  }`}
                />
                <div className="h-4 mt-1">
                  {errors.validUntil ? (
                    <p className="text-[11px] text-red-600 font-medium leading-none">{errors.validUntil}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-none">Strictly later than start date</p>
                  )}
                </div>
              </div>
            </div>

            {/* Usage Caps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              <div>
                <div className="flex items-center justify-between h-7 mb-1.5">
                  <Label htmlFor="max-uses" className="text-xs font-semibold text-slate-700">
                    Total Platform Redemptions
                  </Label>
                  <span className="text-[11px] text-slate-400">Platform Quota</span>
                </div>
                <Input
                  id="max-uses"
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited (∞)"
                  value={formData.maxTotalUses}
                  onChange={(e) => handleChange('maxTotalUses', e.target.value)}
                  className={`h-10 border-slate-200 bg-white focus-visible:border-blue-600 focus-visible:ring-blue-600/20 ${
                    errors.maxTotalUses ? 'border-red-500' : ''
                  }`}
                />
                <div className="h-4 mt-1">
                  {errors.maxTotalUses ? (
                    <p className="text-[11px] text-red-600 font-medium leading-none">{errors.maxTotalUses}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-none">
                      First N clients to redeem across Solvit platform.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between h-7 mb-1.5">
                  <Label htmlFor="per-user" className="text-xs font-semibold text-slate-700">
                    Per-Client Redemptions
                  </Label>
                  <span className="text-[11px] text-slate-400">Client Limit</span>
                </div>
                <Input
                  id="per-user"
                  type="number"
                  min="1"
                  value={formData.maxUsesPerUser}
                  onChange={(e) => handleChange('maxUsesPerUser', e.target.value)}
                  className={`h-10 border-slate-200 bg-white focus-visible:border-blue-600 focus-visible:ring-blue-600/20 ${
                    errors.maxUsesPerUser ? 'border-red-500' : ''
                  }`}
                />
                <div className="h-4 mt-1">
                  <p className="text-[11px] text-slate-400 leading-none">
                    Default: 1 redemption per registered client.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Real-time Live Voucher Preview Card */}
          <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Live Coupon Voucher Preview
              </span>
              <Badge className="bg-white text-blue-700 border-blue-200 text-[10px] font-semibold">
                Client Preview
              </Badge>
            </div>

            <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-sm tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    {formData.code || 'COUPON_CODE'}
                  </span>
                  {formData.firstBookingOnly && (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-medium">
                      First Booking Only
                    </Badge>
                  )}
                  {formData.isAutoApplied && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium">
                      Auto-Apply
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {formData.description || 'Campaign description will appear here'}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Expires: {dayjs(formData.validUntil).format('DD MMM YYYY')}</span>
                  {formData.minOrderAmount > 0 && (
                    <span>• Min spend: ₹{formData.minOrderAmount}</span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 sm:border-l sm:pl-5 border-slate-100">
                <div className="text-2xl font-black text-blue-600 tracking-tight">
                  {formData.discountValue
                    ? formData.discountType === 'percentage'
                      ? `${formData.discountValue}% OFF`
                      : `₹${formData.discountValue} OFF`
                    : '--'}
                </div>
                {formData.discountType === 'percentage' && formData.maxDiscountAmount && (
                  <p className="text-[10px] text-slate-500 font-medium">
                    Up to ₹{formData.maxDiscountAmount} cap
                  </p>
                )}
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                    formData.isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      formData.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {formData.isActive ? 'Ready to Publish' : 'Draft Mode'}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <DialogFooter className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs self-start sm:self-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enterprise audit logging enabled</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-9 px-4 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="h-9 px-5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Publishing Coupon...
                </>
              ) : (
                <>
                  <TicketPercent className="w-3.5 h-3.5 mr-1.5" />
                  Publish Coupon
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
