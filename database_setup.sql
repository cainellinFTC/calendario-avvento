-- ============================================
-- SETUP DATABASE PER CALENDARIO AVVENTO MUSICALE
-- ============================================
-- Esegui questi comandi nel SQL Editor di Supabase

-- 1. CREAZIONE TABELLA PROFILES
-- Questa tabella memorizza il display_name degli utenti in modo pubblico
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. POLICY PER TABELLA PROFILES
-- Abilita Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere i profili (necessario per la classifica)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Policy: Gli utenti possono inserire solo il proprio profilo
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Gli utenti possono aggiornare solo il proprio profilo
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. FUNZIONE PER CREARE AUTOMATICAMENTE IL PROFILO ALLA REGISTRAZIONE
-- Questa funzione viene triggerata quando un nuovo utente si registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'display_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRIGGER PER CHIAMARE LA FUNZIONE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. CREAZIONE VISTA CLASSIFICA
-- Questa vista calcola automaticamente la classifica
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT
  a.user_id,
  COALESCE(p.display_name, 'Partecipante Anonimo') as display_name,
  COUNT(CASE WHEN a.is_correct THEN 1 END) as correct_answers,
  SUM(CASE WHEN a.is_correct THEN a.time_spent_seconds ELSE 0 END) as total_time
FROM
  public.advent_attempts a
LEFT JOIN
  public.profiles p ON a.user_id = p.user_id
GROUP BY
  a.user_id, p.display_name
ORDER BY
  correct_answers DESC,
  total_time ASC;

-- 6. PERMESSI SULLA VISTA
-- Permetti a tutti di leggere la vista
GRANT SELECT ON public.leaderboard_view TO anon, authenticated;

-- ============================================
-- VERIFICA SETUP
-- ============================================
-- Esegui queste query per verificare che tutto funzioni:

-- Controlla la struttura della tabella profiles
SELECT * FROM public.profiles LIMIT 5;

-- Controlla la vista classifica
SELECT * FROM public.leaderboard_view LIMIT 3;

-- ============================================
-- MIGRAZIONE UTENTI ESISTENTI (OPZIONALE)
-- ============================================
-- Se hai già utenti registrati, esegui questo per popolare la tabella profiles:

INSERT INTO public.profiles (user_id, display_name)
SELECT
  id,
  raw_user_meta_data->>'display_name' as display_name
FROM
  auth.users
WHERE
  id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;
