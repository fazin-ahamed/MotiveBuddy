void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    char command = Serial.read();
    
    if (command == 'S') {
      digitalWrite(9, HIGH); // Activate the shock of a life time
      delay(1000); // Shock timer
      digitalWrite(9, LOW); // Stop shocking
    }
  }
}