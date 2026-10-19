// src/services/cadTutorialService.ts
import { supabase } from "@/config/supabaseClient";
import { CAD_TUTORIALS, CadTutorial } from "@/data/cadTutorials";

const STORAGE_KEY = "hde_cad_tutorials_v1";

/**
 * Extracts standard 11-character YouTube video ID from any format:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - dQw4w9WgXcQ (raw ID)
 */
export function extractYouTubeId(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();

  // Match standard YouTube URL patterns
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }

  // Fallback: if user already typed raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

export const CadTutorialService = {
  /**
   * Get all tutorials: checks Supabase first, then local storage, then static fallback
   */
  async getTutorials(): Promise<CadTutorial[]> {
    try {
      // 1. Try Supabase
      const { data, error } = await supabase
        .from("cad_tutorials")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id || item.slug,
          title: item.title,
          category: item.category,
          categoryLabel: item.category_label || item.category,
          duration: item.duration || "3:00",
          youtubeId: item.youtube_id || item.youtubeId,
          icon: item.icon || "fa-pen-ruler",
          badge: item.badge,
          description: item.description,
          keyTakeaways: Array.isArray(item.key_takeaways)
            ? item.key_takeaways
            : typeof item.key_takeaways === "string"
            ? JSON.parse(item.key_takeaways)
            : item.keyTakeaways || [],
        }));
      }
    } catch {
      // Supabase table might not exist yet; continue to local storage
    }

    // 2. Try localStorage
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Error reading cad_tutorials from localStorage:", e);
      }
    }

    // 3. Fallback to pre-configured 20 masterclass tutorials
    return CAD_TUTORIALS;
  },

  /**
   * Save (Create or Update) a single tutorial
   */
  async saveTutorial(tutorial: CadTutorial): Promise<CadTutorial[]> {
    const cleanTutorial: CadTutorial = {
      ...tutorial,
      youtubeId: extractYouTubeId(tutorial.youtubeId),
    };

    // 1. Try upserting to Supabase
    try {
      await supabase.from("cad_tutorials").upsert({
        id: cleanTutorial.id,
        title: cleanTutorial.title,
        category: cleanTutorial.category,
        category_label: cleanTutorial.categoryLabel,
        duration: cleanTutorial.duration,
        youtube_id: cleanTutorial.youtubeId,
        icon: cleanTutorial.icon,
        badge: cleanTutorial.badge,
        description: cleanTutorial.description,
        key_takeaways: cleanTutorial.keyTakeaways,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // ignore table missing error
    }

    // 2. Update local storage
    let currentList = await this.getTutorials();
    const existingIndex = currentList.findIndex((t) => t.id === cleanTutorial.id);

    if (existingIndex >= 0) {
      currentList[existingIndex] = cleanTutorial;
    } else {
      currentList = [cleanTutorial, ...currentList];
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
      window.dispatchEvent(new Event("hde_cad_tutorials_updated"));
    }

    return currentList;
  },

  /**
   * Delete a tutorial
   */
  async deleteTutorial(id: string): Promise<CadTutorial[]> {
    // 1. Try deleting from Supabase
    try {
      await supabase.from("cad_tutorials").delete().eq("id", id);
    } catch {
      // ignore
    }

    // 2. Remove from local storage
    let currentList = await this.getTutorials();
    currentList = currentList.filter((t) => t.id !== id);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
      window.dispatchEvent(new Event("hde_cad_tutorials_updated"));
    }

    return currentList;
  },

  /**
   * Reset back to default 20 pre-configured tutorials
   */
  async resetToDefaults(): Promise<CadTutorial[]> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("hde_cad_tutorials_updated"));
    }
    return CAD_TUTORIALS;
  },
};
