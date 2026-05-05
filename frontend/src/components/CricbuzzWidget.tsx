import React, { useEffect, useState } from 'react';
import api from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface CricbuzzWidgetProps {
    type: 'recent' | 'live' | 'upcoming' | 'match';
    matchId?: string; // Required if type === 'match'
    limit?: number;
    className?: string;
}

interface MatchData {
    matchId: number;
    seriesName: string;
    team1: { teamName: string; teamSName: string };
    team2: { teamName: string; teamSName: string };
    status: string;
    result?: string;
}

export const CricbuzzWidget: React.FC<CricbuzzWidgetProps> = ({
    type,
    matchId,
    limit = 5,
    className
}) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = '';
                if (type === 'match' && matchId) {
                    // Fetch generic match info or scorecard
                    url = `/cricbuzz/match/${matchId}/hscard`;
                } else if (type === 'recent') {
                    url = '/cricbuzz/matches/recent';
                } else if (type === 'live') {
                    url = '/cricbuzz/matches/live';
                } else if (type === 'upcoming') {
                    url = '/cricbuzz/matches/upcoming';
                }

                if (!url) throw new Error('Invalid widget configuration');

                const response = await api.get(url);
                if (response.data.status === 'success') {
                    setData(response.data.data);
                } else {
                    setError('Failed to fetch data');
                }
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || err.message || 'Error loading widget');
            } finally {
                setLoading(false);
            }
        };

        fetchData();


        // Auto-refresh every 60s
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [type, matchId]);

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={`border-red-200 bg-red-50 ${className}`}>
                <CardContent className="p-4 text-red-600 text-sm">
                    {error}
                </CardContent>
            </Card>
        );
    }

    // Render based on type
    if (type === 'recent' || type === 'live' || type === 'upcoming') {
        const matches = (data?.typeMatches || [])
            .flatMap((tm: any) => tm.seriesMatches || [])
            .flatMap((sm: any) => sm.seriesAdWrapper ? sm.seriesAdWrapper.matches : [])
            .slice(0, limit);

        if (matches.length === 0) {
            // Fallthrough to render card with empty message
        } else {
            // Matches exist
        }

        return (
            <Card className={`overflow-hidden ${className}`}>
                <CardHeader>
                    <CardTitle className="text-lg">
                        {type === 'recent' ? 'Recent Results' : type === 'live' ? 'Live Matches' : 'Upcoming'}
                    </CardTitle>
                </CardHeader>
                <div className="divide-y relative">
                    {matches.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            <p>Check back soon — matches update every 60 seconds.</p>
                        </div>
                    )}
                    {matches.map((match: any, i: number) => {
                        const m = match.matchInfo;
                        const s = match.matchScore;
                        return (
                            <div key={m.matchId || i} className="p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                                        {m.seriesName}
                                    </span>
                                    <Badge variant={m.state === 'Complete' ? 'secondary' : 'default'} className="text-[10px]">
                                        {m.state}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold">{m.team1.teamSName}</div>
                                    <div className="text-xs text-muted-foreground">vs</div>
                                    <div className="font-bold">{m.team2.teamSName}</div>
                                </div>
                                {m.status && (
                                    <p className="text-sm text-green-600 font-medium">
                                        {m.status}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        );
    }

    // Single Match Scorecard (Mock visualization for hscard data)
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Match Scorecard</CardTitle>
            </CardHeader>
            <CardContent>
                <pre className="text-xs overflow-auto max-h-60 bg-muted p-2 rounded">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </CardContent>
        </Card>
    );
};
