// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// JSON 파일 업데이트 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionKey, data } = body;

    if (!sectionKey || !data) {
      return NextResponse.json({ 
        error: 'sectionKey and data are required' 
      }, { status: 400 });
    }

    // JSON 파일 경로
    const jsonFilePath = path.join(process.cwd(), 'public/locales/ui-sections.json');

    // 기존 JSON 파일 읽기
    let existingData: any = {};
    try {
      const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
      // 파일이 없으면 빈 객체로 시작

    }

    // 해당 섹션 데이터 업데이트
    existingData[sectionKey] = data;

    // JSON 파일 쓰기 (pretty format)
    await fs.writeFile(
      jsonFilePath, 
      JSON.stringify(existingData, null, 2), 
      'utf-8'
    );

    // 추가: 백업 파일 생성 (선택사항)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(
      process.cwd(), 
      'public/locales/backups',
      `ui-sections-${timestamp}.json`
    );
    
    try {
      // 백업 폴더 생성
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.writeFile(backupPath, JSON.stringify(existingData, null, 2), 'utf-8');
    } catch (backupError) {

    }

    return NextResponse.json({ 
      success: true,
      message: `Section ${sectionKey} updated successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {

    return NextResponse.json({ 
      error: 'Failed to update UI localization file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET: 현재 JSON 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionKey = searchParams.get('section');

    const jsonFilePath = path.join(process.cwd(), 'public/locales/ui-sections.json');
    
    try {
      const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      if (sectionKey) {
        // 특정 섹션만 반환
        return NextResponse.json({
          success: true,
          section: sectionKey,
          data: data[sectionKey] || null
        });
      } else {
        // 전체 데이터 반환
        return NextResponse.json({
          success: true,
          data
        });
      }
    } catch (fileError) {
      return NextResponse.json({
        success: false,
        error: 'UI sections file not found',
        data: {}
      }, { status: 404 });
    }

  } catch (error) {

    return NextResponse.json({ 
      error: 'Failed to read UI localization file'
    }, { status: 500 });
  }
}