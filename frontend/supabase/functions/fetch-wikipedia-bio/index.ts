// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { playerId, playerName } = await req.json();

        if (!playerId || !playerName) {
            throw new Error("playerId and playerName are required");
        }

        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // 1. Fetch player info from DB to get the sport
        const { data: playerData, error: fetchError } = await supabaseAdmin
            .from("players")
            .select("sport")
            .eq("id", playerId)
            .single();

        if (fetchError) {
            console.error("Error fetching player sport:", fetchError);
        }

        const sport = playerData?.sport?.toLowerCase() || "";

        // 2. Fetch from Wikipedia
        console.log(`Fetching Wikipedia bio for: ${playerName} (Sport: ${sport})`);

        const tryFetch = async (title: string) => {
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;
            const res = await fetch(url);
            if (res.ok) return await res.json();
            if (res.status === 404) return null;
            throw new Error(`Wikipedia API error: ${res.statusText}`);
        };

        let wikiData = await tryFetch(playerName);

        // Fallback Step: Try with sport suffix if direct name fails
        if (!wikiData && sport) {
            let suffix = "";
            if (sport.includes("cricket")) suffix = " (cricketer)";
            else if (sport.includes("foot")) suffix = " (footballer)";
            else if (sport.includes("basket")) suffix = " (basketballer)";
            // Add more as needed

            if (suffix) {
                console.log(`Initial search failed, trying fallback: ${playerName}${suffix}`);
                wikiData = await tryFetch(`${playerName}${suffix}`);
            }
        }

        if (!wikiData) {
            throw new Error(`Wikipedia biography not found for "${playerName}"`);
        }

        const extract = wikiData.extract;
        const shortDescription = wikiData.description || "";
        const imageUrl = wikiData.thumbnail?.source || wikiData.originalimage?.source || "";

        if (!extract) {
            throw new Error("No extract found in Wikipedia response");
        }

        // 2. Update player description in Supabase
        const { error: updateError } = await supabaseAdmin
            .from("players")
            .update({
                description: extract,
                short_description: shortDescription,
                image_url: imageUrl,
                updated_at: new Date().toISOString()
            })
            .eq("id", playerId);

        if (updateError) throw updateError;

        return new Response(
            JSON.stringify({
                success: true,
                description: extract,
                shortDescription: shortDescription,
                imageUrl: imageUrl,
                message: `Biography synced for ${playerName}`
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400
            }
        );
    }
});
