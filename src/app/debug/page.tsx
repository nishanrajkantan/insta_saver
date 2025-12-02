
'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/resolve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: 'https://www.instagram.com/f1/' }),
                });
                const json = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto h-[800px]">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
