import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Reviews API called')
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const offset = (page - 1) * limit
    
    console.log('Getting database connection...')
    
    // Build SQL query manually
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1
    
    if (status && status !== 'all') {
      whereClause += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
    
    if (search) {
      whereClause += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR customer_name ILIKE $${paramIndex} OR product_name ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }
    
    // Get reviews with raw SQL
    const reviewsQuery = `
      SELECT id, product_id, product_name, user_id, customer_name, customer_email,
             rating, title, content, images, helpful, status, verified, reply,
             reply_date, created_at, updated_at
      FROM reviews
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(limit, offset)
    
    console.log('Executing reviews query:', reviewsQuery)
    console.log('With params:', params)
    
    const reviewsResult = await query(reviewsQuery, params)
    
    console.log('Reviews query successful, got', reviewsResult.rows.length, 'rows')
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM reviews ${whereClause}`
    const countParams = params.slice(0, params.length - 2) // Remove limit and offset
    
    console.log('Executing count query:', countQuery)
    console.log('With params:', countParams)
    
    const countResult = await query(countQuery, countParams)
    
    const total = parseInt(countResult.rows[0].count as string)
    const totalPages = Math.ceil(total / limit)
    
    // Get stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'flagged' THEN 1 END) as flagged,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN verified = true THEN 1 END) as verified,
        ROUND(AVG(rating)::numeric, 1) as avgRating
      FROM reviews
    `
    
    console.log('Executing stats query:', statsQuery)
    const statsResult = await query(statsQuery, [])
    
    const statsRow = statsResult.rows[0]
    const stats = {
      total: parseInt(statsRow.total as string) || 0,
      approved: parseInt(statsRow.approved as string) || 0,
      pending: parseInt(statsRow.pending as string) || 0,
      flagged: parseInt(statsRow.flagged as string) || 0,
      rejected: parseInt(statsRow.rejected as string) || 0,
      verified: parseInt(statsRow.verified as string) || 0,
      avgRating: parseFloat(statsRow.avgrating as string) || 0,
    }
    
    console.log('All queries successful, returning response')
    
    return NextResponse.json({
      success: true,
      reviews: reviewsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      stats
    })
    
  } catch (error) {
    console.error('Error fetching reviews:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch reviews', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewId, status, reply } = body
    
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      )
    }
    
    // Build update query
    const updateFields: string[] = []
    const params: any[] = []
    let paramIndex = 1
    
    if (status) {
      updateFields.push(`status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }
    
    if (reply) {
      updateFields.push(`reply = $${paramIndex}`)
      params.push(reply)
      paramIndex++
      updateFields.push(`reply_date = CURRENT_TIMESTAMP`)
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
    
    const updateQuery = `
      UPDATE reviews 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `
    params.push(reviewId)
    
    const result = await query(updateQuery, params)
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      review: result.rows[0]
    })
    
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reviewId = searchParams.get('reviewId')
    
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      )
    }
    
    const deleteQuery = `DELETE FROM reviews WHERE id = $1 RETURNING *`
    const result = await query(deleteQuery, [reviewId])
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}