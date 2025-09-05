import { db } from '@/db';
import { leads, campaigns } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession() as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, id),
      with: {
        campaign: true,
      },
    });

    // Check if the lead belongs to the user through the campaign
    if (!lead || lead.campaign.userId !== session.user.id) {
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession() as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, email, company, position, status, notes, campaignId } = await request.json();

    // Verify lead exists and belongs to user
    const existingLead = await db.query.leads.findFirst({
      where: eq(leads.id, id),
      with: {
        campaign: true,
      },
    });

    if (!existingLead || existingLead.campaign.userId !== session.user.id) {
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
      .where(eq(leads.id, id))
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession() as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify lead exists and belongs to user
    const existingLead = await db.query.leads.findFirst({
      where: eq(leads.id, id),
      with: {
        campaign: true,
      },
    });

    if (!existingLead || existingLead.campaign.userId !== session.user.id) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    await db
      .delete(leads)
      .where(eq(leads.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}