'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Eye, MousePointerClick, ShoppingCart, Search, Calendar, TrendingUp, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/app/components/Toast';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

interface TrackingAnalytics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByPage: Record<string, number>;
  topPages: Array<{ page: string; count: number }>;
  topEvents: Array<{ eventName: string; count: number }>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  dailyEvents: Array<{ date: string; count: number }>;
}

export default function TrackingPage() {
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'custom'>('30');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [eventType, setEventType] = useState<string>('all');
  const [analytics, setAnalytics] = useState<TrackingAnalytics | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const defaultEndDate = today.toISOString().split('T')[0];
    const defaultStartDate = new Date(today);
    defaultStartDate.setDate(today.getDate() - 29);
    setEndDate(defaultEndDate);
    setStartDate(defaultStartDate.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
      fetchEvents();
    }
  }, [dateRange, startDate, endDate, eventType]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(eventType !== 'all' && { eventType }),
      });

      const response = await fetch(`/api/admin/tracking/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        showToast('Failed to fetch analytics', 'error');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast('Error fetching analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const params = new URLSearchParams({
        startDate,
        endDate,
        limit: '50',
        ...(eventType !== 'all' && { eventType }),
      });

      const response = await fetch(`/api/tracking?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'page_view':
        return <Eye className="h-4 w-4" />;
      case 'click':
        return <MousePointerClick className="h-4 w-4" />;
      case 'purchase':
        return <ShoppingCart className="h-4 w-4" />;
      case 'add_to_cart':
      case 'remove_from_cart':
        return <ShoppingCart className="h-4 w-4" />;
      case 'search':
        return <Search className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'page_view':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'click':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'purchase':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'add_to_cart':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'remove_from_cart':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'search':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !analytics) {
    return <TableSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Tracking</h1>
          <p className="text-muted-foreground mt-2">
            Monitor user behavior, page views, and events across your website
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={(value: any) => {
                setDateRange(value);
                if (value !== 'custom') {
                  const today = new Date();
                  const days = parseInt(value);
                  const start = new Date(today);
                  start.setDate(today.getDate() - (days - 1));
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(today.toISOString().split('T')[0]);
                }
              }}>
                <SelectTrigger id="dateRange">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger id="eventType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="page_view">Page Views</SelectItem>
                  <SelectItem value="click">Clicks</SelectItem>
                  <SelectItem value="purchase">Purchases</SelectItem>
                  <SelectItem value="add_to_cart">Add to Cart</SelectItem>
                  <SelectItem value="remove_from_cart">Remove from Cart</SelectItem>
                  <SelectItem value="search">Searches</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All tracked events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(analytics.eventsByType.page_view || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total page views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchases</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(analytics.eventsByType.purchase || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Completed purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Pages</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(analytics.eventsByPage).length}
              </div>
              <p className="text-xs text-muted-foreground">Pages tracked</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Events by Type */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle>Events by Type</CardTitle>
              <CardDescription>Breakdown of event types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.eventsByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(type)}
                        <span className="text-sm font-medium capitalize">
                          {type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(count / analytics.totalEvents) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-16 text-right">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Device Breakdown */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Events by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.deviceBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device === 'desktop' && <Monitor className="h-4 w-4" />}
                        {device === 'mobile' && <Smartphone className="h-4 w-4" />}
                        {device === 'tablet' && <Tablet className="h-4 w-4" />}
                        <span className="text-sm font-medium capitalize">{device}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(count / analytics.totalEvents) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-16 text-right">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Pages */}
      {analytics && analytics.topPages.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topPages.map((page, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{page.page || '/'}</TableCell>
                    <TableCell>{page.count.toLocaleString()}</TableCell>
                    <TableCell>
                      {((page.count / analytics.totalEvents) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest tracked events</CardDescription>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <TableSkeleton />
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No events found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Browser</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell className="text-sm">
                      {formatDateTime(event.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">{event.eventName}</TableCell>
                    <TableCell>
                      <Badge className={getEventTypeColor(event.eventType)}>
                        {getEventTypeIcon(event.eventType)}
                        <span className="ml-1 capitalize">
                          {event.eventType.replace(/_/g, ' ')}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{event.page || 'N/A'}</TableCell>
                    <TableCell className="text-sm capitalize">
                      {event.deviceType || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-sm">{event.browser || 'Unknown'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {ToastComponent}
    </div>
  );
}

