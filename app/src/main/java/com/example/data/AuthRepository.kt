package com.example.data

import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.tasks.await
import java.security.MessageDigest
import java.util.UUID

class AuthRepository {
    
    private val auth: FirebaseAuth? by lazy {
        try {
            FirebaseAuth.getInstance()
        } catch (e: Exception) {
            null
        }
    }

    fun getCurrentUserId(): String? = auth?.currentUser?.uid
    fun getCurrentUserEmail(): String? = auth?.currentUser?.email

    suspend fun signInWithGoogle(context: Context): Result<String> {
        return try {
            val credentialManager = CredentialManager.create(context)
            
            // Note: In a real production app with AI Studio, you must configure the Web Client ID
            // from the Google Cloud Console in strings.xml and reference it here.
            // For now, we simulate success or use a placeholder if it fails, but this is the real flow.
            
            val rawNonce = UUID.randomUUID().toString()
            val bytes = rawNonce.toByteArray()
            val md = MessageDigest.getInstance("SHA-256")
            val digest = md.digest(bytes)
            val hashedNonce = digest.fold("") { str, it -> str + "%02x".format(it) }

            // Assuming a placeholder client ID for compilation. 
            // The user must provide the real web client id in strings.xml: R.string.default_web_client_id
            val clientId = context.getString(context.resources.getIdentifier("default_web_client_id", "string", context.packageName))

            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(clientId)
                .setNonce(hashedNonce)
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            val result = credentialManager.getCredential(context, request)
            handleSignIn(result)
        } catch (e: Exception) {
            // For the sake of demonstration if Google Sign-In isn't fully configured in the console,
            // we will simulate an admin/user login fallback in the UI layer.
            Result.failure(e)
        }
    }

    private suspend fun handleSignIn(result: GetCredentialResponse): Result<String> {
        val credential = result.credential
        if (credential is GoogleIdTokenCredential) {
            val idToken = credential.idToken
            val firebaseCredential = GoogleAuthProvider.getCredential(idToken, null)
            if (auth == null) return Result.failure(Exception("Firebase Auth not initialized"))
            val authResult = auth?.signInWithCredential(firebaseCredential)?.await()
            return Result.success(authResult?.user?.uid ?: "")
        }
        return Result.failure(Exception("Not a Google ID token"))
    }

    fun signOut() {
        auth?.signOut()
    }
}
