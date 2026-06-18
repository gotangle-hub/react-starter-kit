INSERT INTO public.competitions (external_id, title, organiser, field, location, deadline, deadline_label, prize, prize_kind, eligibility, audience, source_url, source, is_official, interested_count)
VALUES
  ('tangle-weekly-render', 'Weekly render challenge', 'Tangle', 'Architecture', 'Global', (now() + interval '4 days')::date, '4 days left', 'Featured + badge', 'Publication', 'all', 'all', NULL, 'tangle', true, 0),
  ('tangle-furniture-100h', 'Furniture in 100 hours', 'Tangle', 'Product', 'Global', (now() + interval '12 days')::date, '12 days left', '5,000 AED', 'Cash', 'all', 'all', NULL, 'tangle', true, 0)
ON CONFLICT (external_id) DO UPDATE SET
  title = EXCLUDED.title,
  source = EXCLUDED.source,
  is_official = EXCLUDED.is_official,
  deadline = EXCLUDED.deadline,
  deadline_label = EXCLUDED.deadline_label,
  prize = EXCLUDED.prize,
  updated_at = now();