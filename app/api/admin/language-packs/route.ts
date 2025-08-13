import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get('languageCode') || 'ko';

    const languagePacks = await prisma.languagePack.findMany({
      where: {
        languageCode,
        isActive: true
      },
      orderBy: {
        key: 'asc'
      }
    });

    return NextResponse.json(languagePacks);
  } catch (error) {
    console.error('Failed to fetch language packs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch language packs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      languageCode,
      namespace = 'admin',
      key,
      value,
      description,
      category
    } = body;

    // Validate required fields
    if (!languageCode || !key || !value) {
      return NextResponse.json(
        { error: 'languageCode, key, and value are required' },
        { status: 400 }
      );
    }

    const languagePack = await prisma.languagePack.create({
      data: {
        languageCode,
        namespace,
        key,
        value,
        description,
        category,
        isActive: true,
        version: 1
      }
    });

    return NextResponse.json(languagePack, { status: 201 });
  } catch (error) {
    console.error('Failed to create language pack:', error);
    return NextResponse.json(
      { error: 'Failed to create language pack' },
      { status: 500 }
    );
  }
}