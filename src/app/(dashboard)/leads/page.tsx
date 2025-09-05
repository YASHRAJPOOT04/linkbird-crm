'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadDetail } from '@/components/leads/LeadDetail';
import { AddLeadForm } from '@/components/leads/AddLeadForm';
import { LeadFilters } from '@/components/leads/LeadFilters';

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  status: 'Pending' | 'Contacted' | 'Responded' | 'Converted';
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const page = searchParams.get('page') || '1';
    const campaignId = searchParams.get('campaignId');
    fetchLeads(parseInt(page), campaignId);
  }, [searchParams]);

  const fetchLeads = async (page: number, campaignId?: string | null) => {
    setIsLoading(true);
    setError('');
    
    try {
      let url = `/api/leads?page=${page}&limit=${pagination.limit}`;
      if (campaignId) {
        url += `&campaignId=${campaignId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      const data = await response.json();
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Failed to load leads. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchLeads(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="flex items-center gap-2">
          <LeadFilters />
          <AddLeadForm />
        </div>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <LeadsTable
          leads={leads}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
        />
      )}

      <LeadDetail />
    </div>
  );
}