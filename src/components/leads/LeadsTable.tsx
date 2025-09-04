'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUIStore } from '@/lib/store/uiStore';
import { ChevronRight, Edit, Trash } from 'lucide-react';
import { EditLeadForm } from './EditLeadForm';

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  status: 'New' | 'Contacted' | 'Responded' | 'Converted' | 'Rejected';
  campaignId: string;
  campaign: {
    id: string;
    name: string;
  };
  createdAt: string;
};

type PaginationInfo = {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

type LeadsTableProps = {
  leads: Lead[];
  pagination: PaginationInfo;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

export function LeadsTable({ leads, pagination, isLoading, onPageChange }: LeadsTableProps) {
  const router = useRouter();
  const { setSelectedLeadId, setIsLeadDetailOpen } = useUIStore();
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const handleViewLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setIsLeadDetailOpen(true);
  };

  if (isLoading) {
    return <LeadsTableSkeleton />;
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
        <h3 className="text-lg font-medium">No leads found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding leads to your campaigns.
        </p>
        <Button className="mt-4">Add Lead</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewLead(lead.id)}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.company || '-'}</TableCell>
              <TableCell>
                <StatusBadge status={lead.status} />
              </TableCell>
              <TableCell>{lead.campaign.name}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => {
                      setEditingLeadId(lead.id);
                      setIsEditFormOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this lead?')) {
                        try {
                          const response = await fetch(`/api/leads/${lead.id}`, {
                            method: 'DELETE',
                          });
                          
                          if (response.ok) {
                            router.refresh();
                          } else {
                            alert('Failed to delete lead');
                          }
                        } catch (error) {
                          console.error('Error deleting lead:', error);
                          alert('An error occurred while deleting the lead');
                        }
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => handleViewLead(lead.id)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
            {pagination.total} leads
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Lead['status'] }) {
  const variants = {
    New: 'secondary',
    Contacted: 'default',
    Responded: 'warning',
    Converted: 'success',
    Rejected: 'destructive',
  } as const;

  return (
    <Badge variant={variants[status]} className="capitalize">
      {status.toLowerCase()}
    </Badge>
  );
}

function LeadsTableSkeleton() {
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
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[100px]" />
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-5 w-[150px]" />
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
      <div className="flex items-center justify-between border-t pt-4">
        <Skeleton className="h-5 w-[200px]" />
        <div className="flex gap-1">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {editingLeadId && (
        <EditLeadForm
          leadId={editingLeadId}
          isOpen={isEditFormOpen}
          onOpenChange={setIsEditFormOpen}
          onLeadUpdated={() => {
            router.refresh();
            setEditingLeadId(null);
          }}
        />
      )}
    </div>
  );
}