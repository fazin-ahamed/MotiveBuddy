void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  if (Serial.available() > 0) {
    char command = Serial.read();
    
    if (command == 'S') {
      digitalWrite(9, HIGH); // Activate LED indicator
      delay(1000);          // Timer
      digitalWrite(9, LOW);  // Turn off LED
    }
  }
}