package com.example.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.presentation.AppViewModel
import com.example.ui.components.skeuomorphicButton
import com.example.ui.components.skeuomorphicPanel

@Composable
fun LoginScreen(
    viewModel: AppViewModel,
    onNavigateToUser: () -> Unit,
    onNavigateToAdmin: () -> Unit
) {
    val context = LocalContext.current
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()

    LaunchedEffect(currentUser) {
        if (currentUser != null) {
            if (currentUser?.role == "admin") onNavigateToAdmin()
            else onNavigateToUser()
        }
    }

    Box(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .skeuomorphicPanel()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Text(
                "MusicPod Pro",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            
            Text("Professional Audio Experience", color = MaterialTheme.colorScheme.onBackground)

            if (isLoading) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            } else {
                Button(
                    onClick = { viewModel.login(context) { } },
                    modifier = Modifier.fillMaxWidth().skeuomorphicButton(),
                    colors = ButtonDefaults.buttonColors(containerColor = androidx.compose.ui.graphics.Color.Transparent)
                ) {
                    Text("Sign In with Google", color = MaterialTheme.colorScheme.onBackground)
                }

                Spacer(modifier = Modifier.height(16.dp))
                Text("Developer Fallback", fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
                
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Button(
                        onClick = { viewModel.fallbackDevLogin("user") },
                        modifier = Modifier.weight(1f).skeuomorphicButton(),
                        colors = ButtonDefaults.buttonColors(containerColor = androidx.compose.ui.graphics.Color.Transparent)
                    ) {
                        Text("Simulate User", color = MaterialTheme.colorScheme.primary)
                    }
                    Button(
                        onClick = { viewModel.fallbackDevLogin("admin") },
                        modifier = Modifier.weight(1f).skeuomorphicButton(),
                        colors = ButtonDefaults.buttonColors(containerColor = androidx.compose.ui.graphics.Color.Transparent)
                    ) {
                        Text("Simulate Admin", color = MaterialTheme.colorScheme.secondary)
                    }
                }
            }

            if (error != null) {
                Text(error!!, color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
            }
        }
    }
}
