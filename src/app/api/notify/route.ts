import { NextResponse } from "next/server";

export async function POST() {
  try {
    await fetch("https://ntfy.sh/adc-nss-cell", {
      method: "POST",
      headers: {
        Title: "New Website Visitor",
        Priority: "3",
        Tags: "computer",
      },
      body: "🌐 A new visitor opened the ADC NSS Portal.",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}