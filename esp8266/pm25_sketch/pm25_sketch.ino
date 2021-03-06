// script adapted from https://learn.adafruit.com/pm25-air-quality-sensor/arduino-code
// About Adafruit PM25 https://learn.adafruit.com/pm25-air-quality-sensor

#include "Adafruit_PM25AQI.h"
#include "conf.h"
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

Adafruit_PM25AQI aqi = Adafruit_PM25AQI();
SoftwareSerial pmSerial(2, 3);

// const char* ssid = "633N40_2.4"; //replace with your own wifi ssid
// const char* password = "hashbrowns"; //replace with your own //wifi ssid password const char*

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);

  Serial.println(); Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);

  /* Explicitly set the ESP8266 to be a WiFi-client, otherwise, it by default, would try to act as both a client and an access-point
     and could cause network-issues with your other WiFi-devices on your WiFi-network.
  */
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());


  Serial.println("Adafruit PMSA003I Air Quality Sensor");

  // Wait one second for sensor to boot up!
  delay(1000);

  // If using serial, initialize it and set baudrate before starting!
  // Uncomment one of the following
  //Serial1.begin(9600);
  pmSerial.begin(9600);

  // There are 3 options for connectivity!
  //if (! aqi.begin_I2C()) {      // connect to the sensor over I2C
  //if (! aqi.begin_UART(&Serial1)) { // connect to the sensor over hardware serial
  if (! aqi.begin_UART(&pmSerial)) { // connect to the sensor over software serial
    Serial.println("Could not find PM 2.5 sensor!");
    while (1) delay(10);
  }

  Serial.println("PM25 found!");
}

void loop() {
  PM25_AQI_Data data;

  if (! aqi.read(&data)) {
    Serial.println("Could not read from AQI");
    delay(500);  // try again in a bit!
    return;
  }

  Serial.println("AQI reading success");

  Serial.println();
  Serial.println(F("---------------------------------------"));
  Serial.println(F("Concentration Units (standard)"));
  Serial.println(F("---------------------------------------"));
  Serial.print(F("PM 1.0: ")); Serial.print(data.pm10_standard);
  Serial.print(F("\t\tPM 2.5: ")); Serial.print(data.pm25_standard);
  Serial.print(F("\t\tPM 10: ")); Serial.println(data.pm100_standard);

  // More granular readings:
  /*
    Serial.println(F("Concentration Units (environmental)"));
    Serial.println(F("---------------------------------------"));
    Serial.print(F("PM 1.0: ")); Serial.print(data.pm10_env);
    Serial.print(F("\t\tPM 2.5: ")); Serial.print(data.pm25_env);
    Serial.print(F("\t\tPM 10: ")); Serial.println(data.pm100_env);
    Serial.println(F("---------------------------------------"));
    Serial.print(F("Particles > 0.3um / 0.1L air:")); Serial.println(data.particles_03um);
    Serial.print(F("Particles > 0.5um / 0.1L air:")); Serial.println(data.particles_05um);
    Serial.print(F("Particles > 1.0um / 0.1L air:")); Serial.println(data.particles_10um);
    Serial.print(F("Particles > 2.5um / 0.1L air:")); Serial.println(data.particles_25um);
    Serial.print(F("Particles > 5.0um / 0.1L air:")); Serial.println(data.particles_50um);
    Serial.print(F("Particles > 10 um / 0.1L air:")); Serial.println(data.particles_100um);
    Serial.println(F("---------------------------------------"));
  */
  char pm10[100];
  char pm25[100];
  char pm100[100];

  sprintf(pm10, "[{\"name\":\"office\",\"type\":\"pm1\",\"units\":\"num\",\"value\":\"%u\"}]", data.pm10_standard);
  sprintf(pm25, "[{\"name\":\"office\",\"type\":\"pm2.5\",\"units\":\"num\",\"value\":\"%u\"}]", data.pm25_standard);
  sprintf(pm100, "[{\"name\":\"office\",\"type\":\"pm10\",\"units\":\"num\",\"value\":\"%u\"}]", data.pm100_standard);

  /* Connect to API via HTTP */

  HTTPClient http;

  /* Send PM1 */
  http.begin("http://pjwalker.net:8099/new");      //Specify request destination
  http.addHeader("Content-Type", "application/json");  //Specify content-type header

  int httpCode = http.POST(pm10);   //Send the request
  String payload = http.getString();                  //Get the response payload

  Serial.println(httpCode);   //Print HTTP return code
  Serial.println(payload);    //Print request response payload

  /* Send PM2.5 */
  http.begin("http://pjwalker.net:8099/new");      //Specify request destination
  http.addHeader("Content-Type", "application/json");  //Specify content-type header

  int httpCode2 = http.POST(pm25);   //Send the request
  String payload2 = http.getString();                  //Get the response payload

  Serial.println(httpCode2);   //Print HTTP return code
  Serial.println(payload2);    //Print request response payload

  http.end();

  /* Send PM10 */
  http.begin("http://pjwalker.net:8099/new");      //Specify request destination
  http.addHeader("Content-Type", "application/json");  //Specify content-type header

  int httpCode3 = http.POST(pm100);   //Send the request
  String payload3 = http.getString();                  //Get the response payload

  Serial.println(httpCode3);   //Print HTTP return code
  Serial.println(payload3);    //Print request response payload

  http.end();  //Close connection

  delay(5000);
}
