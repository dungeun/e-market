import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sections = await prisma.uISection.findMany({
      orderBy: {
        order: 'asc'
      },
      include: {
        texts: {
          orderBy: {
            key: 'asc'
          }
        }
      }
    });

    return NextResponse.json({
      sections: sections.map(section => ({
        ...section,
        content: section.data,
        isActive: section.isActive
      }))
    });
  } catch (error) {
    console.error('Failed to fetch UI sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch UI sections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      key,
      title,
      type,
      isActive = true,
      order = 0,
      data,
      props,
      style
    } = body;

    // Validate required fields
    if (!key || !type) {
      return NextResponse.json(
        { error: 'key and type are required' },
        { status: 400 }
      );
    }

    const section = await prisma.uISection.create({
      data: {
        key,
        title,
        type,
        isActive,
        order,
        data: data || {},
        props: props || {},
        style: style || {}
      }
    });

    return NextResponse.json({
      section: {
        ...section,
        content: section.data,
        isActive: section.isActive
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create UI section:', error);
    return NextResponse.json(
      { error: 'Failed to create UI section' },
      { status: 500 }
    );
  }
}