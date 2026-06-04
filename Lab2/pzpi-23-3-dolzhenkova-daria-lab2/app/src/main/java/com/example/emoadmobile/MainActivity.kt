package com.example.emoadmobile

import android.graphics.Bitmap
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.gson.annotations.SerializedName
import com.google.zxing.BarcodeFormat
import com.journeyapps.barcodescanner.BarcodeEncoder
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val retrofit = Retrofit.Builder()
            .baseUrl("https://fast-zebras-shave.loca.lt/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        val apiService = retrofit.create(EmoAdApiService::class.java)
        val adminApiService = retrofit.create(AdminApiService::class.java)

        setContent {
            MaterialTheme {
                var currentScreen by remember { mutableStateOf("main") }

                if (currentScreen == "main") {
                    MainScreen(
                        apiService = apiService,
                        onNavigateToAdmin = { currentScreen = "admin" }
                    )
                } else {
                    AdminScreen(
                        adminApiService = adminApiService,
                        onBackToMenu = { currentScreen = "main" }
                    )
                }
            }
        }
    }
}

@Composable
fun MainScreen(apiService: EmoAdApiService, onNavigateToAdmin: () -> Unit) {
    val context = LocalContext.current
    val configuration = LocalConfiguration.current

    val isUk = configuration.locales[0].language == "uk"

    var slogan by remember {
        mutableStateOf(if (isUk) "Оберіть емоцію, щоб отримати пропозицію" else "Select an emotion to get a proposal")
    }
    var qrBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var showDialog by remember { mutableStateOf(false) }
    var pinCode by remember { mutableStateOf("") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF1EAFF))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = stringResource(R.string.app_title),
                    fontSize = 24.sp,
                    modifier = Modifier.padding(top = 20.dp, bottom = 40.dp)
                )

                Column(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Button(
                            onClick = { sendEmotion("happy", apiService, isUk, context) { s, b -> slogan = s; qrBitmap = b } },
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(vertical = 16.dp)
                        ) {
                            Text(stringResource(R.string.btn_happy), fontSize = 18.sp)
                        }
                        Button(
                            onClick = { sendEmotion("sad", apiService, isUk, context) { s, b -> slogan = s; qrBitmap = b } },
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(vertical = 16.dp)
                        ) {
                            Text(stringResource(R.string.btn_sad), fontSize = 18.sp)
                        }
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Button(
                            onClick = { sendEmotion("tired", apiService, isUk, context) { s, b -> slogan = s; qrBitmap = b } },
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(vertical = 16.dp)
                        ) {
                            Text(stringResource(R.string.btn_tired), fontSize = 18.sp)
                        }
                        Button(
                            onClick = { sendEmotion("angry", apiService, isUk, context) { s, b -> slogan = s; qrBitmap = b } },
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(vertical = 16.dp)
                        ) {
                            Text(stringResource(R.string.btn_angry), fontSize = 18.sp)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(40.dp))
                HorizontalDivider(thickness = 2.dp, color = MaterialTheme.colorScheme.outlineVariant)
                Spacer(modifier = Modifier.height(30.dp))

                Text(slogan, fontSize = 18.sp, textAlign = TextAlign.Center, modifier = Modifier.padding(horizontal = 10.dp))

                Spacer(modifier = Modifier.height(30.dp))

                qrBitmap?.let {
                    Image(bitmap = it.asImageBitmap(), contentDescription = "QR Code", modifier = Modifier.size(220.dp))
                }
            }

            Button(
                onClick = { showDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, contentColor = Color.DarkGray),
                modifier = Modifier.padding(bottom = 10.dp)
            ) {
                Text(stringResource(R.string.btn_admin), fontSize = 16.sp)
            }
        }
    }

    if (showDialog) {
        val wrongPasswordMessage = if (isUk) "Невірний пароль!" else "Incorrect password!"

        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text(stringResource(R.string.admin_title)) },
            text = {
                OutlinedTextField(
                    value = pinCode,
                    onValueChange = { pinCode = it },
                    label = { Text(stringResource(R.string.admin_label)) },
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
            },
            confirmButton = {
                Button(onClick = {
                    if (pinCode == "1234") {
                        showDialog = false
                        pinCode = ""
                        onNavigateToAdmin()
                    } else {
                        Toast.makeText(context, wrongPasswordMessage, Toast.LENGTH_SHORT).show()
                    }
                }) { Text(stringResource(R.string.btn_login)) }
            },
            dismissButton = { Button(onClick = { showDialog = false; pinCode = "" }) { Text(stringResource(R.string.btn_cancel)) } }
        )
    }
}

@Composable
fun AdminScreen(adminApiService: AdminApiService, onBackToMenu: () -> Unit) {
    val context = LocalContext.current
    val configuration = LocalConfiguration.current
    val isUk = configuration.locales[0].language == "uk"

    var emotion by remember { mutableStateOf("") }
    var promoCode by remember { mutableStateOf("") }
    var slogan by remember { mutableStateOf("") }

    var adsList by remember { mutableStateOf(listOf<AdItem>()) }
    var editingAd by remember { mutableStateOf<AdItem?>(null) }

    val errorRefresh = if (isUk) "Помилка оновлення таблиці" else "Error updating table"
    val emptyFields = if (isUk) "Заповніть усі поля!" else "Fill in all fields!"
    val successAdd = if (isUk) "Рекламу успішно додано!" else "Ad successfully added!"
    val errorServer = if (isUk) "Помилка сервера" else "Server error"
    val errorConnection = if (isUk) "Помилка зв'язку" else "Connection error"
    val successDelete = if (isUk) "Видалено з бази" else "Deleted from database"
    val successUpdate = if (isUk) "Оновлено успішно!" else "Updated successfully!"

    fun refreshAds() {
        adminApiService.getAllAds().enqueue(object : Callback<List<AdItem>> {
            override fun onResponse(call: Call<List<AdItem>>, response: Response<List<AdItem>>) {
                if (response.isSuccessful && response.body() != null) {
                    adsList = response.body()!!
                }
            }
            override fun onFailure(call: Call<List<AdItem>>, t: Throwable) {
                Toast.makeText(context, errorRefresh, Toast.LENGTH_SHORT).show()
            }
        })
    }

    LaunchedEffect(Unit) { refreshAds() }

    Column(modifier = Modifier
        .fillMaxSize()
        .padding(15.dp)) {
        Text(stringResource(R.string.admin_screen_title), fontSize = 20.sp, style = MaterialTheme.typography.titleMedium,
            modifier = Modifier.padding(bottom = 10.dp)
        )

        OutlinedTextField(
            value = emotion,
            onValueChange = { emotion = it },
            label = { Text(if (isUk) "Емоція (happy, sad, tired, angry)" else "Emotion (happy, sad, tired, angry)") },
            modifier = Modifier.fillMaxWidth().padding(bottom = 5.dp)
        )
        OutlinedTextField(
            value = promoCode,
            onValueChange = { promoCode = it },
            label = { Text(if (isUk) "Промокод" else "Promo code") },
            modifier = Modifier.fillMaxWidth().padding(bottom = 5.dp)
        )
        OutlinedTextField(
            value = slogan,
            onValueChange = { slogan = it },
            label = { Text(if (isUk) "Слоган" else "Slogan") },
            modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp)
        )

        Button(
            onClick = {
                if (emotion.isBlank() || promoCode.isBlank() || slogan.isBlank()) {
                    Toast.makeText(context, emptyFields, Toast.LENGTH_SHORT).show()
                    return@Button
                }
                val request = NewAdRequest(emotion.trim().lowercase(), promoCode.trim(), slogan.trim())
                adminApiService.addNewAd(request).enqueue(object : Callback<SimpleResponse> {
                    override fun onResponse(call: Call<SimpleResponse>, response: Response<SimpleResponse>) {
                        if (response.isSuccessful) {
                            Toast.makeText(context, successAdd, Toast.LENGTH_SHORT).show()
                            emotion = ""; promoCode = ""; slogan = ""
                            refreshAds()
                        } else {
                            Toast.makeText(context, "$errorServer: ${response.code()}", Toast.LENGTH_SHORT).show()
                        }
                    }
                    override fun onFailure(call: Call<SimpleResponse>, t: Throwable) {
                        Toast.makeText(context, "$errorConnection: ${t.message}", Toast.LENGTH_SHORT).show()
                    }
                })
            },
            modifier = Modifier.fillMaxWidth()
        ) { Text(if (isUk) "Додати нову рекламу" else "Add new advertisement") }

        Spacer(modifier = Modifier.height(15.dp))
        Text(if (isUk) "База даних реклами:" else "Ad database:", fontSize = 14.sp, color = Color.Gray)
        Spacer(modifier = Modifier.height(5.dp))

        Box(modifier = Modifier
            .weight(1f)
            .border(1.dp, Color.LightGray)
            .background(Color(0xFFFAFAFA))) {
            LazyColumn(modifier = Modifier.fillMaxSize()) {
                item {
                    Row(modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.LightGray)
                        .padding(8.dp)) {
                        Text(if (isUk) "ID/Емоція" else "ID/Emotion", modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                        Text(if (isUk) "Промокод/Слоган" else "Promo/Slogan", modifier = Modifier.weight(2f), style = MaterialTheme.typography.bodyMedium)
                        Text(if (isUk) "Дії" else "Actions", modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center)
                    }
                }
                items(adsList) { ad ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("#${ad.id}", fontSize = 11.sp, color = Color.Gray)
                            Text(ad.emotion, fontSize = 14.sp, style = MaterialTheme.typography.bodyLarge)
                        }
                        Column(modifier = Modifier.weight(2f)) {
                            Text(ad.promo_code, fontSize = 14.sp, style = MaterialTheme.typography.bodyLarge)
                            Text(ad.slogan, fontSize = 12.sp, color = Color.DarkGray)
                        }
                        Row(modifier = Modifier.weight(1f), horizontalArrangement = Arrangement.End) {
                            IconButton(onClick = { editingAd = ad }) {
                                Icon(Icons.Default.Edit, contentDescription = "Edit", tint = Color.Blue)
                            }
                            IconButton(onClick = {
                                adminApiService.deleteAd(ad.id).enqueue(object : Callback<SimpleResponse> {
                                    override fun onResponse(call: Call<SimpleResponse>, response: Response<SimpleResponse>) {
                                        if (response.isSuccessful) {
                                            Toast.makeText(context, successDelete, Toast.LENGTH_SHORT).show()
                                            refreshAds()
                                        }
                                    }
                                    override fun onFailure(call: Call<SimpleResponse>, t: Throwable) {}
                                })
                            }) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red)
                            }
                        }
                    }
                    HorizontalDivider(color = Color.LightGray, thickness = 0.5.dp)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
        Button(
            onClick = onBackToMenu,
            colors = ButtonDefaults.buttonColors(containerColor = Color.Gray),
            modifier = Modifier.fillMaxWidth()
        ) { Text(stringResource(R.string.btn_back)) }
    }

    if (editingAd != null) {
        val ad = editingAd!!
        var editSlogan by remember { mutableStateOf(ad.slogan) }
        var editPromo by remember { mutableStateOf(ad.promo_code) }

        AlertDialog(
            onDismissRequest = { editingAd = null },
            title = { Text(if (isUk) "Редагування запису #${ad.id}" else "Editing record #${ad.id}") },
            text = {
                Column {
                    OutlinedTextField(value = editPromo, onValueChange = { editPromo = it }, label = { Text(if (isUk) "Промокод" else "Promo code") }, modifier = Modifier.padding(bottom = 5.dp))
                    OutlinedTextField(value = editSlogan, onValueChange = { editSlogan = it }, label = { Text(if (isUk) "Слоган" else "Slogan") })
                }
            },
            confirmButton = {
                Button(onClick = {
                    val request = UpdateAdRequest(editPromo.trim(), editSlogan.trim())
                    adminApiService.updateAd(ad.id, request).enqueue(object : Callback<SimpleResponse> {
                        override fun onResponse(call: Call<SimpleResponse>, response: Response<SimpleResponse>) {
                            if (response.isSuccessful) {
                                Toast.makeText(context, successUpdate, Toast.LENGTH_SHORT).show()
                                editingAd = null
                                refreshAds()
                            }
                        }
                        override fun onFailure(call: Call<SimpleResponse>, t: Throwable) {}
                    })
                }) { Text(if (isUk) "Зберегти" else "Save") }
            },
            dismissButton = { Button(onClick = { editingAd = null }) { Text(stringResource(R.string.btn_cancel)) } }
        )
    }
}

private fun sendEmotion(emotion: String, apiService: EmoAdApiService, isUk: Boolean, context: android.content.Context, onResult: (String, Bitmap?) -> Unit) {
    val adNotFound = if (isUk) "Рекламу не знайдено" else "Ad not found"
    val connectionError = if (isUk) "Помилка зв'язку з сервером" else "Server connection error"

    apiService.getAdByEmotion(EmotionRequest(emotion)).enqueue(object : Callback<AdResponse> {
        override fun onResponse(call: Call<AdResponse>, response: Response<AdResponse>) {
            if (response.isSuccessful && response.body() != null) {
                val ad = response.body()!!
                try {
                    val encoder = BarcodeEncoder()
                    val bitmap = encoder.encodeBitmap(ad.promo_code, BarcodeFormat.QR_CODE, 400, 400)
                    onResult(ad.slogan, bitmap)
                } catch (e: Exception) { e.printStackTrace() }
            } else {
                Toast.makeText(context, adNotFound, Toast.LENGTH_SHORT).show()
            }
        }
        override fun onFailure(call: Call<AdResponse>, t: Throwable) {
            Toast.makeText(context, connectionError, Toast.LENGTH_SHORT).show()
        }
    })
}

data class SimpleResponse(val message: String)

data class EmotionRequest(
    val emotion: String,
    @SerializedName("client_type") val client_type: String = "mobile"
)

data class AdResponse(
    @SerializedName("promo_code") val promo_code: String,
    val slogan: String
)

data class NewAdRequest(
    val emotion: String,
    @SerializedName("promo_code") val promo_code: String,
    val slogan: String
)

data class UpdateAdRequest(
    @SerializedName("promo_code") val promo_code: String,
    val slogan: String
)

data class AdItem(
    val id: Int,
    val emotion: String,
    @SerializedName("promo_code") val promo_code: String,
    val slogan: String
)

interface EmoAdApiService {
    @POST("api/get_ad")
    fun getAdByEmotion(@Body request: EmotionRequest): Call<AdResponse>
}

interface AdminApiService {
    @GET("api/admin/ads")
    fun getAllAds(): Call<List<AdItem>>

    @POST("api/admin/add_ad")
    fun addNewAd(@Body request: NewAdRequest): Call<SimpleResponse>

    @PUT("api/admin/update_ad/{id}")
    fun updateAd(@Path("id") id: Int, @Body request: UpdateAdRequest): Call<SimpleResponse>

    @DELETE("api/admin/delete_ad/{id}")
    fun deleteAd(@Path("id") id: Int): Call<SimpleResponse>
}