import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession() as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await db
      .select()
      .from(campaigns)
      .where(and(
        eq(campaigns.id, id),
        eq(campaigns.userId, session.user.id)
      ))
      .limit(1);

    if (!campaign[0]) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign[0]);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession() as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, status } = await request.json();

    // Verify campaign exists and belongs to user
    const existingCampaign = await db
      .select()
      .from(campaigns)
      .where(and(
        eq(campaigns.id, id),
        eq(campaigns.userId, session.user.id)
      ))
      .limit(1);

    if (!existingCampaign[0]) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const updatedCampaign = await db
      .update(campaigns)
      .set({
        ...(name && { name }),
        ...(status && { status }),
        updatedAt: new Date(),
      })
      .where(
        and(eq(campaigns.id, id), eq(campaigns.userId, session.user.id))
      )
      .returning();

    return NextResponse.json(updatedCampaign[0]);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession() as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify campaign exists and belongs to user
    const existingCampaign = await db
      .select()
      .from(campaigns)
      .where(and(
        eq(campaigns.id, id),
        eq(campaigns.userId, session.user.id)
      ))
      .limit(1);

    if (!existingCampaign[0]) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    await db
      .delete(campaigns)
      .where(
        and(eq(campaigns.id, id), eq(campaigns.userId, session.user.id))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}