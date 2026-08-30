package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.domain.models.Track
import com.example.presentation.AppViewModel
import com.example.ui.components.skeuomorphicButton
import com.example.ui.components.skeuomorphicPanel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminPanelScreen(viewModel: AppViewModel, onLogout: () -> Unit) {
    val tracks by viewModel.tracks.collectAsState()
    
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var imageUrl by remember { mutableStateOf("") }
    var audioUrl by remember { mutableStateOf("") }
    var isPodcast by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Admin Panel (Professional)") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    titleContentColor = MaterialTheme.colorScheme.primary
                ),
                actions = {
                    IconButton(onClick = {
                        viewModel.logout()
                        onLogout()
                    }) {
                        Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = "Logout")
                    }
                }
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).padding(16.dp).fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth().skeuomorphicPanel().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("Add New Track/Podcast", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
                
                OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Title") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = imageUrl, onValueChange = { imageUrl = it }, label = { Text("Image URL") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = audioUrl, onValueChange = { audioUrl = it }, label = { Text("Audio URL (MP3/Stream)") }, modifier = Modifier.fillMaxWidth())
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Switch(checked = isPodcast, onCheckedChange = { isPodcast = it })
                    Spacer(Modifier.width(8.dp))
                    Text(if (isPodcast) "Type: Podcast" else "Type: Music", color = MaterialTheme.colorScheme.onBackground)
                }

                Button(
                    onClick = {
                        if (title.isNotBlank() && audioUrl.isNotBlank()) {
                            viewModel.addTrack(title, description, imageUrl, audioUrl, if (isPodcast) "podcast" else "music")
                            title = ""
                            description = ""
                            imageUrl = ""
                            audioUrl = ""
                        }
                    },
                    modifier = Modifier.fillMaxWidth().skeuomorphicButton(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent)
                ) {
                    Text("Publish to Professional Server")
                }
            }

            Text("Existing Tracks", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.secondary)
            
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(tracks) { track ->
                    AdminTrackItem(track = track, onDelete = { viewModel.deleteTrack(track.id) })
                }
            }
        }
    }
}

@Composable
fun AdminTrackItem(track: Track, onDelete: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().skeuomorphicPanel().padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(track.title, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Text(track.type.uppercase(), color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodySmall)
        }
        IconButton(onClick = onDelete) {
            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
        }
    }
}
