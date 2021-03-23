// Import required libraries
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <EEPROM.h>
#include "Adafruit_PM25AQI.h"
#include <SoftwareSerial.h> // required for communication w pm2.5 sensor

ESP8266WebServer server(80);

// setup memory location for wifi credentials
int addr_ssid = 0;         // ssid index
int addr_password = 40;    // password index

// setup pm2.5 comms
Adafruit_PM25AQI aqi = Adafruit_PM25AQI();
SoftwareSerial pmSerial(2, 3);
const char API_KEY[] = "Z%jlvM8ETg7uerF5*^C";

void update_ssid(String ssid, String password, bool reset_eprom) {  
  EEPROM.begin(512);
  
  if ( reset_eprom ) {
    for (int i = 0; i < 512; i++) {
      EEPROM.write(i, 0);
    }
    EEPROM.commit();
    delay(500);
  }
 
  Serial.println("");
  Serial.print("Write WiFi SSID at address ");
  Serial.print("");
  for (int i = 0; i < ssid.length(); i++)
  {
    EEPROM.write(addr_ssid + i, ssid[i]);
    Serial.print(ssid[i]);
  }

  Serial.println("");
  Serial.print("Write WiFi Password at address ");
  Serial.print("");
  for (int i = 0; i < password.length(); i++)
  {
    EEPROM.write(addr_password + i, password[i]);
    Serial.print(password[i]);
  }

  Serial.println("");
  if (EEPROM.commit()) {
    Serial.println("Data successfully committed");
  } else {
    Serial.println("ERROR! Data commit failed");
  }
}

void read_wifi_credentials(char *ssid, char *pw) {
  EEPROM.begin(512);
  Serial.println("");
  Serial.println("Check writing");

  for (int i = 0; i < 40; i++)
  {
    ssid[i] = char(EEPROM.read(i + addr_ssid));
  }
  
  Serial.println("EEPROM SSID:");
  Serial.println(ssid);

  for (int i = 0; i < 40; i++)
  {
    pw[i] = char(EEPROM.read(i + addr_password));
  }
  
  Serial.println("EEPROM PW:");
  Serial.println(pw);
}


bool testWifi(void)
{
  int c = 0;
  Serial.println("Waiting for Wifi to connect");
  while ( c < 20 ) {
    if (WiFi.status() == WL_CONNECTED)
    {
      return true;
    }
    delay(500);
    Serial.print("*");
    c++;
  }
  Serial.println("");
  Serial.println("Connect timed out, opening AP");
  return false;
}

/**
 * HOME PAGE
 */
String serverHomePage()
{
  String htmlPage;
  htmlPage.reserve(1024);               // prevent ram fragmentation
  htmlPage = F("HTTP/1.1 200 OK\r\n"
               "Content-Type: text/html\r\n"
               "Connection: close\r\n"  // the connection will be closed after completion of the response
               "Refresh: 5\r\n"         // refresh the page automatically every 5 sec
               "\r\n"
               "<!DOCTYPE HTML>"
               "<html>"
               "Enter WIFI Credentials"
               "<form action='http://192.168.4.1/setSSID' method='POST'>"
               "<label for='ssid'>SSID:</form>"
               "<input type='text' name='ssid' placeholder='ssid'/>"
               "<label for='password'>SSID:</form>"
               "<input type='password' name='password' placeholder='password'/>"
               "<button type='submit'>Submit</button>"
               "</form>"
               );
  htmlPage += F("</html>"
                "\r\n");
  return htmlPage;
}

void parseWifiCreds(String body, char* parsedSSID, char* parsedPassword) {
  char bodyChar[100];
  body.toCharArray(bodyChar, sizeof(bodyChar));

  // pars key=value pairs
  char params[2][50];
  char delimiter[] = "&";
  // char *token = strtok(bodyChar, delimiter);
  strncpy(params[0], strtok(bodyChar, delimiter), sizeof(params[0]));
  // char *token2 = strtok(NULL, delimiter);
  strncpy(params[1], strtok(NULL, delimiter), sizeof(params[1]));

  // parse param values from key=value pairs
  // char parsedParams[2][40];
  char valDelimiter[] = "=";
  strtok(params[0], valDelimiter);
  strncpy(parsedSSID, strtok(NULL, valDelimiter), 40);
  strtok(params[1], valDelimiter);
  strncpy(parsedPassword, strtok(NULL, valDelimiter), 40);
}

void setWifiCredentials() {
  char parsedSSID[40];
  char parsedPassword[40];
  parseWifiCreds(server.arg("plain"), parsedSSID, parsedPassword);
  Serial.println("SSID -> ");
  Serial.println(parsedSSID);
  Serial.println("PASS -> ");
  Serial.println(parsedPassword);
  update_ssid(parsedSSID, parsedPassword, true);
  server.send(200, "text/plain", F("Success"));
}

/**
 * ROUTER
 */
// Define routing
void restServerRouting() {
    server.on(F("/"), HTTP_GET, []() {
        server.send(200, F("text/html"), serverHomePage());
    });
    server.on(F("/setSSID"), HTTP_POST, setWifiCredentials);
}

void setupPM25AQI() {
  Serial.println(" ");
  Serial.println("Setup Adafruit PMSA003I Air Quality Sensor");

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

void takePM25Reading() {
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
  Serial.println(F("PM 1.0: ")); Serial.print(data.pm10_standard);
  Serial.println(F("\t\tPM 2.5: ")); Serial.print(data.pm25_standard);
  Serial.println(F("\t\tPM 10: ")); Serial.println(data.pm100_standard);

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

  sprintf(pm10, "[{\"name\":\"Office\",\"type\":\"PM1\",\"units\":\"PM1\",\"value\":\"%u\"}]", data.pm10_standard);
  sprintf(pm25, "[{\"name\":\"Office\",\"type\":\"PM25\",\"units\":\"PM25\",\"value\":\"%u\"}]", data.pm25_standard);
  sprintf(pm100, "[{\"name\":\"Office\",\"type\":\"PM10\",\"units\":\"PM10\",\"value\":\"%u\"}]", data.pm100_standard);
  Serial.println(pm10);
  Serial.println(pm25);
  Serial.println(pm100);

  HTTPClient http;

  /* Send PM1 */
  http.begin("http://pjwalker.net:8099/api/new");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", API_KEY);

  int httpCode = http.POST(pm10);
  String payload = http.getString();      

  Serial.println(httpCode);
  Serial.println(payload);

  /* Send PM2.5 */
  http.begin("http://pjwalker.net:8099/api/new");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", API_KEY);

  int httpCode2 = http.POST(pm25);
  String payload2 = http.getString();

  Serial.println(httpCode2);
  Serial.println(payload2);

  http.end();

  /* Send PM10 */
  http.begin("http://pjwalker.net:8099/api/new");      //Specify request destination
  http.addHeader("Content-Type", "application/json");  //Specify content-type header
  http.addHeader("Authorization", API_KEY);

  int httpCode3 = http.POST(pm100);   //Send the request
  String payload3 = http.getString();                  //Get the response payload

  Serial.println(httpCode3);   //Print HTTP return code
  Serial.println(payload3);    //Print request response payload

  http.end();  //Close connection
}

String ap_ssid = "esp8266.local";
/**
 * SETUP
 */
void setup(){
  Serial.begin(115200);  
  Serial.print("Setting AP (Access Point)…");
  char creds[2][40];
  char ssid[40];
  char pw[40];
  
  read_wifi_credentials(ssid, pw);
  Serial.println("Connect to wifi");
  Serial.println(ssid);
  Serial.println(pw);  
  WiFi.begin(ssid, pw);

  if (testWifi() == false) {
    WiFi.softAP(ap_ssid);
    IPAddress IP = WiFi.softAPIP();
    Serial.println("AP IP address: ");
    Serial.println(IP);
    restServerRouting();
    server.begin();
  } else {
     Serial.println("Connected to WIFI ");
     Serial.print(ssid);
  }
  
  setupPM25AQI();
}
 
/**
 * LOOP
 */
void loop(){
  server.handleClient();
  takePM25Reading();
  delay(300000); // five minutes
//  delay(10000); // ten seconds
}
