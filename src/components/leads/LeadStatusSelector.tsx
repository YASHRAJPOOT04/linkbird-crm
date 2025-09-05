'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

type LeadStatus = 'Pending' | 'Contacted' | 'Responded' | 'Converted';

const statuses: { value: LeadStatus; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Responded', label: 'Responded' },
  { value: 'Converted', label: 'Converted' },
];

interface LeadStatusSelectorProps {
  leadId: string;
  initialStatus: LeadStatus;
  onStatusChange?: (newStatus: LeadStatus) => void;
}

export function LeadStatusSelector({ leadId, initialStatus, onStatusChange }: LeadStatusSelectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (newStatus === status) {
      setOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        if (onStatusChange) {
          onStatusChange(newStatus);
        }
        router.refresh();
      } else {
        console.error('Failed to update lead status');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
    } finally {
      setIsUpdating(false);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isUpdating}
        >
          {status}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search status..." />
          <CommandEmpty>No status found.</CommandEmpty>
          <CommandGroup>
            {statuses.map((statusOption) => (
              <CommandItem
                key={statusOption.value}
                value={statusOption.value}
                onSelect={() => handleStatusChange(statusOption.value)}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    status === statusOption.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {statusOption.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}