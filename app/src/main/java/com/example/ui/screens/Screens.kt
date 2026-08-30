package com.example.ui.screens

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object UserPanel : Screen("user_panel")
    object AdminPanel : Screen("admin_panel")
}
