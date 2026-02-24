import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Loader2, AlertCircle } from "lucide-react";

interface PlayerBioCardProps {
    playerId: string;
    initialData?: {
        description: string | null;
        short_description: string | null;
        image_url: string | null;
    };
    hideHeaderInfo?: boolean;
}

export const PlayerBioCard = ({ playerId, initialData, hideHeaderInfo = false }: PlayerBioCardProps) => {
    const [bioData, setBioData] = useState<{
        description: string | null;
        short_description: string | null;
        image_url: string | null;
    }>(initialData || { description: null, short_description: null, image_url: null });
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setBioData(initialData);
            setLoading(false);
            return;
        }

        const fetchBio = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error: sbError } = await supabase
                    .from("players")
                    .select("description, short_description, image_url")
                    .eq("id", playerId)
                    .single();

                if (sbError) {
                    if (sbError.code === "PGRST116") {
                        setBioData({ description: null, short_description: null, image_url: null });
                    } else {
                        throw sbError;
                    }
                } else {
                    const sbData = data as any;
                    setBioData({
                        description: sbData.description || null,
                        short_description: sbData.short_description || null,
                        image_url: sbData.image_url || null
                    });
                }
            } catch (err: any) {
                console.error("Error fetching player bio:", err);
                setError("Could not load biography.");
            } finally {
                setLoading(false);
            }
        };

        if (playerId) fetchBio();
    }, [playerId]);

    if (loading) {
        return (
            <Card className="card-glass border-0 animate-pulse">
                <CardContent className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    const { description, short_description, image_url } = bioData;

    return (
        <Card className="card-glass border-0 overflow-hidden animate-slide-up">
            {!hideHeaderInfo && (
                <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 overflow-hidden border border-white/10 shadow-inner">
                            {image_url ? (
                                <img src={image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-muted-foreground/50" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                Biography
                            </CardTitle>
                            {short_description && (
                                <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-0.5">
                                    {short_description}
                                </p>
                            )}
                        </div>
                    </div>
                </CardHeader>
            )}
            {hideHeaderInfo && (
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Biography
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>
                {error ? (
                    <div className="flex items-center gap-2 text-destructive text-sm py-2">
                        <AlertCircle className="w-4 h-4" />
                        <p>{error}</p>
                    </div>
                ) : description ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                        {description.split('\n').map((para, idx) => (
                            <p key={idx} className={idx > 0 ? "mt-4" : ""}>{para}</p>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic py-2">
                        No biography available.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
