'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type LeadStats = {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
};

export function LeadStats() {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeadStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Failed to fetch lead statistics');
        }
      } catch (error) {
        console.error('Error fetching lead statistics:', error);
        setError('An error occurred while fetching lead statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[100px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="mt-2 h-4 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive">
        {error}
      </div>
    );
  }

  // If no stats are available yet, show placeholder cards with zeros
  const displayStats = stats || {
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayStats.totalLeads}</div>
          <p className="text-xs text-muted-foreground">
            All leads in your account
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayStats.newLeads}</div>
          <p className="text-xs text-muted-foreground">
            Leads with "New" status
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayStats.qualifiedLeads}</div>
          <p className="text-xs text-muted-foreground">
            Leads with "Qualified" status
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayStats.conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Percentage of leads converted to Won
          </p>
        </CardContent>
      </Card>
    </div>
  );
}