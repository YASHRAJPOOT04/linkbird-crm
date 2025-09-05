import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc, asc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const sortParam = searchParams.get('sort') || 'createdAt:desc';
    
    // Parse sort parameter
    const [sortField, sortDirection] = sortParam.split(':');
    const isDesc = sortDirection === 'desc';
    
    // Build query with sorting
    let orderByClause;
    if (sortField === 'name') {
      orderByClause = isDesc ? desc(campaigns.name) : asc(campaigns.name);
    } else if (sortField === 'status') {
      orderByClause = isDesc ? desc(campaigns.status) : asc(campaigns.status);
    } else {
      // Default sort by createdAt
      orderByClause = isDesc ? desc(campaigns.createdAt) : asc(campaigns.createdAt);
    }
    
    const userCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, session.user.id))
      .orderBy(orderByClause)
      .limit(limit);

    // For now, return campaigns without leads data
    const campaignsWithStats = userCampaigns.map((campaign) => ({
      ...campaign,
      responseRate: 0,
      totalLeads: 0,
      respondedLeads: 0,
    }));

    return NextResponse.json(campaignsWithStats);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, status = 'Draft' } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Campaign name is required' },
        { status: 400 }
      );
    }

    const newCampaign = await db
      .insert(campaigns)
      .values({
        name,
        status,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newCampaign[0], { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}