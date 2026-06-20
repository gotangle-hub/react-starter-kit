import React, { useState } from 'react';
import { uploadWork } from '@/services/uploads';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function WorkUpload() {
  const { user } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !title) {
      setError('Please select a file and enter a title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await uploadWork(user.id, file, title, description);
      setSuccess(true);
      setFile(null);
      setTitle('');
      setDescription('');
      // TODO: Refresh work list or redirect
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Work uploaded successfully!</h2>
        <p className="text-muted-foreground">Your work is now visible in your profile and Explore.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div>
        <label className="block text-sm font-medium mb-1">Title (required)</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Brand Identity for Acme Corp"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description (optional)</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of the project..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">File</label>
        <Input type="file" onChange={handleFileChange} required />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" disabled={loading || !file || !title} className="w-full">
        {loading ? 'Uploading...' : 'Upload Work'}
      </Button>
    </form>
  );
}
