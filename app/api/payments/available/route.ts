import { NextResponse } from "next/server";
import { getAvailablePaymentProviders } from "@/lib/payments";

export async function GET() {
    return NextResponse.json({
        providers: getAvailablePaymentProviders(),
    });
}
