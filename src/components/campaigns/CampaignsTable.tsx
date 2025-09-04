'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CampaignActions } from './CampaignActions';

type Campaign = {
  id: string;
  name: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  responseRate: number;
  totalLeads: number;
  respondedLeads: number;
  createdAt: string;
};

type CampaignsTableProps = {
  campaigns: Campaign[];
  isLoading: boolean;
};

export function CampaignsTable({ campaigns, isLoading }: CampaignsTableProps) {
  if (isLoading) {
    return <CampaignsTableSkeleton />;
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
        <h3 className="text-lg font-medium">No campaigns found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new campaign.
        </p>
        <Button className="mt-4">Create Campaign</Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Response Rate</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell className="font-medium">{campaign.name}</TableCell>
            <TableCell>
              <StatusBadge status={campaign.status} />
            </TableCell>
            <TableCell>{campaign.responseRate}%</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress
                  value={campaign.responseRate}
                  className="h-2 w-[100px]"
                />
                <span className="text-xs text-gray-500">
                  {campaign.respondedLeads}/{campaign.totalLeads}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <CampaignActions id={campaign.id} status={campaign.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StatusBadge({ status }: { status: Campaign['status'] }) {
  const variants = {
    Draft: 'secondary',
    Active: 'success',
    Paused: 'warning',
    Completed: 'default',
  } as const;

  return (
    <Badge variant={variants[status]} className="capitalize">
      {status.toLowerCase()}
    </Badge>
  );
}

function CampaignsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <div className="rounded-md border">
        <div className="border-b px-6 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-5 w-[100px]" />
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-5 w-[150px]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}