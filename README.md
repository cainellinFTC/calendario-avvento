# 🎶 Calendario dell'Avvento Musicale

Un calendario dell'avvento interattivo dove gli utenti possono indovinare canzoni natalizie giorno per giorno durante il mese di dicembre.

🌐 **Demo Live**: [https://cainellinftc.github.io/calendario-avvento/](https://cainellinftc.github.io/calendario-avvento/)

## 🚀 Setup Iniziale

### 1. Installazione Dipendenze

```bash
npm install
```

### 2. Configurazione Variabili d'Ambiente

Copia il file `.env.example` in `.env` e `.env.production`:

```bash
cp .env.example .env
cp .env.example .env.production
```

Modifica i file `.env` e `.env.production` con le tue configurazioni:

```env
# ============================================
# CONFIGURAZIONE SUPABASE
# ============================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ============================================
# CONFIGURAZIONE CALENDARIO
# ============================================
# Mese in cui il calendario è attivo (0=Gennaio, 11=Dicembre)
VITE_MONTH=11

# Solo per testing: forza un giorno specifico (lasciare vuoto in produzione)
VITE_TEST_DAY=

# Numero massimo di giorni disponibili nel passato
VITE_MAX_PAST_DAYS=3

# ============================================
# FUNZIONALITÀ
# ============================================
# Abilita modalità debug (true/false)
VITE_ENABLE_DEBUG=false

# Abilita visualizzazione classifica completa (true/false)
VITE_RANKING_VIEW=false

# URL della playlist YouTube con tutte le canzoni del calendario
VITE_PLAYLIST_URL=https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID
```

### 3. Setup Database Supabase

Esegui lo script SQL in `database_setup.sql` nel tuo progetto Supabase:

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto → SQL Editor
3. Copia e incolla il contenuto di `database_setup.sql`
4. Esegui lo script

Questo creerà:
- Tabella `profiles` per i profili utente
- Tabella `advent_attempts` per le risposte
- Vista `leaderboard_view` per la classifica
- Trigger automatico per creare profili alla registrazione
- Policy RLS per sicurezza

### 4. Avvio Sviluppo

```bash
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173) nel browser.

### 5. Build e Preview Locale

```bash
npm run build
npm run preview
```

### 6. Deploy su GitHub Pages

```bash
npm run deploy
```

Questo comando:
1. Crea il build di produzione usando `.env.production`
2. Publica automaticamente su GitHub Pages (branch `gh-pages`)

**Nota**: Configura GitHub Pages nel repository (Settings → Pages → Source: gh-pages branch)

## 📁 Struttura File

```
calendario-avvento/
├── public/
│   ├── audio/              # File MP3 delle canzoni (song_1.mp3 ... song_24.mp3)
│   ├── img/                # Immagini (sfondo, logo, ecc.)
│   └── istruzioni.md       # Istruzioni del gioco (markdown)
├── src/
│   ├── App.jsx             # Componente principale
│   ├── main.jsx            # Entry point
│   └── index.css           # Stili Tailwind
├── .env                    # Configurazione sviluppo (NON committare!)
├── .env.production         # Configurazione produzione (NON committare!)
├── .env.example            # Template configurazione
├── vite.config.js          # Configurazione Vite + deploy
└── database_setup.sql      # Script setup database
```

## 🎮 Funzionalità

- **Autenticazione**: Login/Registrazione con Supabase
- **24 Caselle**: Una per ogni giorno di dicembre
- **Quiz Musicali**: Indovina la canzone tra 3 opzioni
- **Timer**: Traccia il tempo impiegato per rispondere
- **Classifica**: Visualizza i migliori partecipanti
- **Finestra Mobile**: Solo gli ultimi 3 giorni sono giocabili
- **Ordine Cronologico**: Devi completare i giorni in ordine
- **Modal Istruzioni**: Regole del gioco in formato markdown
- **Playlist YouTube**: Link alla playlist completa dopo il completamento
- **Modalità Debug**: Pulsanti per testing (solo se `VITE_ENABLE_DEBUG=true`)

## ⚙️ Configurazione Avanzata

### Variabili d'Ambiente Disponibili

| Variabile | Tipo | Default | Descrizione |
|-----------|------|---------|-------------|
| `VITE_SUPABASE_URL` | string | - | URL progetto Supabase |
| `VITE_SUPABASE_ANON_KEY` | string | - | Chiave anonima Supabase |
| `VITE_MONTH` | number | 11 | Mese in cui il calendario è attivo (0=Gen, 11=Dic) |
| `VITE_TEST_DAY` | number | - | Giorno forzato per testing (solo in debug) |
| `VITE_MAX_PAST_DAYS` | number | 3 | Numero di giorni nel passato disponibili |
| `VITE_ENABLE_DEBUG` | boolean | false | Abilita funzioni debug e testing |
| `VITE_RANKING_VIEW` | boolean | false | Mostra classifica completa |
| `VITE_PLAYLIST_URL` | string | - | URL playlist YouTube con tutte le canzoni |

### File Audio

Inserisci i file MP3 in `public/audio/` con naming:
- `song_1.mp3`
- `song_2.mp3`
- ...
- `song_24.mp3`

### Personalizzazione Canzoni

Modifica l'oggetto `songData` in `src/App.jsx` (linee 22-46) per cambiare le canzoni e le opzioni di risposta.

## 🛠️ Tecnologie Utilizzate

- **React 19** - Framework UI
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend as a Service (Auth + PostgreSQL)
- **SweetAlert2** - Toast notifications
- **Canvas Confetti** - Animazioni neve
- **gh-pages** - Deployment automatico su GitHub Pages

## 📝 Workflow di Sviluppo

### Modifiche al Codice

```bash
# 1. Fai le modifiche ai file
# 2. Commit
git add .
git commit -m "Descrizione modifiche"

# 3. Push su GitHub
git push origin main

# 4. Deploy su GitHub Pages
npm run deploy
```

### Modifiche alle Configurazioni

```bash
# 1. Modifica .env e/o .env.production
# 2. NON committare i file .env (sono protetti da .gitignore)
# 3. Deploy direttamente
npm run deploy
```

**Importante**: I file `.env` NON devono mai essere committati su Git. Sono automaticamente ignorati da `.gitignore`.

## 🔒 Sicurezza

- Le chiavi Supabase sono pubbliche (anon key) ma protette da Row Level Security (RLS)
- I file `.env` sono in `.gitignore` e non vengono committati
- Le variabili d'ambiente vengono embedded nel JavaScript durante il build
- Row Level Security su Supabase impedisce accesso non autorizzato ai dati

## 🚀 Deploy su GitHub Pages

Il sito è configurato per il deploy automatico su GitHub Pages:

1. **Primo deploy**: Esegui `npm run deploy`
2. **Configura GitHub Pages**:
   - Vai su Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` → `/ (root)`
   - Save

3. **Deploy successivi**: Basta eseguire `npm run deploy`

Il sito sarà disponibile a: `https://<username>.github.io/calendario-avvento/`

## 🐛 Troubleshooting

### Le risorse (immagini/audio) non si caricano

Verifica che tutti i percorsi usino `import.meta.env.BASE_URL`:
```jsx
`${import.meta.env.BASE_URL}audio/song_1.mp3`
```

### Le variabili d'ambiente non vengono applicate

1. Verifica che esistano sia `.env` che `.env.production`
2. Riavvia il server dev (`npm run dev`)
3. Rifai il build (`npm run build`)
4. Controlla i log durante il build

### Il deploy non funziona

1. Verifica che `gh-pages` sia installato: `npm list gh-pages`
2. Controlla che il branch `gh-pages` esista su GitHub
3. Verifica le impostazioni GitHub Pages nel repository

## 📄 Licenza

Progetto per uso personale/didattico.

## 🎄 Buon Divertimento!

Creato con ❤️ per il Circolo FTC
