import { supabase } from '@/integrations/supabase/client';

import { uploadProfilePicture } from './uploads';

// Update user profile picture
export async function updateProfilePicture(userId: string, file: File) {
  try {
    const avatarUrl = await uploadProfilePicture(userId, file);
    return avatarUrl;
  } catch (error) {
    console.error('Failed to update profile picture:', error);
    throw error;
  }
}

// Get profile by user ID
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
