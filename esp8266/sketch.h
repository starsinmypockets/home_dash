 /* Need to install the ESP8266 board manager in Arduino IDE */
  #include <ESP8266WiFi.h>
  #include <ESP8266HTTPClient.h>
  
  const char* ssid = "633N40_2.4"; //replace with your own wifi ssid
  const char* password = "hashbrowns"; //replace with your own //wifi ssid password const char*
  void setup() {
      Serial.begin(115200);
      delay(10); // We start by connecting to a WiFi network Serial.println();
  
      Serial.println(); Serial.print("Connecting to ");
      Serial.println(ssid);
      /* Explicitly set the ESP8266 to be a WiFi-client, otherwise, it by default, would try to act as both a client and an access-point and could cause network-issues with your other WiFi-devices on your WiFi-network. */
  
      WiFi.mode(WIFI_STA);
      WiFi.begin(ssid, password);
  
      while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
      }
  
      Serial.println("");
      Serial.println("WiFi connected");
      Serial.println("IP address: ");
      Serial.println(WiFi.localIP());
  }
    int value = 0;
    void loop() {
      delay(5000);
      ++value;
  
      HTTPClient http;
  
      http.begin("http://pjwalker.net:8099/new");      //Specify request destination
      http.addHeader("Content-Type", "application/json");  //Specify content-type header
  
      int httpCode = http.POST("[{\"name\":\"from esp\",\"type\":\"bar\",\"units\":\"baz\",\"value\":\"123\"}]");   //Send the request
      String payload = http.getString();                  //Get the response payload
  
      Serial.println(httpCode);   //Print HTTP return code
      Serial.println(payload);    //Print request response payload
  
      http.end();  //Close connection
  }
