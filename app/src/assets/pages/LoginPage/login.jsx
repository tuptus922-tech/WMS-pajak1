import { useState } from "react";
import supabase from "../../../supaBaseClient"
import { useNavigate } from "react-router-dom";



export default function Login() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("login")

    const [registerEmail, setRegisterEmail] = useState("")
    const [registerPassword, setRegisterPassword] = useState("")
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")

    const [imie,setImie] = useState("")
    const [nazwisko,setNazwisko] = useState("")

    async function signUpNewUser(event) {
        event.preventDefault()
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: registerEmail,
            password: registerPassword,
        })

        if (authError) return console.error(authError.message);

        const userId = authData.user?.id;

        const {error: profileError} = await supabase
        .from('profiles')
        .insert([
            {
                id:userId,
                imie:imie,
                nazwisko:nazwisko
            }
        ])

        if (profileError) {
            console.error("Błąd tworzenia profilu: ", profileError.message);
        } else {
            console.log("Konto i profil utworzone pomyślnie!");
            navigate("/dashboard");
        }
    }

    async function signInWithEmail(event) {
        event.preventDefault()
        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPassword,
        })

        if (error) {
            console.error(error)
        }
        else{
            navigate("/dashboard"

            );
        }
    }
    

    // onChange ustawianie useState
    function handleRegisterEmail(event) {
        setRegisterEmail(event.target.value)
    }

    function handleRegisterPassword(event) {
        setRegisterPassword(event.target.value)
    }

    function handleLoginEmail(event) {
        setLoginEmail(event.target.value)
    }

    function switchMode(nextMode) {
        setMode(nextMode)
    }

    function handleLoginPassword(event) {
        setLoginPassword(event.target.value)
    }

    function handleImie(event) {
        setImie(event.target.value)
    }

    function handleNazwisko(event) {
        setNazwisko(event.target.value)
    }

    return (
        <div className="card bg-base-300 w-150 shadow-sm">
            <div className="mainLogin">
                <div className="loginTabs">
                    <button
                        type="button"
                        className={mode === "login" ? "tabButton active" : "tabButton"}
                        onClick={() => switchMode("login")}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={mode === "signup" ? "tabButton active" : "tabButton"}
                        onClick={() => switchMode("signup")}
                    >
                        Sign up
                    </button>
                </div>

                {mode === "login" ? (
                    <form className="authForm" onSubmit={signInWithEmail}>
                        <h1>Welcome back</h1>
                        <p className="authSubtitle">Zaloguj się, żeby wejść do panelu.</p>
                        <input type="email" name="email" placeholder="Email" required value={loginEmail} onChange={handleLoginEmail} />
                        <input type="password" name="pswd" placeholder="Password" required value={loginPassword} onChange={handleLoginPassword} />
                        <button type="submit">Login</button>
                    </form>
                ) : (
                    <form className="authForm" onSubmit={signUpNewUser}>
                        <h1>Create account</h1>
                        <p className="authSubtitle">Załóż konto w prostym, czystym stylu.</p>
                        <input type="email" name="email" placeholder="Email" required value={registerEmail} onChange={handleRegisterEmail} />
                        <input type="password" name="pswd" placeholder="Password" required value={registerPassword} onChange={handleRegisterPassword} />
                        <input type="text" name="imie" placeholder="Imie" required value={imie} onChange={handleImie} />
                        <input type="text" name="nazwisko" placeholder="Nazwisko" required value={nazwisko} onChange={handleNazwisko} />
                        <button type="submit">Sign up</button>
                    </form>
                )}
            </div>
        </div>
    );
}