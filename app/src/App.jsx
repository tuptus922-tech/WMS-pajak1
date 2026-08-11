import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import supabase from "./supaBaseClient.jsx"
import Login from "./assets/pages/login.jsx"
import Dashboard from "./assets/pages/dashboard.jsx"
import './App.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // 1. Zewnętrzna funkcja do pobierania profilu (przyjmuje ID jako argument)
    async function fetchProfile(userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error("Błąd pobierania profilu:", error);
      } else {
        setProfile(data);
      }
    }

    // 2. Pobierz aktualną sesję przy uruchomieniu aplikacji
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)

      // Jeśli użytkownik jest zalogowany przy wejściu na stronę, od razu pobierz jego profil
      if (session) {
        // Po pobraniu profilu wyłączamy ładowanie
        fetchProfile(session.user.id).then(() => setLoading(false))
      } else {
        // Jeśli nie ma sesji, po prostu wyłączamy ładowanie
        setLoading(false)
      }
    })

    // 3. Nasłuchuj zmian (logowanie, wylogowanie)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      if (session) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div>
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    )
}

return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={session ? <Dashboard session={session} profile={profile} /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
)
}