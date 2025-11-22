
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// La riga 'import { createClient } from '@supabase/supabase-js';' è stata rimossa
// perché causava un errore di risoluzione nell'ambiente di esecuzione.

// --- CONFIGURAZIONE SUPABASE (DEVI MODIFICARE QUESTI VALORI) ---
// Rimuovi questo commento dopo aver configurato le tue chiavi.
const SUPABASE_URL ="https://jpfejnxrxhzieqsnblui.supabase.co"; 
const SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZmVqbnhyeGh6aWVxc25ibHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDUyODIsImV4cCI6MjA3OTMyMTI4Mn0.hhz6gTQxbakpIfaZGjtxfnrpbZ4P4SLFjOCP2bwbAJo";

// --- DATI E CONFIGURAZIONE ---
const TEST_MONTH = 11; // 11 = Dicembre
const TEST_DAY = 24; // Imposta a 24 per testare il giorno 24, null per usare la data reale
const DEBUG_MODE = true; // Abilita funzioni di debug (pulsante per completare tutte le caselle)

const songData = {
    1: { correctId: 2, titles: { 1: "Jingle Bells", 2: "All I Want For Christmas Is You", 3: "Silent Night (Remix)" } },
    2: { correctId: 3, titles: { 1: "We Wish You a Merry Christmas", 2: "The First Noel", 3: "Let It Snow" } },
    3: { correctId: 1, titles: { 1: "Santa Claus Is Comin' to Town", 2: "It's Beginning to Look a Lot Like Christmas", 3: "Winter Wonderland" } },
    4: { correctId: 2, titles: { 1: "Feliz Navidad", 2: "White Christmas", 3: "Have Yourself a Merry Little Christmas" } },
    5: { correctId: 3, titles: { 1: "Rockin' Around the Christmas Tree", 2: "Last Christmas", 3: "All I Want for Christmas Is You" } },
    6: { correctId: 1, titles: { 1: "Sleigh Ride", 2: "Mary, Did You Know?", 3: "Blue Christmas" } },
    7: { correctId: 2, titles: { 1: "Run Rudolph Run", 2: "Do They Know It's Christmas?", 3: "Auld Lang Syne" } },
    8: { correctId: 3, titles: { 1: "Jingle Bell Rock", 2: "Hark! The Herald Angels Sing", 3: "Frosty the Snowman" } },
    9: { correctId: 1, titles: { 1: "Here Comes Santa Claus", 2: "O Holy Night", 3: "Joy to the World" } },
    10: { correctId: 2, titles: { 1: "The Twelve Days of Christmas", 2: "Wonderful Christmastime", 3: "The Little Drummer Boy" } },
    11: { correctId: 3, titles: { 1: "It's the Most Wonderful Time of the Year", 2: "Grown-Up Christmas List", 3: "Holly Jolly Christmas" } },
    12: { correctId: 1, titles: { 1: "Baby, It's Cold Outside", 2: "Christmas (Baby Please Come Home)", 3: "Zat You Santa Claus?" } },
    13: { correctId: 2, titles: { 1: "I Saw Mommy Kissing Santa Claus", 2: "Happy Xmas (War Is Over)", 3: "What Christmas Means to Me" } },
    14: { correctId: 3, titles: { 1: "Nuttin' for Christmas", 2: "Go Tell It on the Mountain", 3: "Driving Home for Christmas" } },
    15: { correctId: 1, titles: { 1: "Linus and Lucy (Peanuts)", 2: "O Come All Ye Faithful", 3: "A Christmas Song (Chestnuts)" } },
    16: { correctId: 2, titles: { 1: "You're a Mean One, Mr. Grinch", 2: "Simply Having a Wonderful Christmas Time", 3: "The Chipmunk Song" } },
    17: { correctId: 3, titles: { 1: "Ding Dong Merrily on High", 2: "Good King Wenceslas", 3: "God Rest Ye Merry Gentlemen" } },
    18: { correctId: 1, titles: { 1: "Silent Night", 2: "Do You Hear What I Hear?", 3: "Silver Bells" } },
    19: { correctId: 2, titles: { 1: "It's a Marshmallow World", 2: "Jingle Bells", 3: "Santa Baby" } },
    20: { correctId: 3, titles: { 1: "Let It Snow! Let It Snow! Let It Snow!", 2: "Christmas Time Is Here", 3: "Rudolph the Red-Nosed Reindeer" } },
    21: { correctId: 1, titles: { 1: "Winter Wonderland", 2: "The Christmas Song", 3: "Frosty the Snowman" } },
    22: { correctId: 2, titles: { 1: "Sleigh Ride", 2: "We Three Kings", 3: "Away in a Manger" } },
    23: { correctId: 3, titles: { 1: "A Holly Jolly Christmas", 2: "I'll Be Home for Christmas", 3: "Here Comes Santa Claus" } },
    24: { correctId: 1, titles: { 1: "Hallelujah Chorus (Handel)", 2: "O Come, O Come, Emmanuel", 3: "Carol of the Bells" } },
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

const GameModal = ({ boxId, data, onClose, userId, onAttemptSubmitted, supabaseClient, showToast, currentAttempts, currentDay }) => {
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
                console.error("Errore riproduzione audio (potrebbe essere blocco autoplay):", error);
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
            const availableBoxes = [];
            for (let day = 1; day <= currentDay && day <= 24; day++) {
                if (!updatedAttempts[day]) {
                    availableBoxes.push(day);
                }
            }
            const hasAvailableBoxes = availableBoxes.length > 0;
            const isDay24 = boxId === 24;
            const allCompleted = Object.keys(updatedAttempts).length === Math.min(currentDay, 24);

            // Mostra SweetAlert di conferma personalizzato
            if (window.Swal) {
                // Caso speciale: giorno 24 e tutte le caselle completate
                if (isDay24 && allCompleted) {
                    // Effetto neve
                    const confettiScript = document.createElement('script');
                    confettiScript.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
                    confettiScript.onload = () => {
                        // Effetto fiocchi di neve
                        const duration = 15 * 1000;
                        const animationEnd = Date.now() + duration;
                        const defaults = { startVelocity: 0, spread: 360, ticks: 60, zIndex: 9999 };

                        function randomInRange(min, max) {
                            return Math.random() * (max - min) + min;
                        }

                        const interval = setInterval(function() {
                            const timeLeft = animationEnd - Date.now();

                            if (timeLeft <= 0) {
                                return clearInterval(interval);
                            }

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
                    };
                    document.head.appendChild(confettiScript);

                    window.Swal.fire({
                        title: '🎄 Complimenti! 🎄',
                        html: '<p style="font-size: 1.1em; line-height: 1.6;">Tra qualche giorno saprai se avrai vinto.<br>Per il momento <strong>Il Circolo</strong> ti augura un buon Natale!</p>',
                        icon: 'success',
                        iconColor: '#d32f2f',
                        timer: 10000,
                        timerProgressBar: true,
                        showConfirmButton: true,
                        confirmButtonText: 'Chiudi',
                        confirmButtonColor: '#2e7d32',
                        background: '#fff',
                        backdrop: 'rgba(0,0,0,0.4)'
                    });
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
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        
        try {
            if (!supabaseClient) throw new Error("Supabase non configurato.");

            let result;
            if (isRegistering) {
                result = await supabaseClient.auth.signUp({ email, password });
            } else {
                result = await supabaseClient.auth.signInWithPassword({ email, password });
            }

            if (result.error) throw result.error;
            
            if (isRegistering) {
                setMsg('Registrazione completata! Controlla la mail per confermare, poi effettua il login.');
                setIsRegistering(false);
            } else {
                // Login gestito dal listener in App
            }
        } catch (error) {
            setMsg('Errore: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm border-4 border-green-500">
                <h2 className="text-3xl font-extrabold mb-6 text-red-600 text-center">{isRegistering ? '🎄 Registrati' : '🎅 Accedi'}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full border p-3 rounded-lg focus:border-green-500 focus:ring-green-500" value={email} onChange={e=>setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="w-full border p-3 rounded-lg focus:border-green-500 focus:ring-green-500" value={password} onChange={e=>setPassword(e.target.value)} required />
                    <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-bold transition-colors shadow-md">
                        {loading ? 'Attendi...' : (isRegistering ? 'Crea Account' : 'Accedi al Calendario')}
                    </button>
                </form>
                {msg && <p className="mt-4 text-sm text-center text-red-700 font-medium bg-red-50 p-2 rounded">{msg}</p>}
                <button onClick={()=>setIsRegistering(!isRegistering)} className="mt-4 w-full text-sm text-gray-500 hover:text-red-500 underline transition-colors">
                    {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati ora'}
                </button>
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
        
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                // MODIFICATA: Aggiunto un titolo all'alert di successo
                showToast(`Benvenuto, ${session.user.email}!`, 'success', 'Accesso Riuscito');
            } else {
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

    const today = useMemo(() => {
        const d = new Date();
        // Se il mese non è il mese di test (Dicembre), lo forziamo
        if (d.getMonth() !== TEST_MONTH) d.setMonth(TEST_MONTH);
        // Se TEST_DAY è impostato, forza quel giorno per il testing
        if (TEST_DAY !== null) d.setDate(TEST_DAY);
        return d;
    }, []);

    const getBoxStatus = (day) => {
        if (today.getMonth() !== TEST_MONTH) return 'blocked'; // Se il mese è sbagliato, blocca
        if (attempts[day]) return 'opened';
        if (day <= today.getDate()) return 'available';
        return 'locked';
    };

    const handleBoxClick = (day) => {
        const status = getBoxStatus(day);
        if (status === 'available') setOpenBoxId(day);
        // MODIFICATA: Aggiornate le chiamate a showToast
        else if (status === 'opened') showToast(`Hai già indicato la canzone del Giorno ${day}!`, 'info', 'Casella Già Aperta');
        else if (status === 'locked') showToast("Non puoi aprire questa casella in anticipo!", 'info', 'Ancora Bloccata');
        else showToast("Il Calendario è attivo solo a Dicembre (o nel mese di test).", 'error', 'Mese Sbagliato');
        // FINE MODIFICATA
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
            showToast('DEBUG: Tutti i tentativi sono stati cancellati!', 'success', 'Debug Mode');
        } catch (error) {
            console.error('Errore debug:', error);
            showToast('Errore durante il reset: ' + error.message, 'error', 'Debug Error');
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

    // 2. Schermata di Autenticazione
    if (!session) return <AuthScreen supabaseClient={supabaseClient} />;

    // 3. Applicazione Principale
    return (
        <div className="min-h-screen font-sans" style={{
            backgroundImage: 'url(https://placehold.co/1200x800/1E392A/ffffff?text=Calendario+Avvento+Musical)', 
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
                />
            )}

            {/* RIMOSSO: Il rendering del componente Toast non è più qui */}
            {/* {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />} */}

            <header className="bg-black bg-opacity-70 text-white p-4 shadow-lg">
                <div className="flex justify-between items-center">
                    <h1 className="font-extrabold text-2xl text-yellow-400">🎶 Calendario Avvento Musicale</h1>
                    <div className="text-right">
                        <p className="text-sm">{session.user.email}</p>
                        <button onClick={() => supabaseClient.auth.signOut()} className="text-sm text-red-400 hover:text-red-300 underline transition-colors">Logout</button>
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

            <main className="container mx-auto p-4 py-8">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 bg-white bg-opacity-90 p-6 rounded-2xl shadow-2xl">
                    {Array.from({ length: 24 }, (_, i) => i + 1).map(day => {
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
                        if (status === 'blocked') {
                            bg = 'bg-gray-500 opacity-50 cursor-not-allowed';
                        }
                        
                        return (
                            <div 
                                key={day} 
                                onClick={() => handleBoxClick(day)} 
                                className={`${bg} ${text} ${interaction} p-4 rounded-xl h-24 flex items-center justify-center text-2xl font-black`}>
                                {status === 'opened' ? '🎵' : day}
                            </div>
                        );
                    })}
                </div>
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