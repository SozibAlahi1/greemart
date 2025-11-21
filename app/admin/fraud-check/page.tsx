'use client';

import { useState } from 'react';
import { Shield, ShieldAlert, Search, Loader2 } from 'lucide-react';
import { ModuleGuard } from '@/components/modules/ModuleGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface FraudCheckResult {
  success: boolean;
  phone: string;
  riskLevel: 'low' | 'medium' | 'high';
  successRatio: number;
  totalOrders?: number;
  successfulOrders?: number;
  failedOrders?: number;
  fraudScore?: number;
  status?: string;
  lastOrderDate?: string;
  checkedAt: string;
  courierData?: {
    [key: string]: {
      name: string;
      logo: string;
      total_parcel: number;
      success_parcel: number;
      cancelled_parcel: number;
      success_ratio: number;
    };
  };
  summary?: {
    total_parcel: number;
    success_parcel: number;
    cancelled_parcel: number;
    success_ratio: number;
  };
}

export default function FraudCheckPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fraudCheckResult, setFraudCheckResult] = useState<FraudCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckFraud = async () => {
    if (!phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/fraud-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to check fraud status');
        setLoading(false);
        return;
      }

      if (data.result) {
        setFraudCheckResult(data.result);
      }
    } catch (err: any) {
      console.error('Fraud check error:', err);
      setError(err.message || 'An error occurred while checking fraud status');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleCheckFraud();
    }
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fraud Check</h1>
          <p className="text-muted-foreground">
            Check courier order history and success rates by phone number
          </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Track Courier Orders
          </CardTitle>
          <CardDescription>
            Enter a phone number to check order history and fraud risk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Customer Phone</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                type="tel"
                placeholder="01774226088"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleCheckFraud}
                disabled={loading || !phone.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Free: View basic order info only
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fraud Check Results */}
      {fraudCheckResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Track Courier Orders</CardTitle>
              <CardDescription>
                Phone Number: {fraudCheckResult.phone}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Cards */}
              {fraudCheckResult.summary && (
                <div className="grid grid-cols-4 gap-4">
                  <Card className="p-4 border-blue-500/20 bg-blue-500/5">
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Total Orders</Label>
                      <p className="text-2xl font-bold text-blue-600">
                        {fraudCheckResult.summary.total_parcel}
                      </p>
                    </div>
                  </Card>
                  <Card className="p-4 border-green-500/20 bg-green-500/5">
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Successful</Label>
                      <p className="text-2xl font-bold text-green-600">
                        {fraudCheckResult.summary.success_parcel}
                      </p>
                    </div>
                  </Card>
                  <Card className="p-4 border-red-500/20 bg-red-500/5">
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Cancelled</Label>
                      <p className="text-2xl font-bold text-red-600">
                        {fraudCheckResult.summary.cancelled_parcel}
                      </p>
                    </div>
                  </Card>
                  <Card className="p-4 border-purple-500/20 bg-purple-500/5">
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Success Rate</Label>
                      <p className="text-2xl font-bold text-purple-600">
                        {fraudCheckResult.summary.success_ratio.toFixed(2)}%
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* Two Column Layout: Table and Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Courier Table */}
                {fraudCheckResult.courierData && Object.keys(fraudCheckResult.courierData).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Courier Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>COURIER</TableHead>
                              <TableHead className="text-center">TOTAL</TableHead>
                              <TableHead className="text-center">SUCCESS</TableHead>
                              <TableHead className="text-center">CANCEL</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(fraudCheckResult.courierData).map(([key, courier]) => (
                              <TableRow key={key}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {courier.logo && (
                                      <img 
                                        src={courier.logo} 
                                        alt={courier.name}
                                        className="w-8 h-8 object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <span className="font-medium">{courier.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">{courier.total_parcel}</TableCell>
                                <TableCell className="text-center text-green-600">{courier.success_parcel}</TableCell>
                                <TableCell className="text-center text-red-600">{courier.cancelled_parcel}</TableCell>
                              </TableRow>
                            ))}
                            {fraudCheckResult.summary && (
                              <TableRow className="font-bold bg-muted">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-center">{fraudCheckResult.summary.total_parcel}</TableCell>
                                <TableCell className="text-center text-green-600">{fraudCheckResult.summary.success_parcel}</TableCell>
                                <TableCell className="text-center text-red-600">{fraudCheckResult.summary.cancelled_parcel}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Delivery Status Chart */}
                {fraudCheckResult.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Successful', value: fraudCheckResult.summary.success_parcel, fill: '#10b981' },
                                { name: 'Cancelled', value: fraudCheckResult.summary.cancelled_parcel, fill: '#ef4444' },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {[
                                { name: 'Successful', value: fraudCheckResult.summary.success_parcel, fill: '#10b981' },
                                { name: 'Cancelled', value: fraudCheckResult.summary.cancelled_parcel, fill: '#ef4444' },
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend 
                              verticalAlign="bottom"
                              iconType="square"
                              formatter={(value) => (
                                <span className="text-sm">{value}</span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Fraud Check Alert */}
              {typeof fraudCheckResult.successRatio === 'number' &&
                Number.isFinite(fraudCheckResult.successRatio) && (
                <div className={`p-4 rounded-lg border ${
                  fraudCheckResult.successRatio >= 75
                    ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
                    : fraudCheckResult.successRatio >= 50
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
                }`}>
                  <div className="flex items-start gap-3">
                    {fraudCheckResult.successRatio >= 75 ? (
                      <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {fraudCheckResult.successRatio >= 75
                          ? 'High Success Rate'
                          : fraudCheckResult.successRatio >= 50
                          ? 'Moderate Success Rate'
                          : 'Low Success Rate'}: {fraudCheckResult.successRatio.toFixed(1)}%
                      </p>
                      <p className="text-sm mt-1">
                        {fraudCheckResult.successRatio >= 75
                          ? 'This customer appears safe based on previous records.'
                          : fraudCheckResult.successRatio >= 50
                          ? 'This customer has a moderate order history. Review carefully.'
                          : 'This customer has a low success rate. Exercise caution.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

