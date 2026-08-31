package com.example.data

import com.example.domain.models.Track
import com.example.domain.models.UserProfile
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class FirestoreRepository {

    private val db: FirebaseFirestore? by lazy {
        try {
            FirebaseFirestore.getInstance()
        } catch (e: Exception) {
            null
        }
    }

    // --- User Profiles ---
    suspend fun getUserProfile(uid: String): UserProfile? {
        return try {
            val snapshot = db?.collection("users")?.document(uid)?.get()?.await()
            snapshot?.toObject(UserProfile::class.java)
        } catch (e: Exception) {
            null
        }
    }

    suspend fun saveUserProfile(profile: UserProfile): Boolean {
        return try {
            db?.collection("users")?.document(profile.uid)?.set(profile)?.await()
            true
        } catch (e: Exception) {
            false
        }
    }

    // --- Tracks (Music / Podcast) ---
    suspend fun getTracks(): List<Track> {
        return try {
            val snapshot = db?.collection("tracks")?.get()?.await()
            snapshot?.toObjects(Track::class.java) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun addTrack(track: Track): Boolean {
        return try {
            if (db == null) return false
            val docRef = if (track.id.isEmpty()) db!!.collection("tracks").document() else db!!.collection("tracks").document(track.id)
            val newTrack = track.copy(id = docRef.id)
            docRef.set(newTrack).await()
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun deleteTrack(trackId: String): Boolean {
        return try {
            db?.collection("tracks")?.document(trackId)?.delete()?.await()
            true
        } catch (e: Exception) {
            false
        }
    }
}
