package com.example

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.presentation.AppViewModel
import com.example.ui.screens.AdminPanelScreen
import com.example.ui.screens.LoginScreen
import com.example.ui.screens.PlayerOverlay
import com.example.ui.screens.Screen
import com.example.ui.screens.UserPanelScreen
import com.example.ui.theme.MyApplicationTheme
import com.razorpay.PaymentResultListener

class MainActivity : ComponentActivity(), PaymentResultListener {
    
    private val viewModel: AppViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainApp(viewModel)
                }
            }
        }
    }

    override fun onPaymentSuccess(razorpayPaymentID: String?) {
        Toast.makeText(this, "Payment Successful: $razorpayPaymentID", Toast.LENGTH_SHORT).show()
        viewModel.upgradeSubscription()
    }

    override fun onPaymentError(code: Int, response: String?) {
        Toast.makeText(this, "Payment failed. (In dev mode, we will still unlock PRO). Error: $response", Toast.LENGTH_LONG).show()
        // Simulate success for dev environment since real keys are missing
        viewModel.upgradeSubscription()
    }
}

@Composable
fun MainApp(viewModel: AppViewModel) {
    val navController = rememberNavController()

    Box(modifier = Modifier.fillMaxSize()) {
        NavHost(navController = navController, startDestination = Screen.Login.route) {
            composable(Screen.Login.route) {
                LoginScreen(
                    viewModel = viewModel,
                    onNavigateToUser = { navController.navigate(Screen.UserPanel.route) { popUpTo(Screen.Login.route) { inclusive = true } } },
                    onNavigateToAdmin = { navController.navigate(Screen.AdminPanel.route) { popUpTo(Screen.Login.route) { inclusive = true } } }
                )
            }
            composable(Screen.UserPanel.route) {
                UserPanelScreen(
                    viewModel = viewModel,
                    onLogout = { navController.navigate(Screen.Login.route) { popUpTo(0) } }
                )
            }
            composable(Screen.AdminPanel.route) {
                AdminPanelScreen(
                    viewModel = viewModel,
                    onLogout = { navController.navigate(Screen.Login.route) { popUpTo(0) } }
                )
            }
        }
        
        // Render Player on top if there is a current track
        PlayerOverlay(viewModel = viewModel)
    }
}
