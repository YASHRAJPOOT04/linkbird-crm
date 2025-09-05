'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { X } from 'lucide-react';
import { EditLeadForm } from './EditLeadForm';
import { LeadStatusSelector } from './LeadStatusSelector';

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  status: 'Pending' | 'Contacted' | 'Responded' | 'Converted';
  notes: string;
  campaignId: string;
  campaign: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

export function LeadDetail() {
  const { selectedLeadId, isLeadDetailOpen, setLeadDetailOpen } = useUIStore();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const fetchLeadDetails = useCallback(async () => {
    if (!selectedLeadId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/leads/${selectedLeadId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lead details');
      }
      
      const data = await response.json();
      setLead(data);
    } catch (error) {
      console.error('Error fetching lead details:', error);
      setError('Failed to load lead details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedLeadId]);

  useEffect(() => {
    if (selectedLeadId && isLeadDetailOpen) {
      fetchLeadDetails();
    }
  }, [selectedLeadId, isLeadDetailOpen, fetchLeadDetails]);

  const handleClose = () => {
            setLeadDetailOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Sheet open={isLeadDetailOpen} onOpenChange={setLeadDetailOpen}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Lead Details</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        {isLoading ? (
          <LeadDetailSkeleton />
        ) : error ? (
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        ) : lead ? (
          <div className="mt-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{lead.name}</h3>
              <p className="text-sm text-muted-foreground">{lead.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="text-sm">{lead.company || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Position</p>
                <p className="text-sm">{lead.position || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <LeadStatusSelector 
                  leadId={lead.id} 
                  initialStatus={lead.status as 'Pending' | 'Contacted' | 'Responded' | 'Converted'} 
                  onStatusChange={() => fetchLeadDetails()}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Campaign</p>
                <p className="text-sm">{lead.campaign.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(lead.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Updated</p>
                <p className="text-sm">{formatDate(lead.updatedAt)}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Notes</p>
              <div className="rounded-md border p-3">
                <p className="text-sm whitespace-pre-wrap">
                  {lead.notes || 'No notes available.'}
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => setIsEditFormOpen(true)}>Edit Lead</Button>
            </div>
            
            <EditLeadForm
              leadId={lead.id}
              isOpen={isEditFormOpen}
              onOpenChange={setIsEditFormOpen}
              onLeadUpdated={fetchLeadDetails}
            />
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">No lead selected</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}



function LeadDetailSkeleton() {
  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[250px]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-[80px]" />
            <Skeleton className="h-5 w-[120px]" />
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <Skeleton className="h-3 w-[80px]" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>

      <div className="flex justify-between pt-4">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  );
}