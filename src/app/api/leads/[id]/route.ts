import { db } from '@/db';
import { leads } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lead = await db.query.leads.findFirst({
      where: and(
        eq(leads.id, params.id),
        eq(leads.userId, session.user.id)
      ),
      with: {
        campaign: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, company, position, status, notes, campaignId } = await request.json();

    // Verify lead exists and belongs to user
    const existingLead = await db.query.leads.findFirst({
      where: and(
        eq(leads.id, params.id),
        eq(leads.userId, session.user.id)
      ),
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const updatedLead = await db
      .update(leads)
      .set({
        ...(name && { name }),
        ...(email && { email }),
        ...(company !== undefined && { company }),
        ...(position !== undefined && { position }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(campaignId && { campaignId }),
        updatedAt: new Date(),
      })
      .where(
        and(eq(leads.id, params.id), eq(leads.userId, session.user.id))
      )
      .returning();

    return NextResponse.json(updatedLead[0]);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify lead exists and belongs to user
    const existingLead = await db.query.leads.findFirst({
      where: and(
        eq(leads.id, params.id),
        eq(leads.userId, session.user.id)
      ),
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    await db
      .delete(leads)
      .where(
        and(eq(leads.id, params.id), eq(leads.userId, session.user.id))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}