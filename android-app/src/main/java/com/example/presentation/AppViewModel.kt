package com.example.presentation

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.AuthRepository
import com.example.data.FirestoreRepository
import com.example.domain.models.Track
import com.example.domain.models.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AppViewModel : ViewModel() {
    private val authRepo = AuthRepository()
    private val dbRepo = FirestoreRepository()

    private val _currentUser = MutableStateFlow<UserProfile?>(null)
    val currentUser: StateFlow<UserProfile?> = _currentUser.asStateFlow()

    private val _tracks = MutableStateFlow<List<Track>>(emptyList())
    val tracks: StateFlow<List<Track>> = _tracks.asStateFlow()

    private val _currentTrack = MutableStateFlow<Track?>(null)
    val currentTrack: StateFlow<Track?> = _currentTrack.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        checkAuthStatus()
        fetchTracks()
    }

    private fun checkAuthStatus() {
        val uid = authRepo.getCurrentUserId()
        if (uid != null) {
            viewModelScope.launch {
                val profile = dbRepo.getUserProfile(uid)
                if (profile != null) {
                    _currentUser.value = profile
                } else {
                    // Create default user profile
                    val newProfile = UserProfile(
                        uid = uid,
                        email = authRepo.getCurrentUserEmail() ?: "",
                        role = "user" // Default to user. Change in DB for admin.
                    )
                    dbRepo.saveUserProfile(newProfile)
                    _currentUser.value = newProfile
                }
            }
        }
    }

    fun login(context: Context, onResult: (Boolean) -> Unit) {
        _isLoading.value = true
        _error.value = null
        viewModelScope.launch {
            val result = authRepo.signInWithGoogle(context)
            if (result.isSuccess) {
                checkAuthStatus()
                onResult(true)
            } else {
                _error.value = result.exceptionOrNull()?.message ?: "Login failed"
                onResult(false)
            }
            _isLoading.value = false
        }
    }
    
    // Developer fallback login if Google Sign-In isn't configured in Console
    fun fallbackDevLogin(role: String) {
        val mockProfile = UserProfile(
            uid = "mock_${System.currentTimeMillis()}",
            email = "dev@musicpod.com",
            role = role,
            isSubscribed = true
        )
        _currentUser.value = mockProfile
        
        if (_tracks.value.isEmpty()) {
            _tracks.value = listOf(
                Track("1", "Acoustic Dreams", "Podcast • Episode 42 • 1.2M Listens", "https://picsum.photos/400?1", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "podcast"),
                Track("2", "Midnight Jazz Sessions", "Smooth jazz for late night coding", "https://picsum.photos/400?2", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", "music"),
                Track("3", "Tech Talk Weekly", "Latest in AI & Android Dev", "https://picsum.photos/400?3", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", "podcast")
            )
        }
    }

    fun logout() {
        authRepo.signOut()
        _currentUser.value = null
    }

    fun fetchTracks() {
        viewModelScope.launch {
            _tracks.value = dbRepo.getTracks()
        }
    }

    fun addTrack(title: String, desc: String, image: String, audio: String, type: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val track = Track(
                title = title,
                description = desc,
                imageUrl = image,
                audioUrl = audio,
                type = type
            )
            if (dbRepo.addTrack(track)) {
                fetchTracks()
            } else {
                _error.value = "Failed to add track"
            }
            _isLoading.value = false
        }
    }

    fun deleteTrack(trackId: String) {
        viewModelScope.launch {
            if (dbRepo.deleteTrack(trackId)) {
                fetchTracks()
            }
        }
    }

    fun playTrack(track: Track) {
        // Needs subscription check
        val user = _currentUser.value
        if (user?.role == "admin" || user?.hasValidSubscription() == true) {
            _currentTrack.value = track
        } else {
            _error.value = "Subscription required to play."
        }
    }
    
    fun clearError() {
        _error.value = null
    }
    
    fun toggleFavorite(trackId: String) {
        val user = _currentUser.value ?: return
        val currentFavorites = user.favoriteTrackIds.toMutableList()
        if (currentFavorites.contains(trackId)) {
            currentFavorites.remove(trackId)
        } else {
            currentFavorites.add(trackId)
        }
        val updatedUser = user.copy(favoriteTrackIds = currentFavorites)
        _currentUser.value = updatedUser
        
        viewModelScope.launch {
            dbRepo.saveUserProfile(updatedUser)
        }
    }

    fun upgradeSubscription() {
        val user = _currentUser.value ?: return
        val expiry = System.currentTimeMillis() + 30L * 24 * 60 * 60 * 1000 // 30 days
        val updatedUser = user.copy(isSubscribed = true, subscriptionExpiry = expiry)
        viewModelScope.launch {
            _isLoading.value = true
            if (dbRepo.saveUserProfile(updatedUser)) {
                _currentUser.value = updatedUser
            } else {
                _error.value = "Failed to update subscription"
            }
            _isLoading.value = false
        }
    }
}
