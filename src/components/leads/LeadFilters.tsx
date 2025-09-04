'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type Campaign = {
  id: string;
  name: string;
};

interface LeadFiltersProps {
  className?: string;
}

export function LeadFilters({ className }: LeadFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedCampaignName, setSelectedCampaignName] = useState<string>('All Campaigns');

  // Get the current campaign filter from URL
  useEffect(() => {
    const campaignId = searchParams.get('campaignId');
    if (campaignId) {
      setSelectedCampaign(campaignId);
    }
  }, [searchParams]);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/campaigns');
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns);
          
          // Update selected campaign name if we have a campaign ID
          if (selectedCampaign) {
            const campaign = data.campaigns.find((c: Campaign) => c.id === selectedCampaign);
            if (campaign) {
              setSelectedCampaignName(campaign.name);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [selectedCampaign]);

  const handleCampaignSelect = (campaignId: string, campaignName: string) => {
    // Update URL with campaign filter
    const params = new URLSearchParams(searchParams.toString());
    
    if (campaignId === 'all') {
      params.delete('campaignId');
      setSelectedCampaign('');
      setSelectedCampaignName('All Campaigns');
    } else {
      params.set('campaignId', campaignId);
      setSelectedCampaign(campaignId);
      setSelectedCampaignName(campaignName);
    }
    
    // Reset to page 1 when changing filters
    params.set('page', '1');
    
    router.push(`?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : selectedCampaignName}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search campaigns..." />
            <CommandEmpty>No campaign found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="all"
                value="all"
                onSelect={() => handleCampaignSelect('all', 'All Campaigns')}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    !selectedCampaign ? 'opacity-100' : 'opacity-0'
                  )}
                />
                All Campaigns
              </CommandItem>
              {campaigns.map((campaign) => (
                <CommandItem
                  key={campaign.id}
                  value={campaign.name}
                  onSelect={() => handleCampaignSelect(campaign.id, campaign.name)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedCampaign === campaign.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {campaign.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}