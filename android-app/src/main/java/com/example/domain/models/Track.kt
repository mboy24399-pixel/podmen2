package com.example.domain.models

data class Track(
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val imageUrl: String = "",
    val audioUrl: String = "",
    val type: String = "music",
    val createdAt: Long = System.currentTimeMillis()
)
