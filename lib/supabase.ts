import { createClient } from "@supabase/supabase-js";

// Called only at runtime (client-side), never at build time
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// Convenience singleton for client-side usage
export const supabase =
  typeof window !== "undefined"
    ? getSupabase()
    : // Return a dummy during SSR/build — pages are "use client" so this never runs
      (null as unknown as ReturnType<typeof getSupabase>);

export type AlumniStatus = "pending" | "approved" | "rejected";

export interface AlumniProfile {
  id?: string;
  created_at?: string;
  updated_at?: string;
  status?: AlumniStatus;
  reviewer_note?: string;
  reviewed_at?: string;

  full_name: string;
  email: string;
  phone?: string;
  profile_photo_url?: string;

  vedantu_study_years: string;
  vedantu_classes: string;
  vedantu_subjects?: string[];

  college_name: string;
  degree: string;
  college_year_of_passing?: number;

  current_company?: string;
  current_role?: string;
  current_city?: string;
  field: string;
  specialization?: string;

  exam_cleared?: string;
  rank_or_result?: string;

  bio?: string;
  linkedin_url?: string;
  tags?: string[];

  available_for_mentoring?: boolean;
  session_preference?: "1on1" | "group" | "both";
  preferred_session_duration?: number;

  referral_source?: string;
}

export async function submitAlumniProfile(
  data: AlumniProfile,
  photoFile?: File
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabase();
    let profile_photo_url: string | undefined;

    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await client.storage
        .from("alumni-photos")
        .upload(filename, photoFile, { upsert: false });

      if (uploadError)
        throw new Error("Photo upload failed: " + uploadError.message);

      const { data: urlData } = client.storage
        .from("alumni-photos")
        .getPublicUrl(filename);

      profile_photo_url = urlData.publicUrl;
    }

    const { error } = await client
      .from("alumni_profiles")
      .insert({ ...data, profile_photo_url, status: "pending" });

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}
