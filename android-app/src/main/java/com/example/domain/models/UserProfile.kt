package com.example.domain.models

data class UserProfile(
    val uid: String = "",
    val email: String = "",
    val role: String = "user",
    val isSubscribed: Boolean = false,
    val subscriptionExpiry: Long = 0L,
    val trialStartedAt: Long = System.currentTimeMillis(),
    val favoriteTrackIds: List<String> = emptyList()
) {
    fun hasValidSubscription(): Boolean {
        val now = System.currentTimeMillis()
        val trialExpiry = trialStartedAt + 7L * 24 * 60 * 60 * 1000 // 7 days in ms
        return (isSubscribed && now < subscriptionExpiry) || now < trialExpiry
    }
}
