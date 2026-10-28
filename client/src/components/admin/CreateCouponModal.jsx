// components/admin/CreateCouponModal.jsx - Interactive Coupon & Campaign Creation Dialog

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import {
  TicketPercent,
  Sparkles,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Shield,
  HelpCircle,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  UserCheck,
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
import { Separator } from '@/components/ui/separator';

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
    const prefixes = ['SOLV', 'PROMO', 'SAVE', 'CARE', 'FESTIVE'];
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
    e.preventDefault();
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

  // Filtered counselors list
  const filteredCounselors = counselorsList.filter((c) =>
    c.fullName?.toLowerCase().includes(counselorSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(counselorSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shadow-sm">
              <TicketPercent className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Create New Coupon
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Configure promotional rules, discount rates, validity windows, and target audience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Code & Description */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              1. Campaign Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="coupon-code" className="text-xs font-semibold text-slate-700">
                    Coupon Code <span className="text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Generate Random
                  </button>
                </div>
                <Input
                  id="coupon-code"
                  placeholder="e.g. NEWSTART, DIWALI25"
                  value={formData.code}
                  onChange={handleCodeChange}
                  className={`font-mono uppercase font-bold tracking-wider ${
                    errors.code ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                />
                {errors.code ? (
                  <p className="text-[11px] text-red-600 mt-1">{errors.code}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Uppercase letters, numbers, hyphens, and underscores only.
                  </p>
                )}
              </div>

              {/* Status Toggle on Creation */}
              <div>
                <Label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Initial Status
                </Label>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                  <span className="text-xs text-slate-700 font-medium">
                    {formData.isActive ? 'Active (Ready to redeem)' : 'Draft / Inactive (Paused)'}
                  </span>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(val) => handleChange('isActive', val)}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="coupon-desc" className="text-xs font-semibold text-slate-700 block mb-1.5">
                Campaign Description <span className="text-red-500">*</span>
              </Label>
              <Input
                id="coupon-desc"
                placeholder="e.g. 15% discount for first-time counseling sessions"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.description && (
                <p className="text-[11px] text-red-600 mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Section 2: Discount Structure */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-blue-600" />
              2. Discount Rules & Pricing
            </h3>

            {/* Discount Type Selector */}
            <div>
              <Label className="text-xs font-semibold text-slate-700 block mb-2">
                Discount Type <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('discountType', 'percentage')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-all ${
                    formData.discountType === 'percentage'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Percent className="w-4 h-4 text-blue-600" />
                  Percentage Discount (%)
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('discountType', 'flat')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-all ${
                    formData.discountType === 'flat'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-sm text-blue-600">₹</span>
                  Flat Rupee Discount (₹)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Discount Value */}
              <div>
                <Label htmlFor="discount-val" className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Discount Value <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="discount-val"
                    type="number"
                    min="1"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    placeholder={formData.discountType === 'percentage' ? 'e.g. 15' : 'e.g. 100'}
                    value={formData.discountValue}
                    onChange={(e) => handleChange('discountValue', e.target.value)}
                    className={errors.discountValue ? 'border-red-500' : ''}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    {formData.discountType === 'percentage' ? '%' : '₹'}
                  </span>
                </div>
                {errors.discountValue && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.discountValue}</p>
                )}
              </div>

              {/* Max Discount Ceiling Cap (for Percentage) */}
              <div>
                <Label htmlFor="max-cap" className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Max Cap (₹)
                </Label>
                <div className="relative">
                  <Input
                    id="max-cap"
                    type="number"
                    min="1"
                    disabled={formData.discountType === 'flat'}
                    placeholder={formData.discountType === 'flat' ? 'N/A for flat' : 'e.g. 150'}
                    value={formData.maxDiscountAmount}
                    onChange={(e) => handleChange('maxDiscountAmount', e.target.value)}
                    className={errors.maxDiscountAmount ? 'border-red-500' : ''}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    ₹
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Optional limit for % discounts.
                </p>
              </div>

              {/* Minimum Order Spend */}
              <div>
                <Label htmlFor="min-spend" className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Min Spend (₹)
                </Label>
                <div className="relative">
                  <Input
                    id="min-spend"
                    type="number"
                    min="0"
                    placeholder="e.g. 200"
                    value={formData.minOrderAmount}
                    onChange={(e) => handleChange('minOrderAmount', e.target.value)}
                    className={errors.minOrderAmount ? 'border-red-500' : ''}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    ₹
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Minimum session fee (0 = none).
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Section 3: Target Audience & Behavior */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              3. Target Audience & Behavior
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Booking Only */}
              <div className="flex items-start justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="pr-2">
                  <p className="text-xs font-semibold text-slate-800">First Booking Only</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Restricted strictly to clients booking their very first session.
                  </p>
                </div>
                <Switch
                  checked={formData.firstBookingOnly}
                  onCheckedChange={(val) => handleChange('firstBookingOnly', val)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              {/* Auto-Apply in Checkout */}
              <div className="flex items-start justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="pr-2">
                  <p className="text-xs font-semibold text-slate-800">Auto-Apply in Modal</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Automatically fills in and applies on booking modal open.
                  </p>
                </div>
                <Switch
                  checked={formData.isAutoApplied}
                  onCheckedChange={(val) => handleChange('isAutoApplied', val)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>

            {/* Counselor Scoping Toggle */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Restrict to Specific Counselors</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formData.scopeToCounselors
                      ? 'Only valid when booking sessions with selected counselors.'
                      : 'Applicable platform-wide to all approved counselors.'}
                  </p>
                </div>
                <Switch
                  checked={formData.scopeToCounselors}
                  onCheckedChange={(val) => handleChange('scopeToCounselors', val)}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              {/* Counselor Multi-Selector */}
              {formData.scopeToCounselors && (
                <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-purple-950">
                      Select Counselors ({formData.applicableCounselors.length} selected)
                    </Label>
                    <Input
                      placeholder="Search counselors..."
                      value={counselorSearch}
                      onChange={(e) => setCounselorSearch(e.target.value)}
                      className="h-7 w-48 text-xs bg-white"
                    />
                  </div>

                  {errors.applicableCounselors && (
                    <p className="text-[11px] text-red-600">{errors.applicableCounselors}</p>
                  )}

                  <ScrollArea className="h-32 rounded border border-slate-200 bg-white p-2">
                    {loadingCounselors ? (
                      <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Loading counselors...
                      </div>
                    ) : filteredCounselors.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-400">No counselors found.</p>
                    ) : (
                      <div className="space-y-1">
                        {filteredCounselors.map((counselor) => {
                          const isSelected = formData.applicableCounselors.includes(counselor._id);
                          return (
                            <div
                              key={counselor._id}
                              onClick={() => handleToggleCounselor(counselor._id)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                                isSelected
                                  ? 'bg-purple-100/70 text-purple-950 font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div>
                                <p>{counselor.fullName}</p>
                                <p className="text-[10px] text-slate-400">{counselor.email}</p>
                              </div>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
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

          <Separator className="bg-slate-100" />

          {/* Section 4: Validity & Usage Limits */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              4. Validity Window & Usage Caps
            </h3>

            {/* Validity Presets */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Duration Presets:</span>
              {[7, 14, 30, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleSetValidityPreset(days)}
                  className="px-2 py-0.5 rounded border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  +{days} Days
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <Label htmlFor="valid-from" className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Valid From
                </Label>
                <Input
                  id="valid-from"
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => handleChange('validFrom', e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* End Date */}
              <div>
                <Label htmlFor="valid-until" className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Valid Until (Expiration) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="valid-until"
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => handleChange('validUntil', e.target.value)}
                  className={`text-xs ${errors.validUntil ? 'border-red-500' : ''}`}
                />
                {errors.validUntil && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.validUntil}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Platform Total Uses */}
              <div>
                <Label htmlFor="max-uses" className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Total Platform Uses Cap
                </Label>
                <Input
                  id="max-uses"
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited (∞)"
                  value={formData.maxTotalUses}
                  onChange={(e) => handleChange('maxTotalUses', e.target.value)}
                  className={errors.maxTotalUses ? 'border-red-500' : ''}
                />
                {errors.maxTotalUses ? (
                  <p className="text-[11px] text-red-600 mt-1">{errors.maxTotalUses}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    First N clients to redeem across Solvit.
                  </p>
                )}
              </div>

              {/* Uses Per User */}
              <div>
                <Label htmlFor="per-user" className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Max Redemptions Per Client
                </Label>
                <Input
                  id="per-user"
                  type="number"
                  min="1"
                  value={formData.maxUsesPerUser}
                  onChange={(e) => handleChange('maxUsesPerUser', e.target.value)}
                  className={errors.maxUsesPerUser ? 'border-red-500' : ''}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Defaults to 1 redemption per registered user.
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Coupon Card Preview */}
          <div className="p-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-2">
              Live Preview Summary
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-base text-slate-900 bg-white px-2.5 py-1 rounded border border-blue-200">
                  {formData.code || 'COUPON_CODE'}
                </span>
                <p className="text-xs text-slate-600 mt-1.5 font-medium">
                  {formData.description || 'Campaign description preview'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-blue-600">
                  {formData.discountValue
                    ? formData.discountType === 'percentage'
                      ? `${formData.discountValue}% OFF`
                      : `₹${formData.discountValue} OFF`
                    : '--'}
                </span>
                {formData.discountType === 'percentage' && formData.maxDiscountAmount && (
                  <p className="text-[10px] text-slate-500">Up to ₹{formData.maxDiscountAmount}</p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <DialogFooter className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="h-9 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Creating Coupon...
              </>
            ) : (
              <>
                <TicketPercent className="w-3.5 h-3.5 mr-1.5" />
                Publish Coupon
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
