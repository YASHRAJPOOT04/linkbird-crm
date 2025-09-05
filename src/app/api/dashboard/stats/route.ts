import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, campaigns } from '@/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get total leads count (through campaigns)
    const totalLeadsResult = await db
      .select({ count: count() })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(eq(campaigns.userId, userId));

    const totalLeads = totalLeadsResult[0]?.count || 0;

    // Get new leads count (Pending status)
    const newLeadsResult = await db
      .select({ count: count() })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(and(eq(campaigns.userId, userId), eq(leads.status, 'Pending')));

    const newLeads = newLeadsResult[0]?.count || 0;

    // Get contacted leads count
    const contactedLeadsResult = await db
      .select({ count: count() })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(and(eq(campaigns.userId, userId), eq(leads.status, 'Contacted')));

    const contactedLeads = contactedLeadsResult[0]?.count || 0;

    // Get converted leads count for conversion rate
    const convertedLeadsResult = await db
      .select({ count: count() })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(and(eq(campaigns.userId, userId), eq(leads.status, 'Converted')));

    const convertedLeads = convertedLeadsResult[0]?.count || 0;

    // Calculate conversion rate (converted leads / total leads) * 100
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    return NextResponse.json({
      totalLeads,
      newLeads,
      contactedLeads,
      conversionRate,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}