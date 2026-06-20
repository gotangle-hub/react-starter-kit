import { supabase } from '@/integrations/supabase/client';

// Upload profile picture
 export async function uploadProfilePicture(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', userId);

  if (updateError) throw updateError;

  return data.publicUrl;
}

// Upload work with custom title
export async function uploadWork(userId: string, file: File, title: string, description?: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase
    .storage
    .from('work')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('work').getPublicUrl(fileName);

  // Insert work record with title
  const { error: insertError } = await supabase
    .from('work')
    .insert({
      user_id: userId,
      title: title,
      description: description || null,
      file_url: data.publicUrl,
      file_type: file.type,
    });

  if (insertError) throw insertError;

  return data.publicUrl;
}

// Get user's work
export async function getUserWork(userId: string) {
  const { data, error } = await supabase
    .from('work')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}