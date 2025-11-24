# 🎶 Calendario Avvento Musicale

Un calendario dell'avvento interattivo dove gli utenti possono indovinare canzoni natalizie giorno per giorno durante il mese di dicembre.

## 🚀 Setup Iniziale

### 1. Installazione Dipendenze

```bash
npm install
```

### 2. Configurazione Variabili d'Ambiente

Copia il file `.env.example` in `.env`:

```bash
cp .env.example .env
```

Modifica il file `.env` con le tue configurazioni:

```env
# Credenziali Supabase (obbligatorie)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Configurazione calendario
VITE_TEST_MONTH=11          # 11 = Dicembre
VITE_TEST_DAY=              # Lascia vuoto per data reale, oppure 24 per testing

# Funzionalità
VITE_DEBUG_MODE=false       # true per abilitare pulsanti debug
VITE_RANKING_VIEW=true      # true per mostrare classifica completa
```

### 3. Setup Database Supabase

Esegui lo script SQL in `database_setup.sql` nel tuo progetto Supabase:

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto → SQL Editor
3. Copia e incolla il contenuto di `database_setup.sql`
4. Esegui lo script

Questo creerà:
- Tabella `profiles` per i profili utente
- Tabella `advent_attempts` (se non esiste già)
- Vista `leaderboard_view` per la classifica
- Trigger automatico per creare profili alla registrazione

### 4. Avvio Sviluppo

```bash
npm run dev
```

### 5. Build Produzione

```bash
npm run build
npm run preview
```

## 📁 Struttura File

```
calendario-avvento/
├── public/
│   └── audio/              # File MP3 delle canzoni (song_1.mp3 ... song_24.mp3)
├── src/
│   ├── App.jsx             # Componente principale
│   ├── main.jsx            # Entry point
│   └── index.css           # Stili Tailwind
├── .env                    # Configurazione (non committare!)
├── .env.example            # Template configurazione
└── database_setup.sql      # Script setup database
```

## 🎮 Funzionalità

- **Autenticazione**: Login/Registrazione con Supabase
- **24 Caselle**: Una per ogni giorno di dicembre
- **Quiz Musicali**: Indovina la canzone tra 3 opzioni
- **Timer**: Traccia il tempo impiegato per rispondere
- **Classifica**: Visualizza i migliori partecipanti
- **Modalità Debug**: Pulsanti per testing (solo se `VITE_DEBUG_MODE=true`)

## ⚙️ Configurazione Avanzata

### Variabili d'Ambiente Disponibili

| Variabile | Tipo | Default | Descrizione |
|-----------|------|---------|-------------|
| `VITE_SUPABASE_URL` | string | - | URL progetto Supabase |
| `VITE_SUPABASE_ANON_KEY` | string | - | Chiave anonima Supabase |
| `VITE_TEST_MONTH` | number | 11 | Mese calendario (0-11) |
| `VITE_TEST_DAY` | number | null | Giorno forzato per testing |
| `VITE_DEBUG_MODE` | boolean | false | Abilita funzioni debug |
| `VITE_RANKING_VIEW` | boolean | true | Mostra classifica completa |

### File Audio

Inserisci i file MP3 in `public/audio/` con naming:
- `song_1.mp3`
- `song_2.mp3`
- ...
- `song_24.mp3`

## 🛠️ Tecnologie Utilizzate

- **React 19** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend & Database
- **SweetAlert2** - Notifiche eleganti

## 📝 Note di Sviluppo

- Le variabili d'ambiente vengono lette solo al build time
- Dopo modifiche al `.env` è necessario riavviare il server dev
- Le chiavi Supabase nel `.env` NON devono essere committate su Git
- Il file `.env` è già in `.gitignore`


## Note di miglioramenti

- mostrare nella classifica tutti i partecipanti anche se non hanno risposte corrette
