
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// La riga 'import { createClient } from '@supabase/supabase-js';' è stata rimossa
// perché causava un errore di risoluzione nell'ambiente di esecuzione.

// --- CONFIGURAZIONE DA VARIABILI D'AMBIENTE ---
// Tutte le configurazioni sono gestite nel file .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configurazione calendario e funzionalità
const TEST_MONTH = parseInt(import.meta.env.VITE_TEST_MONTH) || 11; // 11 = Dicembre
const TEST_DAY = import.meta.env.VITE_TEST_DAY ? parseInt(import.meta.env.VITE_TEST_DAY) : null;
const MAX_PAST_DAYS = parseInt(import.meta.env.VITE_MAX_PAST_DAYS) || 3; // Giorni disponibili nel passato
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';
const RANKING_VIEW = import.meta.env.VITE_RANKING_VIEW === 'true';

const songData = {
    1:{ correctId:2, titles: {1:"Jingle Bells",2:"All I Want For Christmas Is You",3:"Silent Night (Remix)"  } },
    2:{ correctId:2, titles: {1:"We Wish You a Merry Christmas",2:"Deck the Halls",3:"Let It Snow"  } },
    3:{ correctId:3, titles: {1:"Santa Claus Is Comin' to Town",2:"It's Beginning to Look a Lot Like Christmas",3:"Do They Know It's Christmas"} },
    4:{ correctId:2, titles: {1:"I'll Be Home for Christmas",2:"Driving Home For Christmas",3:"Have Yourself a Merry Little Christmas"  } },
    5:{ correctId:1, titles: {1:"Feliz Navidad",2:"Last Christmas",3:"All I Want for Christmas Is You"  } },
    6:{ correctId:3, titles: {1:"Sleigh Ride",2:"Mary, Did You Know?",3:"Happy Xmas (War Is Over)"} },
    7:{ correctId:2, titles: {1:"Run Rudolph Run",2:"Have Yourself A Merry Little Christmas",3:"Auld Lang Syne"  } },
    8:{ correctId:2, titles: {1:"Jingle Bell Rock",2:"Here Comes Santa Claus",3:"Frosty the Snowman"  } },
    9:{ correctId:3, titles: {1:"Here Comes Santa Claus",2:"O Holy Night",3:"Its Beginning To Look A Lot Like Christmas"} },
    10:{ correctId:1, titles: {1:"Jingle Bell Rock",2:"Wonderful Christmastime",3:"The Little Drummer Boy"  } },
    11:{ correctId:3, titles: {1:"It's the Most Wonderful Time of the Year",2:"Grown-Up Christmas List",3:"Jingle Bells"} },
    12:{ correctId:1, titles: {1:"Last Christmas",2:"Christmas (Baby Please Come Home)",3:"Zat You Santa Claus?"  } },
    13:{ correctId:1, titles: {1:"Let It Snow! Let It Snow! Let It Snow!",2:"Happy Xmas (War Is Over)",3:"What Christmas Means to Me"  } },
    14:{ correctId:3, titles: {1:"Nuttin' for Christmas",2:"Go Tell It on the Mountain",3:"Magic Moments"} },
    15:{ correctId:2, titles: {1:"Linus and Lucy (Peanuts)",2:"Marry You",3:"A Christmas Song (Chestnuts)"  } },
    16:{ correctId:3, titles: {1:"You're a Mean One, Mr. Grinch",2:"Simply Having a Wonderful Christmas Time",3:"Oh Happy Day"} },
    17:{ correctId:3, titles: {1:"Ding Dong Merrily on High",2:"Good King Wenceslas",3:"Rudolph The Red-Nosed Reindeer"} },
    18:{ correctId:1, titles: {1:"Santa Claus Is Coming To Town",2:"Do You Hear What I Hear?",3:"Silver Bells"  } },
    19:{ correctId:2, titles: {1:"It's a Marshmallow World",2:"Santa Tell Me",3:"Santa Baby"  } },
    20:{ correctId:2, titles: {1:"Let It Snow! Let It Snow! Let It Snow!",2:"Silent Night",3:"Rudolph the Red-Nosed Reindeer"  } },
    21:{ correctId:3, titles: {1:"Winter Wonderland",2:"The Christmas Song",3:"Sleigh Ride"} },
    22:{ correctId:3, titles: {1:"Sleigh Ride",2:"We Three Kings",3:"Something Stupid"} },
    23:{ correctId:2, titles: {1:"A Holly Jolly Christmas",2:"Thank God It's Christmas",3:"Here Comes Santa Claus"  } },
    24:{ correctId:1, titles: {1:"We Wish You A Merry Cristmas",2:"O Come, O Come, Emmanuel",3:"Carol of the Bells"  } },
};

const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

// --- COMPONENTI UI ---

// RIMOSSO: Il componente ToastMessage non è più necessario.

const GameModal = ({ boxId, data, onClose, userId, onAttemptSubmitted, supabaseClient, showToast, currentAttempts, currentDay, today, maxPastDays, testMonth }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [audioStarted, setAudioStarted] = useState(false);
    const [audioEnded, setAudioEnded] = useState(false);
    const audioRef = React.useRef(null);

    const shuffledIds = useMemo(() => shuffleArray([1, 2, 3]), [boxId]);

    const handlePlay = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            // --- CARICAMENTO MP3 ---
            audioRef.current.src = `/audio/song_${boxId}.mp3`;
            audioRef.current.play().then(() => {
                setAudioStarted(true);
                setAudioEnded(false);
            }).catch(error => {
                console.error("Errore riproduzione audio (potrebbe essere blocco autoplay): ", error);
                showToast("Impossibile avviare l'audio. Clicca un punto qualsiasi della pagina e riprova.", 'error');
            });
            // -----------------------------------------

            // Avvia il timer solo se non è già in esecuzione
            if (!timerRunning) {
                setTimerRunning(true);
            }
        }
    }, [boxId, showToast, timerRunning]);

    // Event listener per quando l'audio termina
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            setAudioEnded(true);
        };

        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    useEffect(() => {
        let interval;
        if (timerRunning) {
            interval = setInterval(() => setTimeElapsed(p => p + 1), 1000);
        } else if (!timerRunning && timeElapsed !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerRunning, timeElapsed]);

    const handleSubmit = async () => {
        if (!selectedAnswer || isSubmitting) return;
        
        // Ferma l'audio e il timer prima di inviare
        if (audioRef.current) audioRef.current.pause();
        setTimerRunning(false);

        setIsSubmitting(true);

        const selectedOptionId = parseInt(selectedAnswer.split('_')[1]);
        const isCorrect = selectedOptionId === data.correctId;
        const songTitle = data.titles[selectedOptionId]; // Il titolo selezionato
               
        try {
            if (supabaseClient) {
                const { error } = await supabaseClient
                    .from('advent_attempts')
                    .insert({
                        user_id: userId,
                        box_id: boxId,
                        selected_id: selectedAnswer,
                        time_spent_seconds: timeElapsed,
                        is_correct: isCorrect
                    });

                if (error) throw error;
            } else {
                console.warn("Supabase non inizializzato. Simulazione salvataggio.");
            }

            // Aggiorna lo stato dell'app principale
            onAttemptSubmitted(boxId);

            // Calcola lo stato delle caselle dopo questo tentativo
            const updatedAttempts = {...currentAttempts, [boxId]: true};

            // Funzione per calcolare lo stato di una casella (stessa logica di getBoxStatus nel parent)
            const getBoxStatus = (day) => {
                if (today.getMonth() !== testMonth) return 'blocked';
                if (updatedAttempts[day]) return 'opened';
                if (day > currentDay) return 'locked';

                const minAvailableDay = Math.max(1, currentDay - maxPastDays + 1);
                if (day < minAvailableDay) return 'expired';

                return 'available';
            };

            // Calcola caselle veramente disponibili (non scadute, non bloccate, non già completate)
            const availableBoxes = [];
            let totalPlayableBoxes = 0; // Caselle che sono disponibili O già aperte (esclude expired, locked, blocked)

            for (let day = 1; day <= 24; day++) {
                const status = getBoxStatus(day);
                if (status === 'available') {
                    availableBoxes.push(day);
                    totalPlayableBoxes++;
                } else if (status === 'opened') {
                    totalPlayableBoxes++;
                }
            }

            const hasAvailableBoxes = availableBoxes.length > 0;
            const isDay24 = boxId === 24;
            // Tutte completate = hai completato tutte le caselle giocabili (escludendo expired/locked/blocked)
            const allCompleted = Object.keys(updatedAttempts).length === totalPlayableBoxes;

            // Mostra SweetAlert di conferma personalizzato
            if (window.Swal) {
                // Caso speciale: giorno 24 e tutte le caselle completate
                // Non mostriamo più un popup modale, il banner apparirà automaticamente
                if (isDay24 && allCompleted) {
                    // Non mostrare nulla, il banner apparirà automaticamente
                } else if (hasAvailableBoxes) {
                    // Ci sono caselle disponibili
                    window.Swal.fire({
                        title: 'Grazie per aver partecipato!',
                        text: 'Completa le altre giornate per avere più possibilità di vincere',
                        icon: 'success',
                        timer: 5000,
                        timerProgressBar: true,
                        showConfirmButton: true,
                        confirmButtonText: 'OK'
                    });
                } else {
                    // Nessuna casella disponibile, torna domani
                    window.Swal.fire({
                        title: 'Grazie per aver partecipato!',
                        text: 'Torna domani per una nuova canzone',
                        icon: 'success',
                        timer: 5000,
                        timerProgressBar: true,
                        showConfirmButton: true,
                        confirmButtonText: 'OK'
                    });
                }
            }
        } catch (error) {
            console.error("Errore Supabase:", error.message);
            showToast("Errore nel salvataggio: " + error.message, 'error', 'Errore DB'); 
        } finally {
            setIsSubmitting(false);
            onClose();
        }
    };

    const isConfirmDisabled = selectedAnswer === null || isSubmitting || !timerRunning;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
            <audio ref={audioRef} preload="auto" />
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-zoomIn border-4 border-red-500">
                <h2 className="text-3xl font-extrabold text-red-700 mb-6 text-center border-b pb-2">Giorno {boxId}: Indovina la Canzone</h2>
                
                {/* Timer */}
                <div className="text-center mb-6 p-3 bg-red-100 rounded-xl border border-red-300">
                    <span className="text-xl font-mono text-gray-800">Tempo impiegato: <span className="text-red-700 font-bold">{timeElapsed}s</span></span>
                </div>
                
                {/* Bottone Play */}
                <div className="flex justify-center mb-4">
                    <button
                        onClick={handlePlay}
                        disabled={audioStarted && !audioEnded}
                        className={`font-extrabold py-4 px-8 rounded-full shadow-lg transition-all transform ${
                            audioStarted && !audioEnded
                                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                : audioEnded
                                ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 animate-fastPulse'
                                : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                        }`}
                    >
                        {audioStarted ? '🔄 RIASCOLTA IL BRANO' : '▶️ ASCOLTA IL BRANO'}
                    </button>
                </div>

                {/* Banner Informativo */}
                {audioStarted && (
                    <div className="mb-6 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg animate-slideIn">
                        <div className="flex items-center">
                            <span className="text-blue-600 text-2xl mr-2">🎵</span>
                            <div className="flex-1">
                                <p className="text-blue-800 font-semibold text-sm">Musica avviata! Il tempo scorre...</p>
                                <div className="mt-1 h-1 bg-blue-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 animate-progressBar"
                                        style={{
                                            animation: 'progressBar 60s linear infinite'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Opzioni di Risposta */}
                <fieldset className="space-y-3 mb-8">
                    {shuffledIds.map(id => (
                        <label 
                            key={id} 
                            htmlFor={`s-${id}`} 
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedAnswer === `${boxId}_${id}` ? 'bg-red-100 border-red-500 shadow-md' : 'bg-white hover:bg-gray-50 border-gray-300'} ${!timerRunning ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <input 
                                id={`s-${id}`} name="guess" type="radio" value={`${boxId}_${id}`}
                                onChange={(e) => setSelectedAnswer(e.target.value)}
                                disabled={!timerRunning}
                                className="h-5 w-5 text-red-600 focus:ring-red-500"
                            />
                            <span className="ml-3 text-lg font-medium text-gray-800">
                                {data.titles[id]}
                            </span>
                        </label>
                    ))}
                </fieldset>
                
                {/* Bottoni Azione */}
                <div className="flex justify-center items-center pt-4 border-t">
                    <button
                        onClick={handleSubmit}
                        disabled={isConfirmDisabled}
                        className={`py-3 px-6 rounded-full font-extrabold text-white transition-all transform ${isConfirmDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-lg hover:scale-105'}`}
                    >
                        {isSubmitting ? 'Salvataggio...' : 'Conferma Risposta'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AuthScreen = ({ supabaseClient }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');

        try {
            if (!supabaseClient) throw new Error("Supabase non configurato.");

            let result;
            if (isRegistering) {
                // Registrazione con nickname nel display_name
                result = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            display_name: nickname
                        }
                    }
                });
            } else {
                result = await supabaseClient.auth.signInWithPassword({ email, password });
            }

            if (result.error) throw result.error;

            if (isRegistering) {
                setMsg('Registrazione completata! Controlla la mail per confermare, poi effettua il login.');
                setIsRegistering(false);
                setNickname(''); // Reset nickname dopo registrazione
            } else {
                // Login gestito dal listener in App
            }
        } catch (error) {
            setMsg('Errore: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');

        try {
            if (!supabaseClient) throw new Error("Supabase non configurato.");

            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/#reset-password` // URL specifico per reset
            });

            if (error) throw error;

            setMsg('✅ Email di reset password inviata! Controlla la tua casella di posta.');
            setIsForgotPassword(false);
        } catch (error) {
            setMsg('Errore: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm border-4 border-green-500">
                <h2 className="text-3xl font-extrabold mb-6 text-red-600 text-center">
                    {isForgotPassword ? '🔑 Reset Password' : (isRegistering ? '🎄 Registrati' : '🎅 Accedi')}
                </h2>

                <form onSubmit={isForgotPassword ? handleForgotPassword : handleAuth} className="space-y-4">
                    {isRegistering && !isForgotPassword && (
                        <input
                            type="text"
                            placeholder="Nome e Cognome"
                            className="w-full border p-3 rounded-lg focus:border-green-500 focus:ring-green-500"
                            value={nickname}
                            onChange={e=>setNickname(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border p-3 rounded-lg focus:border-green-500 focus:ring-green-500"
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
                        required
                    />
                    {!isForgotPassword && (
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full border p-3 rounded-lg focus:border-green-500 focus:ring-green-500"
                            value={password}
                            onChange={e=>setPassword(e.target.value)}
                            required
                        />
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-bold transition-colors shadow-md"
                    >
                        {loading ? 'Attendi...' : (isForgotPassword ? 'Invia Email Reset' : (isRegistering ? 'Crea Account' : 'Accedi al Calendario'))}
                    </button>
                </form>

                {msg && <p className="mt-4 text-sm text-center text-red-700 font-medium bg-red-50 p-2 rounded">{msg}</p>}

                {/* Link per password dimenticata */}
                {!isRegistering && !isForgotPassword && (
                    <button
                        onClick={() => setIsForgotPassword(true)}
                        className="mt-3 w-full text-xs text-blue-600 hover:text-blue-800 underline transition-colors"
                    >
                        Password dimenticata?
                    </button>
                )}

                {/* Toggle tra Login/Registrazione/Reset */}
                {!isForgotPassword ? (
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="mt-4 w-full text-sm text-gray-500 hover:text-red-500 underline transition-colors"
                    >
                        {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati ora'}
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setIsForgotPassword(false);
                            setMsg('');
                        }}
                        className="mt-4 w-full text-sm text-gray-500 hover:text-red-500 underline transition-colors"
                    >
                        ← Torna al Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default function App() {
    const [supabaseClient, setSupabaseClient] = useState(null);
    const [isClientReady, setIsClientReady] = useState(false);
    const [session, setSession] = useState(null);
    const [attempts, setAttempts] = useState({});
    const [openBoxId, setOpenBoxId] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]); // Top 3 per homepage
    const [fullLeaderboard, setFullLeaderboard] = useState([]); // Classifica completa
    const [showFullRanking, setShowFullRanking] = useState(false); // Toggle vista
    const [showChristmasBanner, setShowChristmasBanner] = useState(false); // Banner natalizio fisso
    const [showPasswordReset, setShowPasswordReset] = useState(false); // Modal per reset password
    const [newPassword, setNewPassword] = useState('');
    const [showInstructions, setShowInstructions] = useState(false); // Modal istruzioni
    const [instructionsContent, setInstructionsContent] = useState(''); // Contenuto markdown
    // RIMOSSO: Stato 'toast' non è più necessario
    
    // ** MODIFICATA: La funzione ora utilizza SweetAlert2 (Swal.fire) **
    const showToast = useCallback((message, type, title = '') => {
        // Usa window.Swal perché SweetAlert2 sarà caricato tramite CDN
        if (window.Swal) {
            window.Swal.fire({
                position: 'center',
                icon: type, // 'success', 'error', 'info', 'warning'
                title: title || message, // Il messaggio principale
                text: title ? message : '', // Se c'è un titolo, usa il messaggio come testo
                showConfirmButton: true,
                confirmButtonText: 'OK',
                timer: 4000,
                timerProgressBar: true,
                customClass: {
                    container: 'swal2-container--custom-z' // Aggiungi una classe per z-index
                }
            });
        } else {
            console.warn(`Tentativo di mostrare toast: ${message} (${type}). SweetAlert2 non è pronto.`);
        }
    }, []);
    // ** FINE MODIFICATA **

    // 0. Inizializzazione Supabase e SweetAlert2 Dinamica
    useEffect(() => {
        const initSweetAlert = () => {
             // Inietta il CSS per SweetAlert2
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css';
            document.head.appendChild(link);
            
            // Inietta lo script SweetAlert2
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
            script.async = true;
            document.onload = () => console.log('SweetAlert2 caricato');
            document.head.appendChild(script);
        };
        
        const initClient = () => {
            initSweetAlert(); // Carica SweetAlert2 insieme o dopo Supabase
            
            if (window.supabase) {
                if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("INSERISCI")) {
                    try {
                        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                        setSupabaseClient(client);
                        // showToast("Connessione a Supabase riuscita.", 'success'); // Commentato per evitare che si attivi prima di SwAl
                    } catch (e) {
                        console.error("Errore inizializzazione client Supabase:", e);
                        setErrorMsg("Errore inizializzazione Supabase. Controlla le chiavi.");
                    }
                } else {
                    setErrorMsg("Chiavi Supabase mancanti o non valide in App.jsx.");
                }
            } else {
                setErrorMsg("Libreria Supabase non caricata. Controlla il CDN.");
            }
            setIsClientReady(true);
        };

        // Se la libreria Supabase è già stata caricata, procedi
        if (window.supabase) {
            initClient();
            return;
        }

        // Altrimenti, iniettiamo dinamicamente lo script Supabase
        const scriptSupabase = document.createElement('script');
        scriptSupabase.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        scriptSupabase.async = true;
        scriptSupabase.onload = initClient; // Quando Supabase è caricato, inizializza anche SweetAlert2 e il client
        scriptSupabase.onerror = () => {
            console.error("ERRORE CARICAMENTO: Supabase CDN non è riuscito a caricare.");
            setErrorMsg("ERRORE CARICAMENTO: Supabase CDN non è riuscito a caricare.");
            setIsClientReady(true);
        };
        document.head.appendChild(scriptSupabase);

        return () => {
             // Rimuove lo script Supabase (e implicito SweetAlert2 non è gestito qui)
             if (document.head.contains(scriptSupabase)) {
                 document.head.removeChild(scriptSupabase);
             }
        };
    }, []); // Esegue solo una volta

    // 1. Gestione Sessione Utente (dipende da supabaseClient)
    useEffect(() => {
        if (!supabaseClient) return;

        // Controlla se l'URL contiene token di reset password (dopo il redirect di Supabase)
        let hashFragment = window.location.hash.substring(1); // Rimuovi il primo #

        // Supabase potrebbe aggiungere i parametri dopo il nostro hash (es: reset-password#access_token=...)
        // Dobbiamo rimuovere tutto prima del secondo # se presente
        if (hashFragment.includes('#')) {
            // Prendi solo la parte dopo il secondo #
            hashFragment = hashFragment.split('#')[1];
        }

        const hashParams = new URLSearchParams(hashFragment);
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        console.log('Hash completo:', window.location.hash);
        console.log('Fragment pulito:', hashFragment);
        console.log('Access token:', accessToken ? 'PRESENTE' : 'null');
        console.log('Type:', type);

        // Se è un link di recovery, NON caricare la sessione automaticamente
        if (type === 'recovery' && accessToken) {
            console.log('✅ Rilevato link di recovery - mostro schermata reset password');
            setShowPasswordReset(true);
            // NON chiamare getSession() e NON impostare la subscription
            return;
        }

        // Solo se NON è un recovery, carica la sessione normale
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state change event:', event);

            // Intercetta l'evento PASSWORD_RECOVERY
            if (event === 'PASSWORD_RECOVERY') {
                setShowPasswordReset(true);
                // Impedisci il login automatico
                return;
            }

            setSession(session);
            if (session && event === 'SIGNED_IN') {
                // MODIFICATA: Aggiunto un titolo all'alert di successo
                showToast(`Benvenuto, ${session.user.email}!`, 'success', 'Accesso Riuscito');
            } else if (!session && event === 'SIGNED_OUT') {
                showToast("Sei stato disconnesso.", 'info', 'Logout');
            }
        });

        return () => subscription.unsubscribe();
    }, [supabaseClient, showToast]);

    // 2. Caricamento Dati (Tentativi) (dipende da sessione e supabaseClient)
    useEffect(() => {
        if (!session || !supabaseClient) return;

        const fetchAttempts = async () => {
            const { data, error } = await supabaseClient
                .from('advent_attempts')
                .select('box_id')
                .eq('user_id', session.user.id);

            if (error) {
                console.error("Errore fetch tentativi:", error);
                // MODIFICATA: Aggiunto un titolo all'alert di errore
                showToast("Errore nel caricamento dei dati: " + error.message + ". Assicurati che la tabella 'advent_attempts' esista.", 'error', 'Errore Database');
            } else {
                const completed = {};
                if(data) data.forEach(row => completed[row.box_id] = true);
                setAttempts(completed);
            }
        };

        fetchAttempts();
    }, [session, supabaseClient, showToast]);

    // 2b. Verifica se tutte le caselle sono completate (mostra popup natalizio se sì)
    useEffect(() => {
        // Se non c'è sessione o SweetAlert non è caricato, esci
        if (!session || !window.Swal) return;

        // Se non ci sono tentativi, non c'è nulla da controllare
        if (Object.keys(attempts).length === 0) return;

        // Funzione per calcolare lo stato di una casella
        const getBoxStatus = (day) => {
            if (today.getMonth() !== TEST_MONTH) return 'blocked';
            if (attempts[day]) return 'opened';

            const currentDay = today.getDate();
            if (day > currentDay) return 'locked';

            const minAvailableDay = Math.max(1, currentDay - MAX_PAST_DAYS + 1);
            if (day < minAvailableDay) return 'expired';

            return 'available';
        };

        // Conta caselle giocabili
        let totalPlayableBoxes = 0;
        for (let day = 1; day <= 24; day++) {
            const status = getBoxStatus(day);
            if (status === 'available' || status === 'opened') {
                totalPlayableBoxes++;
            }
        }

        const allCompleted = Object.keys(attempts).length === totalPlayableBoxes;
        const currentDay = today.getDate();

        // Se tutte completate e siamo al giorno 24 o oltre
        if (allCompleted && currentDay >= 24) {
            // Il banner si mostra solo nella vista calendario
            if (!showFullRanking) {
                setShowChristmasBanner(true);
            }

            // La neve invece continua sempre (sia in calendario che in classifica)
            if (!window.confetti) {
                const confettiScript = document.createElement('script');
                confettiScript.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
                confettiScript.onload = () => {
                    startChristmasSnow();
                };
                document.head.appendChild(confettiScript);
            } else {
                startChristmasSnow();
            }
        } else {
            setShowChristmasBanner(false);
            // Ferma la neve se non più necessaria
            if (window.christmasSnowInterval) {
                clearInterval(window.christmasSnowInterval);
                window.christmasSnowInterval = null;
            }
        }

        function startChristmasSnow() {
            // Se la neve sta già cadendo, non riavviarla
            if (window.christmasSnowInterval) return;

            const defaults = { startVelocity: 0, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            const snowInterval = setInterval(function() {
                const particleCount = 2;
                window.confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                    colors: ['#ffffff', '#e0f7ff', '#b3e5fc'],
                    shapes: ['circle'],
                    scalar: randomInRange(0.4, 1),
                    drift: randomInRange(-0.4, 0.4)
                });
            }, 50);

            window.christmasSnowInterval = snowInterval;
        }
    }, [attempts, session, showFullRanking]);

    // 3. Caricamento Classifica (da vista database)
    useEffect(() => {
        if (!supabaseClient) return;

        const fetchLeaderboard = async () => {
            try {
                // Carica TOP 3 per homepage
                const { data: top3Data, error: top3Error } = await supabaseClient
                    .from('leaderboard_view')
                    .select('*')
                    .order('correct_answers', { ascending: false })
                    .order('total_time', { ascending: true })
                    .limit(3);

                if (top3Error) {
                    console.error('Errore caricamento top 3:', top3Error);
                    if (top3Error.message.includes('does not exist')) {
                        console.warn('La vista "leaderboard_view" non esiste. Crearla nel database Supabase.');
                    }
                } else if (top3Data) {
                    setLeaderboard(top3Data);
                }

                // Carica CLASSIFICA COMPLETA (solo se RANKING_VIEW è abilitato)
                if (RANKING_VIEW) {
                    const { data: fullData, error: fullError } = await supabaseClient
                        .from('leaderboard_view')
                        .select('*')
                        .order('correct_answers', { ascending: false })
                        .order('total_time', { ascending: true });

                    if (!fullError && fullData) {
                        setFullLeaderboard(fullData);
                    }
                }
            } catch (error) {
                console.error('Errore caricamento classifica:', error);
            }
        };

        fetchLeaderboard();

        // Ricarica la classifica ogni 30 secondi
        const interval = setInterval(fetchLeaderboard, 30000);

        return () => clearInterval(interval);
    }, [supabaseClient]);

    const today = useMemo(() => {
        const d = new Date();
        // Se il mese non è il mese di test (Dicembre), lo forziamo
        if (d.getMonth() !== TEST_MONTH) d.setMonth(TEST_MONTH);
        // Se TEST_DAY è impostato, forza quel giorno per il testing
        if (TEST_DAY !== null) d.setDate(TEST_DAY);
        return d;
    }, []);

    // Array dei giorni in ordine casuale (ma sempre lo stesso ordine)
    const shuffledDays = useMemo(() => {
        const days = Array.from({ length: 24 }, (_, i) => i + 1);
        // Shuffle con algoritmo Fisher-Yates usando un seed fisso per consistenza
        const shuffled = [...days];
        let seed = 12345; // Seed fisso per avere sempre lo stesso ordine
        const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

    const getBoxStatus = (day) => {
        if (today.getMonth() !== TEST_MONTH) return 'blocked'; // Se il mese è sbagliato, blocca
        if (attempts[day]) return 'opened'; // Già completato

        const currentDay = today.getDate();

        // Giorno futuro - bloccato
        if (day > currentDay) return 'locked';

        // Calcola il giorno minimo disponibile (ultimi MAX_PAST_DAYS giorni)
        const minAvailableDay = Math.max(1, currentDay - MAX_PAST_DAYS + 1);

        // Se il giorno è troppo vecchio, è scaduto
        if (day < minAvailableDay) return 'expired';

        // Giorno disponibile (oggi o negli ultimi MAX_PAST_DAYS giorni)
        return 'available';
    };

    const handleBoxClick = (day) => {
        // Se il banner natalizio è visibile, disabilita tutti i click
        if (showChristmasBanner) {
            return; // Non fare nulla, solo il banner visivo
        }

        const status = getBoxStatus(day);

        // Controllo: se è disponibile, verifica che non ci siano giorni precedenti disponibili non completati
        if (status === 'available') {
            // Trova il giorno disponibile più basso non ancora completato
            const currentDay = today.getDate();
            const minAvailableDay = Math.max(1, currentDay - MAX_PAST_DAYS + 1);

            let earliestAvailableDay = null;
            for (let d = minAvailableDay; d <= currentDay; d++) {
                const dayStatus = getBoxStatus(d);
                if (dayStatus === 'available') {
                    earliestAvailableDay = d;
                    break; // Trova il primo disponibile
                }
            }

            // Se il giorno cliccato non è il primo disponibile, mostra errore
            if (earliestAvailableDay !== null && day !== earliestAvailableDay) {
                showToast(
                    `Devi completare prima il Giorno ${earliestAvailableDay}!`,
                    'warning',
                    'Completa i giorni in ordine'
                );
                return;
            }

            // Altrimenti apri la casella
            setOpenBoxId(day);
        }
        else if (status === 'opened') showToast(`Hai già indicato la canzone del Giorno ${day}!`, 'info', 'Casella Già Aperta');
        else if (status === 'locked') showToast("Non puoi aprire questa casella in anticipo!", 'info', 'Ancora Bloccata');
        else if (status === 'expired') showToast(`Il Giorno ${day} è scaduto! Puoi giocare solo gli ultimi ${MAX_PAST_DAYS} giorni.`, 'warning', 'Casella Scaduta');
        else if (status === 'blocked') showToast("Il Calendario è attivo solo a Dicembre (o nel mese di test).", 'error', 'Mese Sbagliato');
    };

    // --- FUNZIONE CARICAMENTO ISTRUZIONI ---
    const handleShowInstructions = async () => {
        try {
            const response = await fetch('/istruzioni.md');
            const text = await response.text();
            setInstructionsContent(text);
            setShowInstructions(true);
        } catch (error) {
            console.error('Errore caricamento istruzioni:', error);
            showToast('Errore nel caricamento delle istruzioni', 'error');
        }
    };

    // --- FUNZIONI DI DEBUG ---
    const handleDebugCompleteAll = async () => {
        if (!DEBUG_MODE || !supabaseClient || !session) return;

        const confirmed = window.confirm('DEBUG: Vuoi completare tutte le caselle dal 1 al 23? Questo inserirà record fittizi nel database.');
        if (!confirmed) return;

        try {
            const recordsToInsert = [];
            for (let day = 1; day <= 23; day++) {
                if (!attempts[day]) {
                    const data = songData[day];
                    recordsToInsert.push({
                        user_id: session.user.id,
                        box_id: day,
                        selected_id: `${day}_${data.correctId}`,
                        time_spent_seconds: Math.floor(Math.random() * 30) + 10,
                        is_correct: true
                    });
                }
            }

            if (recordsToInsert.length > 0) {
                const { error } = await supabaseClient
                    .from('advent_attempts')
                    .insert(recordsToInsert);

                if (error) throw error;

                // Aggiorna lo stato locale
                const newAttempts = {...attempts};
                recordsToInsert.forEach(record => {
                    newAttempts[record.box_id] = true;
                });
                setAttempts(newAttempts);

                showToast(`DEBUG: ${recordsToInsert.length} caselle completate automaticamente!`, 'success', 'Debug Mode');
            } else {
                showToast('DEBUG: Tutte le caselle 1-23 sono già completate!', 'info', 'Debug Mode');
            }
        } catch (error) {
            console.error('Errore debug:', error);
            showToast('Errore durante il completamento automatico: ' + error.message, 'error', 'Debug Error');
        }
    };

    const handleDebugReset = async () => {
        if (!DEBUG_MODE || !supabaseClient || !session) return;

        const confirmed = window.confirm('DEBUG: Vuoi cancellare TUTTI i tuoi tentativi? Questa azione non può essere annullata!');
        if (!confirmed) return;

        try {
            const { error } = await supabaseClient
                .from('advent_attempts')
                .delete()
                .eq('user_id', session.user.id);

            if (error) throw error;

            setAttempts({});

            // Nascondi il banner natalizio e ferma la neve
            setShowChristmasBanner(false);
            if (window.christmasSnowInterval) {
                clearInterval(window.christmasSnowInterval);
                window.christmasSnowInterval = null;
            }

            showToast('DEBUG: Tutti i tentativi sono stati cancellati!', 'success', 'Debug Mode');
        } catch (error) {
            console.error('Errore debug:', error);
            showToast('Errore durante il reset: ' + error.message, 'error', 'Debug Error');
        }
    };

    // --- FUNZIONE RESET PASSWORD ---
    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (!newPassword || newPassword.length < 6) {
            showToast('La password deve essere di almeno 6 caratteri', 'error');
            return;
        }

        try {
            // Prima imposta la sessione dal token nell'URL
            let hashFragment = window.location.hash.substring(1);

            // Gestisci il doppio hash (reset-password#access_token=...)
            if (hashFragment.includes('#')) {
                hashFragment = hashFragment.split('#')[1];
            }

            const hashParams = new URLSearchParams(hashFragment);
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            console.log('Updating password - access token:', accessToken ? 'PRESENTE' : 'null');

            if (accessToken && refreshToken) {
                await supabaseClient.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
            }

            // Poi aggiorna la password
            const { error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            showToast('Password aggiornata con successo!', 'success');
            setShowPasswordReset(false);
            setNewPassword('');

            // Pulisci l'URL dai token
            window.location.hash = '';

            // Logout per far rifare il login con la nuova password
            await supabaseClient.auth.signOut();
        } catch (error) {
            showToast('Errore: ' + error.message, 'error');
        }
    };

    // --- LOGICHE DI RENDERING CONDIZIONALE ---
    
    // 0. Schermata di attesa caricamento libreria 
    if (!isClientReady) {
           return (
             <div className="min-h-screen flex items-center justify-center bg-gray-50">
                 <p className="text-green-800 font-semibold text-lg animate-pulse">Caricamento sistema...</p>
                   <style>{`
                       .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                       @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
                   `}</style>
             </div>
        );
    }

    // 1. Schermata di Errore Critico/Configurazione Mancante
    if (errorMsg || !supabaseClient) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 p-4">
                <h1 className="text-2xl font-bold text-red-700">⚠️ Errore di Configurazione/Caricamento</h1>
                <p className="mt-4 text-center text-red-600 font-medium max-w-lg">
                    {errorMsg || "Chiavi Supabase mancanti o non valide. Inserisci SUPABASE_URL e SUPABASE_ANON_KEY nel file App.jsx."}
                </p>
                <p className="mt-2 text-sm text-gray-700">Controlla la console del browser (F12) per i dettagli.</p>
            </div>
        );
    }

    // 2. Modal Reset Password (PRIORITÀ - blocca l'accesso finché non si cambia la password)
    if (showPasswordReset) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-4 border-yellow-500">
                    <h2 className="text-3xl font-extrabold text-red-700 mb-4 text-center">🔑 Nuova Password Richiesta</h2>
                    <p className="text-gray-700 mb-6 text-center">
                        Devi impostare una nuova password per accedere all'applicazione.
                    </p>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Nuova Password (min 6 caratteri)"
                            className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-bold transition-colors shadow-md"
                        >
                            ✅ Aggiorna Password e Accedi
                        </button>
                    </form>

                    <button
                        onClick={async () => {
                            await supabaseClient.auth.signOut();
                            setShowPasswordReset(false);
                        }}
                        className="mt-4 w-full text-sm text-gray-500 hover:text-red-500 underline transition-colors"
                    >
                        Annulla e Torna al Login
                    </button>
                </div>
            </div>
        );
    }

    // 2b. Schermata di Autenticazione
    if (!session) return <AuthScreen supabaseClient={supabaseClient} />;

    // 3. Applicazione Principale
    return (
        <div className="min-h-screen font-sans" style={{
            backgroundImage: 'url(/img/sfondo-natale.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            
            {openBoxId && (
                <GameModal
                    boxId={openBoxId}
                    data={songData[openBoxId]}
                    userId={session.user.id}
                    onClose={() => setOpenBoxId(null)}
                    onAttemptSubmitted={(id) => setAttempts(p => ({...p, [id]: true}))}
                    supabaseClient={supabaseClient}
                    showToast={showToast}
                    currentAttempts={attempts}
                    currentDay={today.getDate()}
                    today={today}
                    maxPastDays={MAX_PAST_DAYS}
                    testMonth={TEST_MONTH}
                />
            )}

            {/* Modal Istruzioni */}
            {showInstructions && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl my-8 border-4 border-blue-500 animate-zoomIn">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-3xl font-extrabold text-blue-700">📖 Modalità di Gioco</h2>
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="text-3xl text-gray-500 hover:text-red-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="prose prose-sm max-w-none overflow-y-auto max-h-96">
                            <div
                                className="markdown-content text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: instructionsContent
                                    .replace(/\n/g, '<br/>')
                                    .replace(/##\s⚠️\sIMPORTANTE\s⚠️/g, '<h3 class="font-extrabold text-xl mt-6 mb-3 text-red-600 bg-yellow-100 p-3 rounded-lg border-2 border-red-500 text-center animate-pulse">⚠️ IMPORTANTE ⚠️</h3>')
                                    .replace(/\*\*🏆\sS([^*]+)\*\*/g, '<p class="font-extrabold text-lg text-red-700 bg-yellow-50 p-4 rounded-lg border-l-4 border-red-600 text-center my-2">🏆 S$1</p>')
                                    .replace(/###\s🎄\sBuon\sdivertimento([^<]+)/g, '<h3 class="font-bold text-xl mt-6 mb-3 text-green-700 bg-green-50 p-3 rounded-lg border-2 border-green-400 text-center">🎄 Buon divertimento$1</h3>')
                                    .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<div class="flex justify-center my-4"><img src="$2" alt="$1" class="h-24 w-auto" /></div>')
                                    .replace(/#{1,6}\s(.+)/g, '<h3 class="font-bold text-lg mt-4 mb-2 text-blue-700">$1</h3>')
                                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/###\s(.+)/g, '<h4 class="font-semibold text-base mt-3 mb-1 text-blue-600">$1</h4>')
                                }}
                            />
                        </div>
                        <div className="mt-6 pt-4 border-t">
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-colors shadow-md"
                            >
                                ✓ Ho Capito
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RIMOSSO: Il rendering del componente Toast non è più qui */}
            {/* {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />} */}

            <header className="bg-black bg-opacity-70 text-white p-4 shadow-lg">
                <div className="grid grid-cols-3 items-center">
                    <div></div>
                    <h1 className="font-extrabold text-2xl text-yellow-400 text-center">🎶 Calendario dell'Avvento Musicale 🎶</h1>
                    <div className="flex items-center gap-4 justify-end">
                        <button
                            onClick={handleShowInstructions}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors shadow-md"
                        >
                            ℹ️ Istruzioni
                        </button>
                        {RANKING_VIEW && (
                            <button
                                onClick={() => {
                                    const newShowFullRanking = !showFullRanking;
                                    setShowFullRanking(newShowFullRanking);

                                    // Nascondi solo il banner quando si va alla classifica (la neve continua)
                                    if (newShowFullRanking) {
                                        // Sta andando alla classifica - nascondi solo il banner
                                        setShowChristmasBanner(false);
                                    }
                                    // Quando torna al calendario, l'useEffect ricontrolla automaticamente
                                }}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors shadow-md"
                            >
                                {showFullRanking ? '📅 Torna al Calendario' : '🏆 Classifica Completa'}
                            </button>
                        )}
                        <div className="text-right">
                            <p className="text-sm font-semibold">
                                {session.user.user_metadata?.display_name || session.user.email}
                            </p>
                            <button onClick={() => supabaseClient.auth.signOut()} className="text-sm text-red-400 hover:text-red-300 underline transition-colors">Logout</button>
                        </div>
                    </div>
                </div>
                {DEBUG_MODE && (
                    <div className="mt-3 pt-3 border-t border-yellow-600 flex gap-2 items-center">
                        <span className="text-xs text-yellow-400 font-bold mr-2">🔧 DEBUG MODE:</span>
                        <button
                            onClick={handleDebugCompleteAll}
                            className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                        >
                            ✓ Completa 1-23
                        </button>
                        <button
                            onClick={handleDebugReset}
                            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                        >
                            🗑️ Reset Tutto
                        </button>
                        <span className="text-xs text-gray-300 ml-2">
                            Giorno Simulato: {TEST_DAY !== null ? TEST_DAY : 'Reale'}
                        </span>
                    </div>
                )}
            </header>

            {/* Banner Natalizio Non Modale */}
            {showChristmasBanner && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-red-600 max-w-lg pointer-events-auto">
                        <div className="text-center">
                            <h2 className="text-4xl font-extrabold text-red-700 mb-4">🎄 Complimenti! 🎄</h2>
                            <p className="text-lg text-gray-800 leading-relaxed">
                                Tra qualche giorno saprai se avrai vinto.
                                <br />
                                Per il momento <strong className="text-red-600">Il Circolo</strong> ti augura un buon Natale!
                            </p>
                            <div className="mt-6 text-6xl animate-bounce">
                                🎅🎁⛄
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="container mx-auto p-4 py-8">
                {showFullRanking ? (
                    /* VISTA CLASSIFICA COMPLETA */
                    <div className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-2xl">
                        <h2 className="text-3xl font-extrabold text-center text-red-700 mb-8 border-b-2 border-red-300 pb-4">
                            🏆 Classifica Completa
                        </h2>
                        {fullLeaderboard.length > 0 ? (
                            <div className="space-y-3">
                                {fullLeaderboard.map((player, index) => {
                                    const isTop3 = index < 3;
                                    const medals = ['🥇', '🥈', '🥉'];
                                    const position = index + 1;

                                    return (
                                        <div
                                            key={player.user_id}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                                isTop3
                                                    ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-400 shadow-md'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 text-center">
                                                    {isTop3 ? (
                                                        <span className="text-3xl">{medals[index]}</span>
                                                    ) : (
                                                        <span className="text-xl font-bold text-gray-500">#{position}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${isTop3 ? 'text-lg' : 'text-base'} text-gray-800`}>
                                                        {player.display_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {player.correct_answers} risposte corrette
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${isTop3 ? 'text-xl text-red-600' : 'text-lg text-gray-700'}`}>
                                                    {Math.floor(player.total_time / 60)}:{(player.total_time % 60).toString().padStart(2, '0')}
                                                </p>
                                                <p className="text-xs text-gray-500">tempo totale</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">Nessun partecipante ancora...</p>
                        )}
                    </div>
                ) : (
                    /* VISTA CALENDARIO */
                    <>
                        <div className="grid grid-cols-4 gap-4 bg-white bg-opacity-90 p-6 rounded-2xl shadow-2xl max-w-2xl mx-auto">
                            {shuffledDays.map(day => {
                                const status = getBoxStatus(day);
                                let bg = 'bg-red-800 opacity-60';
                                let text = 'text-white';
                                let interaction = '';

                                if (status === 'available') {
                                    bg = 'bg-green-600 hover:bg-green-700 cursor-pointer hover:scale-105 shadow-xl border-4 border-yellow-300';
                                    interaction = 'transition-all duration-300 transform';
                                }
                                if (status === 'opened') {
                                    bg = 'bg-yellow-400 border-4 border-red-600';
                                    text = 'text-red-900';
                                }
                                if (status === 'locked') {
                                    bg = 'bg-red-900 opacity-70 cursor-not-allowed';
                                }
                                if (status === 'expired') {
                                    bg = 'bg-gray-700 opacity-40 cursor-not-allowed line-through';
                                    text = 'text-gray-400';
                                }
                                if (status === 'blocked') {
                                    bg = 'bg-gray-500 opacity-50 cursor-not-allowed';
                                }

                                // 24 Emoji natalizie diverse (una per ogni giorno)
                                const christmasIcons = [
                                    '🎄', '🎅', '⛄', '🎁', '🔔', '⭐', '🕯️', '🦌',
                                    '🎀', '❄️', '🌟', '🎊', '🎉', '🧦', '🍪', '🥛',
                                    '🎶', '🎵', '🏠', '🛷', '🤶', '👼', '🔥', '🌲'
                                ];
                                const iconForDay = christmasIcons[day - 1]; // Ogni giorno ha la sua icona unica

                                // Posizioni casuali per il numero (4 angoli diversi)
                                const cornerPositions = ['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'];
                                const cornerIndex = (day * 7) % 4; // Calcolo deterministico ma varia tra i giorni
                                const numberPosition = cornerPositions[cornerIndex];

                                // Se il banner è visibile, disabilita visivamente le caselle
                                const disabledClass = showChristmasBanner ? 'opacity-60 cursor-not-allowed' : '';

                                return (
                                    <div
                                        key={day}
                                        onClick={() => handleBoxClick(day)}
                                        className={`${bg} ${text} ${interaction} ${disabledClass} p-4 rounded-xl aspect-square flex items-center justify-center text-2xl font-black relative overflow-hidden`}>
                                        {/* Icona natalizia di sfondo - ben visibile */}
                                        <div className="absolute inset-0 flex items-center justify-center text-7xl">
                                            {iconForDay}
                                        </div>
                                        {/* Numero del giorno in angolo casuale */}
                                        <div className={`absolute ${numberPosition} z-10 text-2xl font-extrabold bg-black bg-opacity-60 px-2 py-1 rounded-lg`}>
                                            {status === 'opened' ? '🎵' : day}
                                        </div>
                                        {status === 'expired' && (
                                            <span className="absolute top-1 right-1 text-base z-20">⏰</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer con Logo */}
                        <footer className="py-8 flex justify-center">
                            <img src="/img/Logo_CRCT.png" alt="Logo Circolo FTC" className="h-20 w-auto" />
                        </footer>
                    </>
                )}
            </main>
              <style>{`
                 @keyframes zoomIn {
                     from { opacity: 0; transform: scale(0.5); }
                     to { opacity: 1; transform: scale(1); }
                 }
                 .animate-zoomIn {
                     animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                 }

                 @keyframes slideIn {
                     from {
                         opacity: 0;
                         transform: translateY(-10px);
                     }
                     to {
                         opacity: 1;
                         transform: translateY(0);
                     }
                 }
                 .animate-slideIn {
                     animation: slideIn 0.3s ease-out forwards;
                 }

                 @keyframes progressBar {
                     from { width: 0%; }
                     to { width: 100%; }
                 }

                 @keyframes fastPulse {
                     0%, 100% {
                         opacity: 1;
                         transform: scale(1);
                         box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
                     }
                     50% {
                         opacity: 0.7;
                         transform: scale(1.05);
                         box-shadow: 0 0 20px 10px rgba(34, 197, 94, 0);
                     }
                 }
                 .animate-fastPulse {
                     animation: fastPulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                 }

                 /* Stili per un bel font */
                 body { font-family: 'Inter', sans-serif; }

                 /* Stile personalizzato per SweetAlert2 in modo che sia sopra GameModal */
                 .swal2-container--custom-z {
                    z-index: 60;
                 }
             `}</style>
        </div>
    );
}