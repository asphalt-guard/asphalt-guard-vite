import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env
	.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// Functions

export const createNewUser = async (user: object, password) => {
	const { data, authError } = await supabase.auth.signUp({
		email: user.email,
		password,
	})

	if (authError) {
		console.error("Error signing up:", error.message)
		return false
	}

	const { databaseError } = await supabase
		.from("users")
		.insert({ ...user, user_id: data.user.id })

	if (databaseError) return false

	return true
}

export const getUserByUID = async (UID) => {
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("user_id", UID) // key-value pair
		.single() // ensures only one row is returned

	if (error) {
		console.error("Error fetching user:", error.message)
		return null
	}

	return data
}

export const logIn = async (credentials: object) => {
	const { error } = await supabase.auth.signInWithPassword(credentials)

	if (error) return false

	return true
}

export const logOut = async () => {
	const { error } = await supabase.auth.signOut()

	if (error) return false

	return true
}
