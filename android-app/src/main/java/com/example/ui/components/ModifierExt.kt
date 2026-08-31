package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.PaintingStyle
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

fun Modifier.neumorphic(
    cornerRadius: Dp = 24.dp,
    elevation: Dp = 6.dp,
    isPressed: Boolean = false,
    backgroundColor: Color = Color(0xFFE0E5EC),
    lightShadowColor: Color = Color(0xFFFFFFFF),
    darkShadowColor: Color = Color(0xFFB8B9BE)
): Modifier = this.drawBehind {
    drawIntoCanvas { canvas ->
        val paint = Paint()
        val frameworkPaint = paint.asFrameworkPaint()
        
        if (isPressed) {
            frameworkPaint.color = backgroundColor.toArgb()
            canvas.drawRoundRect(
                0f, 0f, size.width, size.height,
                cornerRadius.toPx(), cornerRadius.toPx(), paint
            )
            
            // Simple inset simulation
            paint.style = PaintingStyle.Stroke
            paint.strokeWidth = 4.dp.toPx()
            frameworkPaint.setShadowLayer(
                elevation.toPx(),
                elevation.toPx() / 2,
                elevation.toPx() / 2,
                darkShadowColor.toArgb()
            )
            canvas.drawRoundRect(
                0f, 0f, size.width, size.height,
                cornerRadius.toPx(), cornerRadius.toPx(), paint
            )
        } else {
            frameworkPaint.color = backgroundColor.toArgb()
            
            // Light top-left shadow
            frameworkPaint.setShadowLayer(
                elevation.toPx() * 1.5f,
                -elevation.toPx() * 0.8f,
                -elevation.toPx() * 0.8f,
                lightShadowColor.toArgb()
            )
            canvas.drawRoundRect(
                0f, 0f, size.width, size.height,
                cornerRadius.toPx(), cornerRadius.toPx(), paint
            )
            
            // Dark bottom-right shadow
            frameworkPaint.setShadowLayer(
                elevation.toPx() * 1.5f,
                elevation.toPx() * 0.8f,
                elevation.toPx() * 0.8f,
                darkShadowColor.toArgb()
            )
            canvas.drawRoundRect(
                0f, 0f, size.width, size.height,
                cornerRadius.toPx(), cornerRadius.toPx(), paint
            )
        }
    }
}.background(backgroundColor, RoundedCornerShape(cornerRadius))

fun Modifier.skeuomorphicButton(
    cornerRadius: Dp = 16.dp,
    isPressed: Boolean = false
): Modifier = this.neumorphic(cornerRadius = cornerRadius, isPressed = isPressed, elevation = 4.dp)

fun Modifier.skeuomorphicPanel(
    cornerRadius: Dp = 24.dp
): Modifier = this.neumorphic(cornerRadius = cornerRadius, elevation = 6.dp)

fun Modifier.accentGradientBackground(shape: Shape = RoundedCornerShape(24.dp)): Modifier = this.background(
    brush = Brush.linearGradient(
        colors = listOf(Color(0xFF6E8EFB), Color(0xFFA777E3))
    ),
    shape = shape
)
