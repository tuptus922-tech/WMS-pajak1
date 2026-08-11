import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import supabase from "./supaBaseClient.jsx"
import Login from "./assets/pages/LoginPage/login.jsx"
import './App.css'

import {fetchProfile,fetchPrzedmioty,fetchPrzedmiotyUnikalne} from './supaBaseRequests.jsx'

import MagazynPage from './assets/pages/MagazynPage/MagazynPage.jsx'

export default function App() {
  // zmienne sesji
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  // dane
  const [profile, setProfile] = useState(null)
  const [przedmioty, setPrzedmioty] = useState([])
  const [przedmiotyUnikalne, setPrzedmiotyUnikalne] = useState([])

  useEffect(() => {


    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)

      // Jeśli użytkownik jest zalogowany przy wejściu na stronę, od razu pobierz jego profil
      if (session) {
        // Po pobraniu profilu wyłączamy ładowanie
        fetchProfile({ userId: session.user.id, setProfile }).then(() => setLoading(false))
      } else {
        // Jeśli nie ma sesji, po prostu wyłączamy ładowanie
        setLoading(false)
      }
    })

    
    // 1. Zewnętrzna funkcja do pobierania profilu (przyjmuje ID jako argument)
    if (session?.user?.id) {
      fetchProfile({ userId: session.user.id, setProfile });
    }

    // 2. Pobierz aktualną sesję przy uruchomieniu aplikacji
    

    // 3. Nasłuchuj zmian (logowanie, wylogowanie)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      if (session) {
        fetchProfile({ userId: session.user.id, setProfile })
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()

    fetchPrzedmioty(setPrzedmioty)
    fetchPrzedmiotyUnikalne(setPrzedmiotyUnikalne)
    console.log("Przedmioty:", przedmioty)
    console.log("Przedmioty unikalne:", przedmiotyUnikalne)
    console.log("Profile:", profile)
    console.log("Session:", session)
    console.log(session.user.id)
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
      <Route path="/dashboard" element={session ? <MagazynPage session={session} profile={profile} /> : <Navigate to="/" />} />
      {/* <Route path="*" element={<Navigate to="/" />} /> */}
    </Routes>
  </BrowserRouter>
)
}