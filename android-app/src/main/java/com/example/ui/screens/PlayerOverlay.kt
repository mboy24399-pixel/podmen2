package com.example.ui.screens

import android.content.ComponentName
import android.net.Uri
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import coil.compose.AsyncImage
import com.example.domain.models.Track
import com.example.presentation.AppViewModel
import com.example.service.PlaybackService
import com.example.ui.components.skeuomorphicButton
import com.example.ui.components.skeuomorphicPanel
import com.google.common.util.concurrent.ListenableFuture
import kotlinx.coroutines.delay

@OptIn(UnstableApi::class)
@Composable
fun PlayerOverlay(viewModel: AppViewModel) {
    val context = LocalContext.current
    val currentTrack by viewModel.currentTrack.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()
    
    var player by remember { mutableStateOf<Player?>(null) }
    var mediaControllerFuture by remember { mutableStateOf<ListenableFuture<MediaController>?>(null) }
    
    var isPlaying by remember { mutableStateOf(false) }
    var currentPosition by remember { mutableStateOf(0L) }
    var duration by remember { mutableStateOf(0L) }

    LaunchedEffect(Unit) {
        val sessionToken = SessionToken(context, ComponentName(context, PlaybackService::class.java))
        val future = MediaController.Builder(context, sessionToken).buildAsync()
        mediaControllerFuture = future
        future.addListener({
            val controller = future.get()
            player = controller
            controller.addListener(object : Player.Listener {
                override fun onIsPlayingChanged(playing: Boolean) {
                    isPlaying = playing
                }
            })
        }, ContextCompat.getMainExecutor(context))
    }

    DisposableEffect(Unit) {
        onDispose {
            mediaControllerFuture?.let { MediaController.releaseFuture(it) }
        }
    }

    LaunchedEffect(currentTrack, player) {
        if (currentTrack != null && currentTrack!!.audioUrl.isNotEmpty() && player != null) {
            val metadata = MediaMetadata.Builder()
                .setTitle(currentTrack!!.title)
                .setArtist(currentTrack!!.description)
                .setArtworkUri(Uri.parse(currentTrack!!.imageUrl.ifEmpty { "https://picsum.photos/400" }))
                .build()
            
            val mediaItem = MediaItem.Builder()
                .setMediaId(currentTrack!!.id)
                .setUri(Uri.parse(currentTrack!!.audioUrl))
                .setMediaMetadata(metadata)
                .build()
            
            // Avoid restarting if it's the same track already playing
            val currentMediaId = player?.currentMediaItem?.mediaId
            if (currentMediaId != currentTrack!!.id) {
                player?.setMediaItem(mediaItem)
                player?.prepare()
                player?.play()
                isPlaying = true
            }
        } else if (currentTrack == null || currentTrack!!.audioUrl.isEmpty()) {
            player?.stop()
            isPlaying = false
        }
    }

    LaunchedEffect(isPlaying, player) {
        while (isPlaying) {
            currentPosition = player?.currentPosition ?: 0L
            duration = player?.duration?.takeIf { it > 0 } ?: 100L
            delay(1000L)
        }
    }

    if (currentTrack != null) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background.copy(alpha = 0.95f))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .skeuomorphicPanel()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Professional Player", 
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                    Row {
                        val isFavorite = currentUser?.favoriteTrackIds?.contains(currentTrack!!.id) == true
                        IconButton(onClick = { viewModel.toggleFavorite(currentTrack!!.id) }) {
                            Icon(
                                imageVector = if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "Favorite",
                                tint = if (isFavorite) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onBackground
                            )
                        }
                        IconButton(onClick = { viewModel.playTrack(Track()) /* clear track */ }) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onBackground)
                        }
                    }
                }

                AsyncImage(
                    model = currentTrack!!.imageUrl.ifEmpty { "https://picsum.photos/400" },
                    contentDescription = "Cover",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(200.dp)
                        .skeuomorphicPanel(100.dp) // applying panel style to make it look like a CD/dial
                        .clip(CircleShape)
                )

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        currentTrack!!.title, 
                        fontSize = 24.sp, 
                        fontWeight = FontWeight.Bold, 
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        currentTrack!!.description, 
                        fontSize = 14.sp, 
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
                    )
                }

                // Seek Bar
                Column(modifier = Modifier.fillMaxWidth()) {
                    Slider(
                        value = if (duration > 0) currentPosition.toFloat() / duration.toFloat() else 0f,
                        onValueChange = { percent ->
                            val newPos = (percent * duration).toLong()
                            player?.seekTo(newPos)
                            currentPosition = newPos
                        },
                        colors = SliderDefaults.colors(
                            thumbColor = MaterialTheme.colorScheme.primary,
                            activeTrackColor = MaterialTheme.colorScheme.secondary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(formatTime(currentPosition), fontSize = 10.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f))
                        Text(formatTime(duration), fontSize = 10.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f))
                    }
                }

                // Custom Skeuomorphic Controls
                Row(
                    horizontalArrangement = Arrangement.spacedBy(24.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { player?.seekTo(0L) },
                        modifier = Modifier.size(56.dp).skeuomorphicButton(28.dp)
                    ) {
                        Icon(Icons.Default.SkipPrevious, contentDescription = "Previous", tint = MaterialTheme.colorScheme.onBackground)
                    }

                    IconButton(
                        onClick = {
                            if (isPlaying) {
                                player?.pause()
                            } else {
                                player?.play()
                            }
                            isPlaying = !isPlaying
                        },
                        modifier = Modifier
                            .size(80.dp)
                            .skeuomorphicButton(40.dp)
                    ) {
                        Icon(
                            imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = "Play/Pause",
                            tint = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.size(48.dp)
                        )
                    }

                    IconButton(
                        onClick = { /* Handle Next */ },
                        modifier = Modifier.size(56.dp).skeuomorphicButton(28.dp)
                    ) {
                        Icon(Icons.Default.SkipNext, contentDescription = "Next", tint = MaterialTheme.colorScheme.onBackground)
                    }
                }
            }
        }
    }
}

private fun formatTime(ms: Long): String {
    if (ms <= 0) return "0:00"
    val totalSeconds = ms / 1000
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return String.format("%d:%02d", minutes, seconds)
}
