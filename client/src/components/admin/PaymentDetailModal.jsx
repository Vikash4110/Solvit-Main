// components/admin/PaymentDetailModal.jsx

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  CreditCard,
  User,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle,
  FileText,
  Download,
  Briefcase,
  Clock,
  TrendingUp,
  Smartphone,
  Wallet,
  Building2,
  Shield,
  Info,
  Phone,
  Mail,
  Globe,
  Hash,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = 'Asia/Kolkata';

const PaymentDetailModal = ({ paymentId, isOpen, onClose }) => {
  const { getPaymentDetails } = useAdminAuth();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId, isOpen]);

  const fetchPaymentDetails = async () => {
    setLoading(true);
    const result = await getPaymentDetails(paymentId);

    if (result.success) {
      setPayment(result.data);
    } else {
      toast.error(result.error);
      onClose();
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY hh:mm A');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2, // ✅ Changed from 0 to 2
      maximumFractionDigits: 2, // ✅ Show exact decimals
    }).format(amount || 0);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'upi':
        return <Smartphone className="w-5 h-5 text-green-600" />;
      case 'wallet':
        return <Wallet className="w-5 h-5 text-purple-600" />;
      case 'netbanking':
        return <Building2 className="w-5 h-5 text-orange-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'card':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upi':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'wallet':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'netbanking':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-green-600" />
            Payment Transaction Details
            {payment && (
              <Badge
                variant="outline"
                className="ml-auto bg-green-100 text-green-800 border-green-200"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6 pb-6">
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-5 gap-4">
                    {/* Total Amount */}
                    <div className="text-center p-4 bg-white rounded-lg border-2 border-green-300 shadow-sm">
                      <Label className="text-xs text-slate-600 font-semibold">
                        Total Amount Paid
                      </Label>
                      <p className="text-3xl font-bold text-green-700 mt-2">
                        {formatCurrency(payment.amount)}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {payment.currency}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">₹{payment.amount.toFixed(2)}</p>
                    </div>

                    {/* Counselor Payout */}
                    <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-300 shadow-sm">
                      <Label className="text-xs text-slate-600 font-semibold">
                        Counselor Payout
                      </Label>
                      <p className="text-3xl font-bold text-blue-700 mt-2">
                        {formatCurrency(payment.calculated?.counselorPayout || 0)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ₹{(payment.calculated?.counselorPayout || 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Platform Fee */}
                    <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-300 shadow-sm">
                      <Label className="text-xs text-slate-600 font-semibold">Platform Fee</Label>
                      <p className="text-3xl font-bold text-purple-700 mt-2">
                        {formatCurrency(payment.calculated?.platformFee || 0)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ₹{(payment.calculated?.platformFee || 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Razorpay Fee - FIXED */}
                    <div className="text-center p-4 bg-white rounded-lg border-2 border-orange-300 shadow-sm">
                      <Label className="text-xs text-slate-600 font-semibold">Razorpay Fee</Label>
                      <p className="text-3xl font-bold text-orange-700 mt-2">
                        {formatCurrency(payment.fee || 0)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ₹{(payment.fee || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">(incl. GST)</p>
                    </div>

                    {/* Net Amount */}
                    <div className="text-center p-4 bg-white rounded-lg border-2 border-indigo-300 shadow-sm">
                      <Label className="text-xs text-slate-600 font-semibold">Net Amount</Label>
                      <p className="text-3xl font-bold text-indigo-700 mt-2">
                        {formatCurrency(payment.calculated?.netAmountReceived || 0)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ₹{(payment.calculated?.netAmountReceived || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">After Razorpay fees</p>
                    </div>
                  </div>

                  {/* Fee Breakdown Info */}
                  {payment.tax > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-800 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        <span>
                          <strong>Razorpay Fee Breakdown:</strong> Total Fee ₹
                          {payment.fee?.toFixed(2)}
                          (Base: ₹{((payment.fee || 0) - (payment.tax || 0)).toFixed(2)} + GST: ₹
                          {(payment.tax || 0).toFixed(2)})
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Razorpay Transaction IDs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Razorpay Transaction Identifiers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Payment ID */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Label className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Payment ID
                      </Label>
                      <div className="flex items-center justify-between mt-1">
                        <code className="text-sm font-mono text-slate-900 flex-1">
                          {payment.razorpay_payment_id}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(payment.razorpay_payment_id, 'Payment ID')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Order ID */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Label className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Order ID
                      </Label>
                      <div className="flex items-center justify-between mt-1">
                        <code className="text-sm font-mono text-slate-900 flex-1">
                          {payment.razorpay_order_id}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(payment.razorpay_order_id, 'Order ID')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Label className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Signature (Verified)
                      </Label>
                      <div className="flex items-center justify-between mt-1">
                        <code className="text-sm font-mono text-slate-900 truncate flex-1">
                          {payment.razorpay_signature?.slice(0, 20)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(payment.razorpay_signature, 'Signature')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getMethodIcon(payment.method)}
                    Payment Method Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Payment Method */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <Label className="text-xs text-blue-700 font-semibold">Payment Method</Label>
                      <Badge
                        variant="outline"
                        className={`mt-2 text-base ${getMethodColor(payment.method)} capitalize`}
                      >
                        {getMethodIcon(payment.method)}
                        <span className="ml-2">{payment.method}</span>
                      </Badge>
                    </div>

                    {/* Bank / Wallet / VPA */}
                    {payment.bank && (
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                        <Label className="text-xs text-orange-700 font-semibold">Bank</Label>
                        <p className="text-lg font-bold text-orange-900 mt-2 uppercase">
                          {payment.bank}
                        </p>
                      </div>
                    )}

                    {payment.wallet && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                        <Label className="text-xs text-purple-700 font-semibold">Wallet</Label>
                        <p className="text-lg font-bold text-purple-900 mt-2 capitalize">
                          {payment.wallet}
                        </p>
                      </div>
                    )}

                    {payment.vpa && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <Label className="text-xs text-green-700 font-semibold">UPI VPA</Label>
                        <p className="text-sm font-mono font-bold text-green-900 mt-2 break-all">
                          {payment.vpa}
                        </p>
                      </div>
                    )}

                    {/* International Payment */}
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                      <Label className="text-xs text-slate-700 font-semibold flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        International
                      </Label>
                      <Badge
                        variant={payment.international ? 'destructive' : 'secondary'}
                        className="mt-2"
                      >
                        {payment.international ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  {/* UPI Specific Details */}
                  {payment.upiDetails && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <Label className="text-sm text-green-800 font-semibold mb-3 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        UPI Transaction Details
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-green-700">Payer Account Type</Label>
                          <p className="text-sm font-medium text-green-900 mt-1 capitalize">
                            {payment.upiDetails.payer_account_type?.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-green-700">Flow Type</Label>
                          <p className="text-sm font-medium text-green-900 mt-1 capitalize">
                            {payment.upiDetails.flow}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Client & Counselor Info */}
              <div className="grid grid-cols-2 gap-6">
                {/* Client */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      {payment.clientId?.profilePicture ? (
                        <img
                          src={payment.clientId.profilePicture}
                          alt={payment.clientId.fullName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-lg text-slate-900">
                          {payment.clientId?.fullName}
                        </p>
                        <p className="text-sm text-slate-500">@{payment.clientId?.username}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">
                          {payment.email || payment.clientId?.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">
                          {payment.contact || payment.clientId?.phone}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Counselor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                      Counselor Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      {payment.slotId?.counselorId?.profilePicture ? (
                        <img
                          src={payment.slotId.counselorId.profilePicture}
                          alt={payment.slotId.counselorId.fullName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                          <Briefcase className="w-8 h-8 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-lg text-slate-900">
                          {payment.slotId?.counselorId?.fullName}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {payment.slotId?.counselorId?.experienceLevel}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{payment.slotId?.counselorId?.email}</span>
                      </div>
                      {payment.slotId?.counselorId?.specialization && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {payment.slotId.counselorId.specialization.slice(0, 2).map((spec) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Session Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Session Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <Label className="text-xs text-orange-700 font-semibold">
                        Session Start Time
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <p className="text-sm font-medium text-orange-900">
                          {formatDate(payment.slotId?.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <Label className="text-xs text-orange-700 font-semibold">
                        Session End Time
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <p className="text-sm font-medium text-orange-900">
                          {formatDate(payment.slotId?.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acquirer Data (Transaction Details) */}
              {payment.acquirer_data && Object.keys(payment.acquirer_data).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="w-5 h-5 text-indigo-600" />
                      Transaction Details (Acquirer Data)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {payment.acquirer_data.bank_transaction_id && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <Label className="text-xs text-slate-600 font-semibold">
                            Bank Transaction ID
                          </Label>
                          <code className="block text-sm font-mono text-slate-900 mt-1">
                            {payment.acquirer_data.bank_transaction_id}
                          </code>
                        </div>
                      )}
                      {payment.acquirer_data.rrn && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <Label className="text-xs text-slate-600 font-semibold">
                            RRN (Reference Number)
                          </Label>
                          <code className="block text-sm font-mono text-slate-900 mt-1">
                            {payment.acquirer_data.rrn}
                          </code>
                        </div>
                      )}
                      {payment.acquirer_data.auth_code && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <Label className="text-xs text-slate-600 font-semibold">Auth Code</Label>
                          <code className="block text-sm font-mono text-slate-900 mt-1">
                            {payment.acquirer_data.auth_code}
                          </code>
                        </div>
                      )}
                      {payment.acquirer_data.arn && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <Label className="text-xs text-slate-600 font-semibold">ARN</Label>
                          <code className="block text-sm font-mono text-slate-900 mt-1">
                            {payment.acquirer_data.arn}
                          </code>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Payment Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <Label className="text-xs text-blue-700 font-semibold">Payment Created</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <Label className="text-xs text-green-700 font-semibold">
                        Razorpay Created At
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium text-green-900">
                          {payment.razorpay_created_at
                            ? dayjs
                                .unix(payment.razorpay_created_at)
                                .tz(TIMEZONE)
                                .format('MMM DD, YYYY hh:mm A')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                      <Label className="text-xs text-purple-700 font-semibold">Platform ID</Label>
                      <code className="block text-sm font-mono font-medium text-purple-900 mt-2">
                        {payment._id}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Status */}
              {payment.bookingId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Booking Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm text-green-800 font-semibold">
                            Booking Status
                          </Label>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-green-100 text-green-800 border-green-300"
                          >
                            {payment.bookingId.status?.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <Label className="text-sm text-green-800 font-semibold">Booking ID</Label>
                          <code className="block text-sm font-mono text-green-900 mt-1">
                            {payment.bookingId._id}
                          </code>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Refund Information */}
              {payment.amount_refunded > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Refund Status:</strong> {formatCurrency(payment.amount_refunded)} has
                    been refunded
                    {payment.refund_status && ` (${payment.refund_status} refund)`}
                  </AlertDescription>
                </Alert>
              )}

              {/* Invoice Section */}
              {payment.invoice && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-600" />
                      Invoice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={payment.invoice}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200 hover:shadow-md transition-all"
                    >
                      <Download className="w-5 h-5 text-teal-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Download Invoice</p>
                        <p className="text-xs text-slate-500">Click to download PDF invoice</p>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              )}

              {/* Additional Notes/Description */}
              {payment.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="w-5 h-5 text-gray-600" />
                      Payment Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 p-3 bg-slate-50 rounded border border-slate-200">
                      {payment.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-white flex-shrink-0 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            {payment?.invoice && (
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href={payment.invoice} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailModal;
