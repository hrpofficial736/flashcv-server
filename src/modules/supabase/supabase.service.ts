import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase = createClient(
    process.env.SUPABASE_PROJECT_URI!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  async uploadFile(fileBuffer: Buffer, fileName: string, username: string) : Promise<string | null>{
    const bucket = process.env.SUPABASE_BUCKET_NAME;
    const filePath = `${username}/${fileName}`;
    const { error } = await this.supabase.storage.from(bucket!).upload(filePath, fileBuffer);
    if (error) {
        console.error("Error uploading the file : ", error);
        return null;
    }
    return this.supabase.storage.from(bucket!).getPublicUrl(filePath).data.publicUrl;
}
}
