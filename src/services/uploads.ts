import { supabase } from '@/integrations/supabase/client';

// Simple image compression using canvas (no extra dependencies)
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// Upload profile picture with compression
export async function uploadProfilePicture(userId: string, file: File) {
  const compressedFile = await compressImage(file, 800, 0.85);

  const fileExt = compressedFile.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(fileName, compressedFile, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', userId);

  if (updateError) throw updateError;

  return data.publicUrl;
}

// Upload work with compression + title
export async function uploadWork(userId: string, file: File, title: string, description?: string) {
  let fileToUpload = file;

  // Compress images only
  if (file.type.startsWith('image/')) {
    fileToUpload = await compressImage(file, 1400, 0.85);
  }

  const fileExt = fileToUpload.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase
    .storage
    .from('work')
    .upload(fileName, fileToUpload);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('work').getPublicUrl(fileName);

  const { error: insertError } = await supabase
    .from('work')
    .insert({
      user_id: userId,
      title,
      description: description || null,
      file_url: data.publicUrl,
      file_type: fileToUpload.type,
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
