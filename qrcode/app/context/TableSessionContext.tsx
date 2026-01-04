"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface TableSession {
    id: string;
    tableId: string;
    status: "ACTIVE" | "PAYMENT_PENDING" | "CLOSED";
    sessionId: string;
}

interface TableSessionContextType {
    session: TableSession | null;
    isLoading: boolean;
    joinSession: () => Promise<void>;
}

const TableSessionContext = createContext<TableSessionContextType | undefined>(
    undefined
);

export function TableSessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const tableNumber = params?.tableNumber as string;

    const [session, setSession] = useState<TableSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const joinSession = async () => {
        if (!tableNumber) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/api/tables/${tableNumber}/session`, {
                method: "POST",
            });
            const data = await response.json();

            if (data.error) {
                console.error("Error joining session:", data.error);
                return;
            }

            setSession(data);
        } catch (error) {
            console.error("Error joining session:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (tableNumber) {
            joinSession();
        } else {
            setIsLoading(false);
        }
    }, [tableNumber]);

    return (
        <TableSessionContext.Provider value={{ session, isLoading, joinSession }}>
            {children}
        </TableSessionContext.Provider>
    );
}

export function useTableSession() {
    const context = useContext(TableSessionContext);
    if (context === undefined) {
        throw new Error(
            "useTableSession must be used within a TableSessionProvider"
        );
    }
    return context;
}
