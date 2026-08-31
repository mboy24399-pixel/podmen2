package com.example.ui.screens

import android.app.Activity
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.domain.models.Track
import com.example.presentation.AppViewModel
import com.example.ui.components.accentGradientBackground
import com.example.ui.components.skeuomorphicButton
import com.example.ui.components.skeuomorphicPanel
import com.razorpay.Checkout
import org.json.JSONObject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserPanelScreen(viewModel: AppViewModel, onLogout: () -> Unit) {
    val context = LocalContext.current
    val currentUser by viewModel.currentUser.collectAsState()
    val tracks by viewModel.tracks.collectAsState()
    val error by viewModel.error.collectAsState()

    LaunchedEffect(error) {
        if (error != null) {
            Toast.makeText(context, error, Toast.LENGTH_SHORT).show()
            viewModel.clearError()
        }
    }

    var selectedCategory by remember { mutableStateOf("all") }
    val filteredTracks = tracks.filter { track -> 
        when (selectedCategory) {
            "all" -> true
            "favorites" -> currentUser?.favoriteTrackIds?.contains(track.id) == true
            else -> track.type == selectedCategory
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("MusicPod Pro", color = MaterialTheme.colorScheme.primary) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
                actions = {
                    IconButton(onClick = {
                        viewModel.logout()
                        onLogout()
                    }) {
                        Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = "Logout", tint = MaterialTheme.colorScheme.onBackground)
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.background) {
                NavigationBarItem(
                    selected = true,
                    onClick = { },
                    icon = { Icon(Icons.Default.PlayArrow, contentDescription = "Home") },
                    label = { Text("Home") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { },
                    icon = { Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = "Explore") },
                    label = { Text("Explore") }
                )
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).fillMaxSize()
        ) {
            // Subscription Status Banner
            if (currentUser != null) {
                val hasSub = currentUser!!.hasValidSubscription()
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .accentGradientBackground()
                        .padding(24.dp)
                ) {
                    Column(horizontalAlignment = Alignment.Start) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "ULTRA PRO MAX", 
                                color = Color.White, 
                                fontSize = 10.sp, 
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.background(Color.White.copy(alpha = 0.2f), CircleShape).padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                            Text("Razorpay Verified", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                        }
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        if (hasSub) {
                            Text("PRO ACCESS ACTIVE", color = Color.White, fontWeight = FontWeight.Black, fontSize = 24.sp)
                            Text("Unlimited Podcasts & Music.", color = Color.White.copy(alpha = 0.9f), fontSize = 12.sp)
                        } else {
                            Text("TRIAL EXPIRED", color = Color.White, fontWeight = FontWeight.Black, fontSize = 24.sp)
                            Row(modifier = Modifier.padding(top = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = { startRazorpayPayment(context as Activity, viewModel, "monthly") },
                                    modifier = Modifier.weight(1f).skeuomorphicButton(),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color.White)
                                ) {
                                    Text("MONTHLY ₹99", color = Color(0xFF6E8EFB), fontWeight = FontWeight.Bold, fontSize = 10.sp)
                                }
                                Button(
                                    onClick = { startRazorpayPayment(context as Activity, viewModel, "yearly") },
                                    modifier = Modifier.weight(1f).skeuomorphicButton(),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color.White)
                                ) {
                                    Text("YEARLY ₹999", color = Color(0xFF6E8EFB), fontWeight = FontWeight.Bold, fontSize = 10.sp)
                                }
                            }
                        }
                    }
                }
            }

            // Category Selector
            Row(modifier = Modifier.padding(horizontal = 16.dp).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = { selectedCategory = if (selectedCategory == "music") "all" else "music" },
                    modifier = Modifier.weight(1f).skeuomorphicButton(isPressed = selectedCategory == "music"),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent)
                ) {
                    Text("Songs", color = if (selectedCategory == "music") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onBackground)
                }
                Button(
                    onClick = { selectedCategory = if (selectedCategory == "podcast") "all" else "podcast" },
                    modifier = Modifier.weight(1f).skeuomorphicButton(isPressed = selectedCategory == "podcast"),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent)
                ) {
                    Text("Podcasts", color = if (selectedCategory == "podcast") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onBackground)
                }
                Button(
                    onClick = { selectedCategory = if (selectedCategory == "favorites") "all" else "favorites" },
                    modifier = Modifier.weight(1f).skeuomorphicButton(isPressed = selectedCategory == "favorites"),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                    contentPadding = PaddingValues(4.dp)
                ) {
                    Text("Favorites", color = if (selectedCategory == "favorites") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onBackground)
                }
            }

            Text(
                "Discover Professional Audio", 
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = MaterialTheme.colorScheme.onBackground
            )

            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredTracks) { track ->
                    val isFavorite = currentUser?.favoriteTrackIds?.contains(track.id) == true
                    UserTrackItem(
                        track = track, 
                        isFavorite = isFavorite,
                        onClick = { viewModel.playTrack(track) },
                        onToggleFavorite = { viewModel.toggleFavorite(track.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun UserTrackItem(track: Track, isFavorite: Boolean, onClick: () -> Unit, onToggleFavorite: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .skeuomorphicPanel()
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        AsyncImage(
            model = track.imageUrl.ifEmpty { "https://picsum.photos/200" },
            contentDescription = "Cover",
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(64.dp)
                .clip(CircleShape)
                .background(Color.DarkGray)
        )
        
        Spacer(modifier = Modifier.width(16.dp))
        
        Column(modifier = Modifier.weight(1f)) {
            Text(track.title, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Text(track.description, maxLines = 1, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f), fontSize = 12.sp)
            Text(track.type.uppercase(), color = MaterialTheme.colorScheme.primary, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
        
        IconButton(onClick = onToggleFavorite) {
            Icon(
                imageVector = if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                contentDescription = "Favorite",
                tint = if (isFavorite) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onBackground
            )
        }
        
        Icon(
            imageVector = Icons.Default.PlayArrow,
            contentDescription = "Play",
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(32.dp).padding(start = 8.dp)
        )
    }
}

private fun startRazorpayPayment(activity: Activity, viewModel: AppViewModel, planType: String) {
    val checkout = Checkout()
    checkout.setKeyID("rzp_test_YourKeyIdHere")
    
    try {
        val options = JSONObject()
        options.put("name", "MusicPod Pro")
        options.put("description", "Professional Subscription (${planType.uppercase()})")
        options.put("image", "https://s3.amazonaws.com/rzp-mobile/images/rzp.jpg")
        options.put("theme.color", "#6E8EFB")
        options.put("currency", "INR")
        options.put("amount", if (planType == "yearly") "99900" else "9900")
        
        val retryObj = JSONObject()
        retryObj.put("enabled", true)
        retryObj.put("max_count", 4)
        options.put("retry", retryObj)

        checkout.open(activity, options)
    } catch (e: Exception) {
        Toast.makeText(activity, "Error in payment: ${e.message}", Toast.LENGTH_LONG).show()
    }
}
