import { db } from '@/db';
import { leads, campaigns } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc, asc, and, count } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const campaignId = url.searchParams.get('campaignId');
    const sortParam = url.searchParams.get('sort') || 'createdAt:desc';
    
    // Parse sort parameter
    const [sortField, sortDirection] = sortParam.split(':');
    const isDesc = sortDirection === 'desc';
    
    const offset = (page - 1) * limit;

    // Build query based on filters and sorting
    let orderByClause;
    if (sortField === 'name') {
      orderByClause = isDesc ? desc(leads.name) : asc(leads.name);
    } else if (sortField === 'status') {
      orderByClause = isDesc ? desc(leads.status) : asc(leads.status);
    } else {
      // Default to createdAt
      orderByClause = isDesc ? desc(leads.createdAt) : asc(leads.createdAt);
    }

    // Build query based on filters - get leads through campaigns
    let whereCondition;
    
    // Apply campaign filter if provided
    if (campaignId) {
      whereCondition = and(eq(campaigns.userId, session.user.id), eq(leads.campaignId, campaignId));
    } else {
      whereCondition = eq(campaigns.userId, session.user.id);
    }

    const userLeads = await db
      .select()
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(whereCondition)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: count() })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(whereCondition);

    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(Number(totalCount) / limit);

    return NextResponse.json({
      leads: userLeads,
      pagination: {
        total: Number(totalCount),
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
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

    const { name, email, company, campaignId } = await request.json();

    if (!name || !email || !campaignId) {
      return NextResponse.json(
        { error: 'Name, email, and campaign ID are required' },
        { status: 400 }
      );
    }

    const newLead = await db
      .insert(leads)
      .values({
        name,
        email,
        company: company || '',
        status: 'Pending',
        campaignId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newLead[0], { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}