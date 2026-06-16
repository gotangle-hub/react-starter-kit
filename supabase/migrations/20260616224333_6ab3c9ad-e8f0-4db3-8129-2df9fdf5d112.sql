
-- 1. Add disciplines to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disciplines text[] NOT NULL DEFAULT '{}';

-- 2. posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text,
  place text,
  year int,
  image_path text,
  promoted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_author_created_idx ON public.posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS posts_created_idx ON public.posts(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts public read" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts insert own" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts update own" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts delete own" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- 3. follows
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);
CREATE INDEX IF NOT EXISTS follows_followee_idx ON public.follows(followee_id);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows public read" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows insert own" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows delete own" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- 4. interactions
CREATE TABLE IF NOT EXISTS public.interactions (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_kind text NOT NULL CHECK (target_kind IN ('post','maker')),
  target_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('view','save','pin','connect','dwell','like','comment')),
  weight real NOT NULL DEFAULT 1,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS interactions_user_created_idx ON public.interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS interactions_target_idx ON public.interactions(target_kind, target_id);
GRANT SELECT, INSERT ON public.interactions TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.interactions_id_seq TO authenticated;
GRANT ALL ON public.interactions TO service_role;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interactions read own" ON public.interactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "interactions insert own" ON public.interactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. user_interests
CREATE TABLE IF NOT EXISTS public.user_interests (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag text NOT NULL,
  weight real NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tag)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_interests TO authenticated;
GRANT ALL ON public.user_interests TO service_role;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interests read own" ON public.user_interests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "interests write own" ON public.user_interests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Update handle_new_user to also seed disciplines + interests from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  meta_type text;
  resolved public.account_type;
  meta_disciplines text[];
  d text;
BEGIN
  meta_type := NEW.raw_user_meta_data->>'account_type';
  IF meta_type IN ('designer','studio','client','institution','student','collector') THEN
    resolved := meta_type::public.account_type;
  ELSE
    resolved := 'designer';
  END IF;

  BEGIN
    SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'disciplines'))
    INTO meta_disciplines;
  EXCEPTION WHEN OTHERS THEN
    meta_disciplines := '{}';
  END;
  IF meta_disciplines IS NULL THEN meta_disciplines := '{}'; END IF;

  INSERT INTO public.profiles (id, account_type, display_name, disciplines)
  VALUES (
    NEW.id,
    resolved,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', NULL),
    meta_disciplines
  )
  ON CONFLICT (id) DO NOTHING;

  IF array_length(meta_disciplines, 1) IS NOT NULL THEN
    FOREACH d IN ARRAY meta_disciplines LOOP
      INSERT INTO public.user_interests (user_id, tag, weight)
      VALUES (NEW.id, d, 1)
      ON CONFLICT (user_id, tag) DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;
