'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadStats } from '@/components/dashboard/LeadStats';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  createdAt: string;
};

type Campaign = {
  id: string;
  name: string;
  status: string;
  responseRate: number;
  leadsCount: number;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [topCampaigns, setTopCampaigns] = useState<Campaign[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  useEffect(() => {
    // Fetch recent leads
    const fetchRecentLeads = async () => {
      try {
        const response = await fetch('/api/leads?limit=5&sort=createdAt:desc');
        if (response.ok) {
          const data = await response.json();
          setRecentLeads(data.leads);
        }
      } catch (error) {
        console.error('Error fetching recent leads:', error);
      } finally {
        setIsLoadingLeads(false);
      }
    };

    // Fetch top campaigns
    const fetchTopCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns?limit=3&sort=responseRate:desc');
        if (response.ok) {
          const data = await response.json();
          setTopCampaigns(data.campaigns);
        }
      } catch (error) {
        console.error('Error fetching top campaigns:', error);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    fetchRecentLeads();
    fetchTopCampaigns();
  }, []);

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      New: 'bg-blue-100 text-blue-800',
      Contacted: 'bg-yellow-100 text-yellow-800',
      Qualified: 'bg-green-100 text-green-800',
      Proposal: 'bg-purple-100 text-purple-800',
      Negotiation: 'bg-indigo-100 text-indigo-800',
      Won: 'bg-emerald-100 text-emerald-800',
      Lost: 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="flex-1 space-y-4">
        {session?.user?.name && (
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {session.user.name}
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your leads and campaigns
            </p>
          </div>
        )}

        <LeadStats />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Leads</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/leads')}>
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingLeads ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div>
                        <Skeleton className="h-4 w-[150px] mb-1" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                      <Skeleton className="h-6 w-[80px]" />
                    </div>
                  ))}
                </div>
              ) : recentLeads.length > 0 ? (
                <div className="space-y-2">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.company}</p>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent leads found. Start adding leads to see them here.
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaign Performance</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/campaigns')}>
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingCampaigns ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div>
                        <Skeleton className="h-4 w-[150px] mb-1" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                      <Skeleton className="h-6 w-[60px]" />
                    </div>
                  ))}
                </div>
              ) : topCampaigns.length > 0 ? (
                <div className="space-y-2">
                  {topCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.leadsCount} leads
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{campaign.responseRate}%</p>
                        <p className="text-xs text-muted-foreground">Response rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active campaigns found. Create a campaign to track performance.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}