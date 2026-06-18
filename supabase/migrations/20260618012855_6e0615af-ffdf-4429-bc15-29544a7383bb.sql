
-- Classes / institution teaching
CREATE TYPE public.class_kind AS ENUM ('studio','theoretical');
CREATE TYPE public.class_role AS ENUM ('professor','ta','student');
CREATE TYPE public.class_member_status AS ENUM ('active','invited','left');
CREATE TYPE public.class_doc_kind AS ENUM ('project','document','brief','reference');
CREATE TYPE public.class_invite_status AS ENUM ('pending','accepted','cancelled','expired');

-- ===== classes =====
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  year text,
  institution_id uuid,
  professor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_type public.class_kind NOT NULL DEFAULT 'studio',
  allow_student_pins boolean NOT NULL DEFAULT false,
  brief text,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- ===== class_members =====
CREATE TABLE public.class_members (
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.class_role NOT NULL DEFAULT 'student',
  status public.class_member_status NOT NULL DEFAULT 'active',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_members TO authenticated;
GRANT ALL ON public.class_members TO service_role;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- ===== class_documents =====
CREATE TABLE public.class_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  uploader_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.class_doc_kind NOT NULL DEFAULT 'document',
  title text NOT NULL,
  body text,
  file_path text,
  link_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_documents TO authenticated;
GRANT ALL ON public.class_documents TO service_role;
ALTER TABLE public.class_documents ENABLE ROW LEVEL SECURITY;

-- ===== class_invites =====
CREATE TABLE public.class_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.class_role NOT NULL DEFAULT 'ta',
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18),'hex'),
  status public.class_invite_status NOT NULL DEFAULT 'pending',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_invites TO authenticated;
GRANT ALL ON public.class_invites TO service_role;
ALTER TABLE public.class_invites ENABLE ROW LEVEL SECURITY;

-- ===== helper functions (security definer) =====
CREATE OR REPLACE FUNCTION public.is_class_member(_class uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.class_members
    WHERE class_id = _class AND user_id = _user AND status = 'active');
$$;

CREATE OR REPLACE FUNCTION public.is_class_staff(_class uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.class_members
    WHERE class_id = _class AND user_id = _user AND status = 'active'
      AND role IN ('professor','ta'));
$$;

CREATE OR REPLACE FUNCTION public.is_class_professor(_class uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.classes WHERE id = _class AND professor_id = _user);
$$;

-- ===== RLS policies =====
CREATE POLICY classes_select ON public.classes FOR SELECT TO authenticated
  USING (professor_id = auth.uid() OR public.is_class_member(id, auth.uid()));
CREATE POLICY classes_insert ON public.classes FOR INSERT TO authenticated
  WITH CHECK (professor_id = auth.uid());
CREATE POLICY classes_update ON public.classes FOR UPDATE TO authenticated
  USING (professor_id = auth.uid()) WITH CHECK (professor_id = auth.uid());
CREATE POLICY classes_delete ON public.classes FOR DELETE TO authenticated
  USING (professor_id = auth.uid());

CREATE POLICY class_members_select ON public.class_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_class_member(class_id, auth.uid()) OR public.is_class_professor(class_id, auth.uid()));
CREATE POLICY class_members_insert ON public.class_members FOR INSERT TO authenticated
  WITH CHECK (public.is_class_professor(class_id, auth.uid()) OR user_id = auth.uid());
CREATE POLICY class_members_update ON public.class_members FOR UPDATE TO authenticated
  USING (public.is_class_professor(class_id, auth.uid()) OR user_id = auth.uid());
CREATE POLICY class_members_delete ON public.class_members FOR DELETE TO authenticated
  USING (public.is_class_professor(class_id, auth.uid()) OR user_id = auth.uid());

CREATE POLICY class_docs_select ON public.class_documents FOR SELECT TO authenticated
  USING (public.is_class_member(class_id, auth.uid()) OR public.is_class_professor(class_id, auth.uid()));
CREATE POLICY class_docs_insert ON public.class_documents FOR INSERT TO authenticated
  WITH CHECK (uploader_id = auth.uid() AND public.is_class_staff(class_id, auth.uid()));
CREATE POLICY class_docs_update ON public.class_documents FOR UPDATE TO authenticated
  USING (uploader_id = auth.uid() OR public.is_class_professor(class_id, auth.uid()));
CREATE POLICY class_docs_delete ON public.class_documents FOR DELETE TO authenticated
  USING (uploader_id = auth.uid() OR public.is_class_professor(class_id, auth.uid()));

CREATE POLICY class_invites_select ON public.class_invites FOR SELECT TO authenticated
  USING (public.is_class_professor(class_id, auth.uid()) OR invited_by = auth.uid());
CREATE POLICY class_invites_insert ON public.class_invites FOR INSERT TO authenticated
  WITH CHECK (public.is_class_professor(class_id, auth.uid()));
CREATE POLICY class_invites_update ON public.class_invites FOR UPDATE TO authenticated
  USING (public.is_class_professor(class_id, auth.uid()) OR invited_by = auth.uid());

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_classes_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER trg_classes_touch BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.touch_classes_updated_at();

-- ===== RPCs =====
CREATE OR REPLACE FUNCTION public.create_class(
  _name text,
  _year text,
  _institution_id uuid,
  _class_type public.class_kind,
  _allow_student_pins boolean,
  _brief text,
  _ta_email text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := auth.uid();
  v_class uuid;
  v_conv uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _name IS NULL OR length(btrim(_name)) = 0 THEN RAISE EXCEPTION 'name required'; END IF;

  INSERT INTO public.conversations (is_group) VALUES (true) RETURNING id INTO v_conv;
  INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (v_conv, v_me);

  INSERT INTO public.classes (name, year, institution_id, professor_id, class_type, allow_student_pins, brief, conversation_id)
  VALUES (btrim(_name), NULLIF(btrim(coalesce(_year,'')),''), _institution_id, v_me, _class_type, coalesce(_allow_student_pins,false), NULLIF(btrim(coalesce(_brief,'')),''), v_conv)
  RETURNING id INTO v_class;

  INSERT INTO public.class_members (class_id, user_id, role, status)
  VALUES (v_class, v_me, 'professor', 'active');

  IF _ta_email IS NOT NULL AND length(btrim(_ta_email)) > 0 THEN
    INSERT INTO public.class_invites (class_id, email, role, invited_by)
    VALUES (v_class, lower(btrim(_ta_email)), 'ta', v_me);
  END IF;

  RETURN v_class;
END $$;

CREATE OR REPLACE FUNCTION public.accept_class_invite(_token text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := auth.uid();
  v_invite public.class_invites%ROWTYPE;
  v_conv uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO v_invite FROM public.class_invites WHERE token = _token;
  IF v_invite.id IS NULL THEN RAISE EXCEPTION 'invalid invite'; END IF;
  IF v_invite.status <> 'pending' THEN RAISE EXCEPTION 'invite is %', v_invite.status; END IF;

  INSERT INTO public.class_members (class_id, user_id, role, status)
  VALUES (v_invite.class_id, v_me, v_invite.role, 'active')
  ON CONFLICT (class_id, user_id) DO UPDATE SET role = EXCLUDED.role, status = 'active';

  UPDATE public.class_invites SET status = 'accepted' WHERE id = v_invite.id;

  SELECT conversation_id INTO v_conv FROM public.classes WHERE id = v_invite.class_id;
  IF v_conv IS NOT NULL THEN
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (v_conv, v_me) ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_invite.class_id;
END $$;

CREATE OR REPLACE FUNCTION public.list_my_classes()
RETURNS TABLE(
  id uuid, name text, year text, class_type public.class_kind,
  professor_id uuid, conversation_id uuid, allow_student_pins boolean,
  brief text, my_role public.class_role,
  member_count integer, doc_count integer,
  created_at timestamptz, updated_at timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, c.name, c.year, c.class_type, c.professor_id, c.conversation_id,
         c.allow_student_pins, c.brief, m.role,
         (SELECT count(*)::int FROM public.class_members mm WHERE mm.class_id = c.id AND mm.status='active'),
         (SELECT count(*)::int FROM public.class_documents d WHERE d.class_id = c.id),
         c.created_at, c.updated_at
  FROM public.classes c
  JOIN public.class_members m ON m.class_id = c.id AND m.user_id = auth.uid() AND m.status='active'
  ORDER BY c.updated_at DESC;
$$;

-- ===== notification triggers =====
CREATE OR REPLACE FUNCTION public.notify_on_class_invite() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid; v_title text;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = NEW.email LIMIT 1;
  IF v_uid IS NULL THEN RETURN NEW; END IF;
  SELECT name INTO v_title FROM public.classes WHERE id = NEW.class_id;
  INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
  VALUES (v_uid, 'class_invite', NEW.invited_by, 'class', NEW.class_id::text,
          'invited you as TA to ' || coalesce(v_title,'a class'));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;
CREATE TRIGGER trg_class_invite_notify AFTER INSERT ON public.class_invites
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_class_invite();

CREATE OR REPLACE FUNCTION public.notify_on_class_member() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_title text; v_actor uuid := auth.uid();
BEGIN
  IF NEW.status <> 'active' THEN RETURN NEW; END IF;
  IF NEW.user_id = v_actor THEN RETURN NEW; END IF;
  SELECT name INTO v_title FROM public.classes WHERE id = NEW.class_id;
  INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
  VALUES (NEW.user_id, 'class_join', v_actor, 'class', NEW.class_id::text,
          'added you to ' || coalesce(v_title,'a class'));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;
CREATE TRIGGER trg_class_member_notify AFTER INSERT ON public.class_members
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_class_member();

CREATE OR REPLACE FUNCTION public.notify_on_class_document() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; v_title text; v_label text;
BEGIN
  SELECT name INTO v_title FROM public.classes WHERE id = NEW.class_id;
  v_label := CASE NEW.kind
    WHEN 'project' THEN 'posted a project in '
    WHEN 'brief'   THEN 'posted a brief in '
    WHEN 'reference' THEN 'shared references in '
    ELSE 'posted a document in '
  END;
  FOR r IN SELECT user_id FROM public.class_members
    WHERE class_id = NEW.class_id AND status='active' AND user_id <> NEW.uploader_id
  LOOP
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (r.user_id, 'class_doc', NEW.uploader_id, 'class', NEW.class_id::text,
            v_label || coalesce(v_title,'class'));
  END LOOP;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;
CREATE TRIGGER trg_class_doc_notify AFTER INSERT ON public.class_documents
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_class_document();

-- ===== realtime =====
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_invites;

-- ===== storage policies for class-docs bucket =====
-- Members can read their class's files; staff can write.
CREATE POLICY "class-docs read for class members"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'class-docs'
  AND EXISTS (
    SELECT 1 FROM public.class_documents d
    WHERE d.file_path = storage.objects.name
      AND public.is_class_member(d.class_id, auth.uid())
  )
);
CREATE POLICY "class-docs write for class staff"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'class-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "class-docs update own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'class-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "class-docs delete own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'class-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
