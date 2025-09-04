import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, campaigns } from '@/lib/db/schema';
import { eq, sql, count } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get total leads count
    const totalLeadsResult = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.userId, userId));

    const totalLeads = totalLeadsResult[0]?.count || 0;

    // Get new leads count
    const newLeadsResult = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.userId, userId))
      .where(eq(leads.status, 'New'));

    const newLeads = newLeadsResult[0]?.count || 0;

    // Get qualified leads count
    const qualifiedLeadsResult = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.userId, userId))
      .where(eq(leads.status, 'Qualified'));

    const qualifiedLeads = qualifiedLeadsResult[0]?.count || 0;

    // Get won leads count for conversion rate
    const wonLeadsResult = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.userId, userId))
      .where(eq(leads.status, 'Won'));

    const wonLeads = wonLeadsResult[0]?.count || 0;

    // Calculate conversion rate (won leads / total leads) * 100
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    return NextResponse.json({
      totalLeads,
      newLeads,
      qualifiedLeads,
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