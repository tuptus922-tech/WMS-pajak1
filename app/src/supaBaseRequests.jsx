import supabase from "./supaBaseClient.jsx"

export async function fetchProfile(args) {
    const userId = typeof args === 'string' ? args : args?.userId
    const setProfile = typeof args === 'object' ? args?.setProfile : undefined

    if (!userId) {
        console.warn("Pominięto pobieranie profilu: brak userId")
        return
    }

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

export async function fetchPrzedmioty({setPrzedmioty}) {
    const { data,error} = await supabase
    .from("przedmioty")
    .select('*')
    .eq('unikalny', false)
    if (error) {
        console.error("Błąd pobierania przedmiotów:", error);
    } else {
        setPrzedmioty(data);
    }
}

export async function fetchPrzedmiotyUnikalne({setPrzedmiotyUnikalne}) {
    const { data, error } = await supabase
        .from("unikalne_przedmioty")
        .select(`
            id,
            nazwa,
            id_przedmiotu,
            przedmioty (
                id,
                nazwa,
                unikalny,
                id_kategorii,
                kategorie (
                    nazwa_kategorii, numerowane 
                )
            )
        `);

    if (error) {
        console.error("Błąd pobierania unikalnych przedmiotów:", error);
    } else {
        setPrzedmiotyUnikalne(data);
    }
}