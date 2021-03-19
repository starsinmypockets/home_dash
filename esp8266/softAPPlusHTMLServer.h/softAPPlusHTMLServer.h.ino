// Import required libraries
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h> 

ESP8266WebServer server(80);

// setup memory location for wifi credentials
int addr_ssid = 0;         // ssid index
int addr_password = 40;    // password index

void update_ssid(String ssid, String password, bool reset_eprom) {
  EEPROM.begin(512);
  Serial.println("");
  
  if ( reset_eprom ) {
    for (int i = 0; i < 512; i++) {
      EEPROM.write(i, 0);
    }
    EEPROM.commit();
    delay(500);
  }
 
  Serial.println("");
  Serial.print("Write WiFi SSID at address "); Serial.println(addr_ssid);
  Serial.print("");
  for (int i = 0; i < ssid.length(); ++i)
  {
    EEPROM.write(addr_ssid + i, ssid[i]);
    Serial.print(ssid[i]); Serial.print("");
  }

  Serial.println("");
  Serial.print("Write WiFi Password at address "); Serial.println(addr_password);
  Serial.print("");
  for (int j = 0; j < password.length(); j++)
  {
    EEPROM.write(addr_password + j, password[j]);
    Serial.print(password[j]); Serial.print("");
  }

  Serial.println("");
  if (EEPROM.commit()) {
    Serial.println("Data successfully committed");
  } else {
    Serial.println("ERROR! Data commit failed");
  }
}

void read_wifi_credentials() {
  Serial.println("");
  Serial.println("Check writing");
  char data[512];
  
  //for (int k = addr_ssid; k < addr_ssid + 20; ++k)
  for (int i = 0; i < 512; i++)
  {
    data[i] = char(EEPROM.read(i));
  }
  Serial.print("EPROM DATA: ");
  Serial.println(data);
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

void parseWifiCreds(String body, char *parsedSSID, char *parsedPassword) {
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
//  String postBody = server.arg("plain");
  char parsedSSID[40];
  char parsedPassword[40];
  parseWifiCreds(server.arg("plain"), parsedSSID, parsedPassword);
  Serial.println("SSID -> ");
  Serial.println(parsedSSID);
  Serial.println("PASS -> ");
  Serial.println(parsedPassword);
  update_ssid(parsedSSID, parsedPassword, true);
  read_wifi_credentials();
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

String ssid = "esp8266.local";
/**
 * SETUP
 */
void setup(){
  Serial.begin(115200);  
  Serial.print("Setting AP (Access Point)…");
  
  WiFi.softAP(ssid);

  IPAddress IP = WiFi.softAPIP();
  Serial.println("AP IP address: ");
  Serial.println(IP);
  read_wifi_credentials();
  
  restServerRouting();
  server.begin();
}
 
/**
 * LOOP
 */
void loop(){
  server.handleClient();
}
