'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type LeadStatus = 'New' | 'Contacted' | 'Responded' | 'Converted' | 'Rejected';

type Campaign = {
  id: string;
  name: string;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  status: LeadStatus;
  notes: string;
  campaignId: string;
};

type EditLeadFormProps = {
  leadId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated?: () => void;
};

export function EditLeadForm({
  leadId,
  isOpen,
  onOpenChange,
  onLeadUpdated,
}: EditLeadFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [formData, setFormData] = useState<Lead>({
    id: '',
    name: '',
    email: '',
    company: '',
    position: '',
    status: 'New',
    notes: '',
    campaignId: '',
  });
  const [error, setError] = useState('');

  const fetchLeadDetails = useCallback(async () => {
    if (!leadId) return;
    
    setIsFetching(true);
    setError('');
    
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lead details');
      }
      
      const data = await response.json();
      setFormData({
        id: data.id,
        name: data.name,
        email: data.email,
        company: data.company || '',
        position: data.position || '',
        status: data.status,
        notes: data.notes || '',
        campaignId: data.campaignId,
      });
    } catch (error) {
      console.error('Error fetching lead details:', error);
      setError('Failed to load lead details. Please try again.');
    } finally {
      setIsFetching(false);
    }
  }, [leadId]);

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadDetails();
      fetchCampaigns();
    }
  }, [isOpen, leadId, fetchLeadDetails, fetchCampaigns]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.campaignId) {
      setError('Name, email, and campaign are required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update lead');
      }

      onOpenChange(false);
      if (onLeadUpdated) {
        onLeadUpdated();
      }
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Lead</SheetTitle>
        </SheetHeader>
        {isFetching ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading lead details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter lead name"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter lead email"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium">
                  Company
                </label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company name"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="position" className="text-sm font-medium">
                  Position
                </label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Job title"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Responded">Responded</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="campaignId" className="text-sm font-medium">
                  Campaign *
                </label>
                <Select
                  value={formData.campaignId}
                  onValueChange={(value) => handleSelectChange('campaignId', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="campaignId">
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional information"
                disabled={isLoading}
                rows={4}
              />
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}