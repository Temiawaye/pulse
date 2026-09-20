"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

export type SettingsState = { error?: string; success?: string };

const schema = z.object({ 
   full_name: z.string().trim().min(2).max(80), 
   avatar_url: z.union([z.literal(""), z.string().url().max(2048)]), 
   theme: z.enum(["light","dark","system"]), 
   default_range: z.enum(["1h","24h","7d","30d"]), 
   slow_request_threshold: z.coerce.number().int().min(50).max(60000) 
});

export async function saveSettings(_: SettingsState, formData: FormData): Promise<SettingsState> { 
   const parsed = schema.safeParse(Object.fromEntries(formData));
   
   if (!parsed.success){
     return { error: parsed.error.issues[0].message }; 
   }

   const { supabase, user } = await requireUser(); 
   const { error } = await supabase.from("profiles").upsert({ 
      id: user.id, 
      ...parsed.data, 
      avatar_url: parsed.data.avatar_url || null, 
      updated_at: new Date().toISOString() 
   });
   
   if (error) {
    return { error: "Unable to save settings." };
   }
   
   revalidatePath("/settings");
   return { success: "Settings saved." };
}
