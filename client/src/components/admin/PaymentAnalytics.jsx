// components/admin/PaymentAnalytics.jsx

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import {
  TrendingUp,
  Calendar,
  CreditCard,
  Loader2,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const PaymentAnalytics = () => {
  const { getPaymentAnalytics } = useAdminAuth();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const result = await getPaymentAnalytics(period);

    if (result.success) {
      setAnalytics(result.data);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM DD');
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'card':
        return 'bg-blue-500';
      case 'upi':
        return 'bg-green-500';
      case 'wallet':
        return 'bg-purple-500';
      case 'netbanking':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate growth (mock - you can calculate from previous period)
  const revenueGrowth = 12.5; // percentage

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Analytics</h2>
          <p className="text-slate-600 text-sm mt-1">Detailed insights into payment trends</p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value)}>
          <SelectTrigger className="w-[200px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
              Total Revenue
              <TrendingUp className="w-5 h-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(analytics.totalRevenue)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 border-green-200"
              >
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +{revenueGrowth}%
              </Badge>
              <span className="text-xs text-slate-500">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
              Total Transactions
              <CreditCard className="w-5 h-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{analytics.totalTransactions}</p>
            <p className="text-sm text-slate-500 mt-2">
              {analytics.totalTransactions > 0
                ? `${(analytics.totalTransactions / getPeriodDays(period)).toFixed(1)} per day avg`
                : 'No transactions'}
            </p>
          </CardContent>
        </Card>

        {/* Average Transaction Value */}
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
              Avg Transaction
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(analytics.averageTransactionValue)}
            </p>
            <p className="text-sm text-slate-500 mt-2">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Revenue Trend
          </CardTitle>
          <CardDescription>Daily revenue for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.dailyRevenue && analytics.dailyRevenue.length > 0 ? (
            <div className="space-y-4">
              {/* Simple Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics.dailyRevenue.slice(-15).map((day, index) => {
                  const maxRevenue = Math.max(...analytics.dailyRevenue.map((d) => d.revenue));
                  const heightPercent = (day.revenue / maxRevenue) * 100;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="w-full relative">
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                          <div className="font-semibold">{formatCurrency(day.revenue)}</div>
                          <div className="text-slate-300">{day.count} transactions</div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                            <div className="border-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>

                        {/* Bar */}
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                          style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                        ></div>
                      </div>

                      {/* Date Label */}
                      <p className="text-xs text-slate-500 mt-2 rotate-45 origin-left">
                        {formatDate(day.date)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-sm text-slate-600">Daily Revenue</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">No revenue data available</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            Payment Method Distribution
          </CardTitle>
          <CardDescription>Breakdown by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.methodDistribution && analytics.methodDistribution.length > 0 ? (
            <div className="space-y-4">
              {analytics.methodDistribution.map((method, index) => {
                const percentage = (
                  (method.revenue / analytics.totalRevenue) *
                  100
                ).toFixed(1);

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded ${getMethodColor(method.method)}`}
                        ></div>
                        <span className="text-sm font-medium text-slate-900 capitalize">
                          {method.method || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">{method.count} txns</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {formatCurrency(method.revenue)}
                        </span>
                        <Badge variant="secondary">{percentage}%</Badge>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${getMethodColor(method.method)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">No payment method data available</p>
          )}
        </CardContent>
      </Card>

      {/* Daily Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Daily Breakdown
          </CardTitle>
          <CardDescription>Detailed daily transaction data</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.dailyRevenue && analytics.dailyRevenue.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Transactions
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Avg Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.dailyRevenue
                    .slice()
                    .reverse()
                    .map((day, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {dayjs(day.date).format('ddd, MMM DD, YYYY')}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                          {day.count}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-700">
                          {formatCurrency(day.revenue)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">
                          {formatCurrency(day.count > 0 ? day.revenue / day.count : 0)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">No daily data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get period days
const getPeriodDays = (period) => {
  switch (period) {
    case '7days':
      return 7;
    case '30days':
      return 30;
    case '90days':
      return 90;
    case 'year':
      return 365;
    default:
      return 30;
  }
};

export default PaymentAnalytics;
