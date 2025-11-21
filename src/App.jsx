import React, { useState, useEffect, useMemo, useCallback } from 'react';
// La riga 'import { createClient } from '@supabase/supabase-js';' è stata rimossa
// perché causava un errore di risoluzione nell'ambiente di esecuzione.
// Useremo il caricamento tramite CDN e l'oggetto globale 'window.supabase'.

// --- CONFIGURAZIONE SUPABASE (DEVI MODIFICARE QUESTI VALORI) ---
// Vai su Supabase -> Project Settings -> API per trovare questi dati

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL; 
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- DATI E CONFIGURAZIONE ---
const TEST_MONTH = 11; // 11 = Dicembre

const songData = {
    1: { correctId: 2, titles: { 1: "Jingle Bells (Cover)", 2: "Deck the Halls", 3: "Silent Night (Remix)" } },
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

const GameModal = ({ boxId, data, onClose, userId, onAttemptSubmitted, supabaseClient }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const audioRef = React.useRef(null);
    
    const shuffledIds = useMemo(() => shuffleArray([1, 2, 3]), [boxId]);

    const handlePlay = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            
            // --- CARICAMENTO MP3 (Rimosso Tone.js) ---
            audioRef.current.src = `/audio/song_${boxId}.mp3`;
            audioRef.current.play().catch(error => {
                // Gestisce l'errore di Autoplay bloccato dal browser (comune)
                console.error("Errore riproduzione audio (potrebbe essere blocco autoplay):", error);
                alert("Impossibile avviare l'audio automaticamente. Clicca un punto qualsiasi della pagina e riprova.");
            });
            // -----------------------------------------

            setTimerRunning(true);
            setTimeElapsed(0);
        }
    }, [boxId]);

    useEffect(() => {
        let interval;
        if (timerRunning) {
            interval = setInterval(() => setTimeElapsed(p => p + 1), 1000);
        } else if (!timerRunning && timeElapsed !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerRunning]);

    const handleSubmit = async () => {
        if (!selectedAnswer || isSubmitting) return;
        
        // Ferma l'audio e il timer prima di inviare
        if (audioRef.current) audioRef.current.pause();
        setTimerRunning(false);

        setIsSubmitting(true);

        const isCorrect = parseInt(selectedAnswer.split('_')[1]) === data.correctId;

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
            onAttemptSubmitted(boxId);
        } catch (error) {
            console.error("Errore Supabase:", error.message);
            // Usando alert() perché è un ambiente di sandbox
            alert("Errore nel salvataggio: " + error.message); 
        } finally {
            setIsSubmitting(false);
            onClose();
        }
    };

    const isConfirmDisabled = selectedAnswer === null || isSubmitting;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <audio ref={audioRef} preload="auto" />
            <div className="bg-white p-6 rounded-xl shadow-2xl w-11/12 max-w-md animate-zoomIn">
                <h2 className="text-2xl font-extrabold text-red-700 mb-4 text-center">Indovina la canzone</h2>
                <div className="text-center mb-4 p-2 bg-gray-100 rounded-lg">
                    <span className="text-xl font-mono text-gray-800">Tempo: {timeElapsed}s</span>
                </div>
                <div className="flex justify-center mb-6">
                    <button onClick={handlePlay} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full">
                        Play Musica ({boxId})
                    </button>
                </div>
                <fieldset className="space-y-3 mb-6">
                    {shuffledIds.map(id => (
                        <div key={id} className="flex items-center">
                            <input 
                                id={`s-${id}`} name="guess" type="radio" value={`${boxId}_${id}`}
                                onChange={(e) => setSelectedAnswer(e.target.value)}
                                disabled={!timerRunning}
                                className="h-5 w-5 text-red-600"
                            />
                            <label htmlFor={`s-${id}`} className="ml-3 text-sm font-medium text-gray-700">
                                {data.titles[id]}
                            </label>
                        </div>
                    ))}
                </fieldset>
                <div className="flex justify-between">
                    <button onClick={handleSubmit} disabled={isConfirmDisabled} className={`py-2 px-4 rounded font-bold text-white ${isConfirmDisabled ? 'bg-gray-400' : 'bg-red-600'}`}>
                        {isSubmitting ? '...' : 'Conferma'}
                    </button>
                    <button onClick={onClose} className="text-gray-500">Chiudi</button>
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
            <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4 text-red-600">{isRegistering ? 'Registrati' : 'Accedi'}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full border p-2 rounded" value={email} onChange={e=>setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="w-full border p-2 rounded" value={password} onChange={e=>setPassword(e.target.value)} required />
                    <button type="submit" disabled={loading} className="w-full bg-green-600 text-white p-2 rounded font-bold">
                        {loading ? 'Attendi...' : (isRegistering ? 'Registrati' : 'Entra')}
                    </button>
                </form>
                {msg && <p className="mt-4 text-sm text-center text-blue-600">{msg}</p>}
                <button onClick={()=>setIsRegistering(!isRegistering)} className="mt-4 w-full text-xs text-gray-500 underline">
                    {isRegistering ? 'Hai già un account? Accedi' : 'Crea un account'}
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

    // 0. Inizializzazione Supabase Dinamica
    useEffect(() => {
        const initClient = () => {
            if (window.supabase) {
                if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("INSERISCI")) {
                    try {
                        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                        setSupabaseClient(client);
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

        // Se la libreria è già stata caricata, procedi
        if (window.supabase) {
            initClient();
            return;
        }

        // Se non è caricata, iniettiamo dinamicamente lo script per una maggiore affidabilità
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.async = true;
        script.onload = initClient; // Quando lo script è caricato, inizializza
        script.onerror = () => {
            console.error("ERRORE CARICAMENTO: Supabase CDN non è riuscito a caricare.");
            setErrorMsg("ERRORE CARICAMENTO: Supabase CDN non è riuscito a caricare.");
            setIsClientReady(true);
        };
        document.head.appendChild(script);

        return () => {
             // Rimuove lo script se presente per pulizia
             if (document.head.contains(script)) {
                document.head.removeChild(script);
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
        });

        return () => subscription.unsubscribe();
    }, [supabaseClient]);

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
                // Aggiorna lo stato di errore per un feedback visivo, soprattutto se la tabella manca
                alert("Errore nel caricamento dei dati: " + error.message + ". Assicurati che la tabella 'advent_attempts' esista.");
            } else {
                const completed = {};
                if(data) data.forEach(row => completed[row.box_id] = true);
                setAttempts(completed);
            }
        };

        fetchAttempts();
    }, [session, supabaseClient]);

    const today = useMemo(() => {
        const d = new Date();
        if (d.getMonth() !== TEST_MONTH) d.setMonth(TEST_MONTH);
        return d;
    }, []);

    const getBoxStatus = (day) => {
        if (today.getMonth() !== TEST_MONTH) return 'blocked';
        if (attempts[day]) return 'opened';
        if (day <= today.getDate()) return 'available';
        return 'locked';
    };

    const handleBoxClick = (day) => {
        const status = getBoxStatus(day);
        if (status === 'available') setOpenBoxId(day);
        else if (status === 'opened') alert("Hai già indovinato questa canzone!"); 
        else alert("Non ancora disponibile o mese errato.");
    };

    // --- LOGICHE DI RENDERING CONDIZIONALE ---
    
    // 0. Schermata di attesa caricamento libreria
    if (!isClientReady) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-green-50">
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
                <h1 className="text-2xl font-bold text-red-700">Errore di Configurazione/Caricamento</h1>
                <p className="mt-4 text-center text-red-600 font-medium">
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
        <div className="min-h-screen bg-green-800 font-sans" style={{backgroundImage: 'url(https://placehold.co/1200x800/228B22/ffffff?text=Sfondo+Natalizio)', backgroundSize: 'cover'}}>
            
            {openBoxId && (
                <GameModal 
                    boxId={openBoxId} 
                    data={songData[openBoxId]} 
                    userId={session.user.id}
                    onClose={() => setOpenBoxId(null)}
                    onAttemptSubmitted={(id) => setAttempts(p => ({...p, [id]: true}))}
                    supabaseClient={supabaseClient} 
                />
            )}

            <header className="bg-black bg-opacity-70 text-white p-4 flex justify-between items-center">
                <h1 className="font-bold text-xl">Calendario Musicale (Supabase)</h1>
                <div className="text-right">
                    <p className="text-xs">{session.user.email}</p>
                    <button onClick={() => supabaseClient.auth.signOut()} className="text-xs text-yellow-400 underline">Logout</button>
                </div>
            </header>

            <main className="container mx-auto p-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 bg-white bg-opacity-90 p-6 rounded-xl shadow-2xl mt-8">
                    {Array.from({ length: 24 }, (_, i) => i + 1).map(day => {
                        const status = getBoxStatus(day);
                        let bg = 'bg-red-700 opacity-50';
                        if (status === 'available') bg = 'bg-green-500 hover:bg-green-600 cursor-pointer hover:scale-105 shadow-lg';
                        if (status === 'opened') bg = 'bg-yellow-400 border-2 border-red-600 text-red-900';

                        return (
                            <div key={day} onClick={() => handleBoxClick(day)} className={`${bg} p-4 rounded-lg h-24 flex items-center justify-center text-2xl font-bold text-white transition-all duration-200`}>
                                {status === 'opened' ? '✓' : day}
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
            `}</style>
        </div>
    );
}