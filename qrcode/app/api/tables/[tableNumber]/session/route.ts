import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function POST(
    request: NextRequest,
    { params }: { params: { tableNumber: string } }
) {
    const tableNumber = params.tableNumber;

    try {
        // 1. Find the table
        const table = await prisma.table.findFirst({
            where: { number: tableNumber },
        });

        if (!table) {
            return NextResponse.json(
                { error: "Table not found" },
                { status: 404 }
            );
        }

        // 2. Check for an active session
        let session = await prisma.tableSession.findFirst({
            where: {
                tableId: table.id,
                status: "ACTIVE",
            },
            include: {
                orders: true,
            },
        });

        // 3. If no active session, create one
        if (!session) {
            session = await prisma.tableSession.create({
                data: {
                    tableId: table.id,
                    status: "ACTIVE",
                },
                include: {
                    orders: true,
                },
            });
        }

        return NextResponse.json(session);
    } catch (error) {
        console.error("Error creating/joining session:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { tableNumber: string } }
) {
    const tableNumber = params.tableNumber;

    try {
        // 1. Find the table
        const table = await prisma.table.findFirst({
            where: { number: tableNumber },
        });

        if (!table) {
            return NextResponse.json(
                { error: "Table not found" },
                { status: 404 }
            );
        }

        // 2. Find active session
        const session = await prisma.tableSession.findFirst({
            where: {
                tableId: table.id,
                status: "ACTIVE",
            },
            include: {
                orders: true,
            },
        });

        if (!session) {
            return NextResponse.json({ active: false });
        }

        return NextResponse.json({ active: true, session });

    } catch (error) {
        console.error("Error fetching session:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
