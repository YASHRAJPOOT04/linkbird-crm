'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Play, Pause, Trash } from 'lucide-react';
import { EditCampaignForm } from './EditCampaignForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CampaignStatus = 'Draft' | 'Active' | 'Paused' | 'Completed';

type CampaignActionsProps = {
  id: string;
  status: CampaignStatus;
  // onEdit?: () => void; // Removed unused prop
};

export function CampaignActions({ id, status }: CampaignActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [campaignData, setCampaignData] = useState<{ id: string; name: string; status: CampaignStatus }>({ 
    id, 
    name: '', 
    status 
  });

  const updateStatus = async (newStatus: CampaignStatus) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign status');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating campaign status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampaign = async () => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      {status === 'Draft' && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => updateStatus('Active')}
          disabled={isLoading}
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
      {status === 'Active' && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => updateStatus('Paused')}
          disabled={isLoading}
        >
          <Pause className="h-4 w-4" />
        </Button>
      )}
      {status === 'Paused' && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => updateStatus('Active')}
          disabled={isLoading}
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        onClick={async () => {
          try {
            const response = await fetch(`/api/campaigns/${id}`);
            if (response.ok) {
              const data = await response.json();
              setCampaignData({
                id: data.id,
                name: data.name,
                status: data.status
              });
              setIsEditFormOpen(true);
            }
          } catch (error) {
            console.error('Error fetching campaign details:', error);
          }
        }}
        disabled={isLoading}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={deleteCampaign}
        disabled={isLoading}
      >
        <Trash className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" disabled={isLoading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => updateStatus('Completed')}>
            Mark as Completed
          </DropdownMenuItem>
          {status === 'Completed' && (
            <DropdownMenuItem onClick={() => updateStatus('Draft')}>
              Reopen as Draft
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCampaignForm
        campaign={campaignData}
        isOpen={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
      />
    </div>
  );
}