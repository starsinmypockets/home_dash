// Import required libraries
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h> 

ESP8266WebServer server(80);

// setup memory location for wifi credentials
int addr_ssid = 0;         // ssid index
int addr_password = 20;    // password index

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
  String ssid;
  for (int k = addr_ssid; k < addr_ssid + 20; ++k)
  {
    ssid += char(EEPROM.read(k));
  }
  Serial.print("SSID: ");
  Serial.println(ssid);

  String password;
  for (int l = addr_password; l < addr_password + 20; ++l)
  {
    password += char(EEPROM.read(l));
  }
  Serial.print("PASSWORD: ");
  Serial.println(password); 
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

void setWifiCredentials() {
  String postBody = server.arg("plain");
  Serial.println(postBody);
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
  Serial.println(WiFi.localIP());
  
  restServerRouting();
  server.begin();
}
 
/**
 * LOOP
 */
void loop(){
  server.handleClient();
}
