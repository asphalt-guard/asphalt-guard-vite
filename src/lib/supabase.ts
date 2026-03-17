import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env
	.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// Functions
// @ts-expect-error yes
export const createNewUser = async (user: object, password) => {
	// @ts-expect-error yes
	const { data, authError } = await supabase.auth.signUp({
		// @ts-expect-error yes
		email: user.email,
		password,
	})

	if (authError) {
		// @ts-expect-error yes
		console.error("Error signing up:", error.message)
		return false
	}
	// @ts-expect-error yes
	const { databaseError } = await supabase
		.from("users") // @ts-expect-error yes
		.insert({ ...user, user_id: data.user.id })

	if (databaseError) return false

	return true
}

// @ts-expect-error yes
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
	// @ts-expect-error yes
	const { error } = await supabase.auth.signInWithPassword(credentials)

	if (error) return false

	return true
}

export const logOut = async () => {
	const { error } = await supabase.auth.signOut()

	if (error) return false

	return true
}
