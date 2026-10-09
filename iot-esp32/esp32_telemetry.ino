#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define POT_PIN 36 // VP pin simulating vehicle speed

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Wi-Fi Credentials for Wokwi or local router
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Render / Vercel or local Backend URL
const char* serverUrl = "http://YOUR_BACKEND_HOST/api/traffic/telemetry";

void setup() {
  Serial.begin(115200);
  pinMode(POT_PIN, INPUT);

  // Initialize OLED Display
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 10);
  display.println("Rwanda Traffic System");
  display.println("Initializing ESP32...");
  display.display();

  // Connect Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  // Read potentiometer value to simulate speed (0 to 120 km/h)
  int rawVal = analogRead(POT_PIN);
  int simulatedSpeedKmh = map(rawVal, 0, 4095, 0, 120);

  // Update OLED Vehicle Interface
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("RW-TRAFFIC NAV UNIT");
  display.println("--------------------");
  display.print("Speed: ");
  display.print(simulatedSpeedKmh);
  display.println(" km/h");
  
  if (simulatedSpeedKmh < 15) {
    display.println("Status: HEAVY CONGESTION");
  } else {
    display.println("Status: CLEAR ROAD");
  }
  display.display();

  // Send Telemetry to Node.js Backend over HTTP POST
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\"deviceId\":\"ESP32_KIGALI_01\",\"latitude\":-1.9325,\"longitude\":30.1082,\"speedKmh\":" + String(simulatedSpeedKmh) + "}";
    
    int httpResponseCode = http.POST(jsonPayload);
    Serial.print("Telemetry POST Status: ");
    Serial.println(httpResponseCode);
    
    http.end();
  }

  delay(5000); // Send updates every 5 seconds
}