import { NextResponse } from "next/server";

export async function POST() {
  try {
    await fetch("https://ntfy.sh/adc-nss-cell", {
      method: "POST",
      headers: {
        Title: "🌐 ADC NSS Visitor",
        
        Tags: "computer",
      },
      body: "A new visitor opened the ADC NSS Portal.",
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Notification failed",
      },
      {
        status: 500,
      }
    );
  }
}