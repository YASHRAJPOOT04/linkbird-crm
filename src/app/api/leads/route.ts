import { db } from '@/db';
import { leads } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
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
      orderByClause = (leads, { desc, asc }) => isDesc ? [desc(leads.name)] : [asc(leads.name)];
    } else if (sortField === 'status') {
      orderByClause = (leads, { desc, asc }) => isDesc ? [desc(leads.status)] : [asc(leads.status)];
    } else {
      // Default to createdAt
      orderByClause = (leads, { desc, asc }) => isDesc ? [desc(leads.createdAt)] : [asc(leads.createdAt)];
    }

    // Build query based on filters
    let query = db.query.leads.findMany({
      where: eq(leads.userId, session.user.id),
      with: {
        campaign: true,
      },
      limit,
      offset,
      orderBy: orderByClause,
    });

    // Apply campaign filter if provided
    if (campaignId) {
      query = db.query.leads.findMany({
        where: (leads, { and, eq }) => 
          and(eq(leads.userId, session.user.id), eq(leads.campaignId, campaignId)),
        with: {
          campaign: true,
        },
        limit,
        offset,
        orderBy: orderByClause,
      });
    }

    const userLeads = await query;

    // Get total count for pagination
    const countQuery = campaignId
      ? db.select({ count: db.fn.count() }).from(leads)
          .where(eq(leads.userId, session.user.id))
          .where(eq(leads.campaignId, campaignId))
      : db.select({ count: db.fn.count() }).from(leads)
          .where(eq(leads.userId, session.user.id));

    const [{ count }] = await countQuery;
    const totalPages = Math.ceil(Number(count) / limit);

    return NextResponse.json({
      leads: userLeads,
      pagination: {
        total: Number(count),
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

    const { name, email, company, position, campaignId, notes } = await request.json();

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
        position: position || '',
        status: 'New',
        campaignId,
        userId: session.user.id,
        notes: notes || '',
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