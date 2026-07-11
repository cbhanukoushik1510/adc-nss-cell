import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    // Get current count
    const { data, error } = await supabase
      .from("site_stats")
      .select("visitor_count")
      .eq("id", 1)
      .single();

    if (error) throw error;

    const newCount = (data?.visitor_count ?? 0) + 1;

    // Update count
    const { error: updateError } = await supabase
      .from("site_stats")
      .update({
        visitor_count: newCount,
      })
      .eq("id", 1);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      visitorCount: newCount,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  const { data } = await supabase
    .from("site_stats")
    .select("visitor_count")
    .eq("id", 1)
    .single();

  return NextResponse.json({
    visitorCount: data?.visitor_count ?? 0,
  });
}