import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apprenticeId, rating, comment, studentId } = body

    // Validate required fields
    if (!apprenticeId || !rating) {
      return NextResponse.json(
        { error: 'Apprentice ID and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Verify apprentice exists
    const { data: apprentice, error: apprenticeError } = await supabase
      .from('apprentices')
      .select('id')
      .eq('id', apprenticeId)
      .single()

    if (apprenticeError || !apprentice) {
      return NextResponse.json(
        { error: 'Apprentice not found' },
        { status: 404 }
      )
    }

    // Create rating record
    const { data: newRating, error: ratingError } = await supabase
      .from('ratings')
      .insert({
        apprentice_id: apprenticeId,
        student_id: studentId || null, // Optional: link to student if authenticated
        rating,
        comment: comment || null,
      })
      .select()
      .single()

    if (ratingError) {
      console.error('Rating creation error:', ratingError)
      return NextResponse.json(
        { error: 'Failed to submit rating' },
        { status: 500 }
      )
    }

    // Recalculate average rating for this apprentice
    const { data: allRatings, error: ratingsError } = await supabase
      .from('ratings')
      .select('rating')
      .eq('apprentice_id', apprenticeId)

    if (!ratingsError && allRatings) {
      const averageRating =
        allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length

      // Update apprentice's average rating
      await supabase
        .from('apprentices')
        .update({ average_rating: averageRating })
        .eq('id', apprenticeId)
    }

    return NextResponse.json({
      success: true,
      ratingId: newRating.id,
      message: 'Rating submitted successfully',
    })
  } catch (error) {
    console.error('Submit rating error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const apprenticeId = req.nextUrl.searchParams.get('apprenticeId')

    if (!apprenticeId) {
      return NextResponse.json(
        { error: 'Apprentice ID is required' },
        { status: 400 }
      )
    }

    // Get all ratings for this apprentice
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('rating, comment, created_at')
      .eq('apprentice_id', apprenticeId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch ratings' },
        { status: 500 }
      )
    }

    // Calculate average
    const averageRating =
      ratings && ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0

    return NextResponse.json({
      ratings: ratings || [],
      averageRating: parseFloat(averageRating.toFixed(1)),
      count: ratings?.length || 0,
    })
  } catch (error) {
    console.error('Get ratings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
