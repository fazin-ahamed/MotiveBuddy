// Arduino sketch for Bluetooth communication with web app

// Define pins
const int walkAwayPin = 10;  // Pin for "walk away" action (e.g., LED or motor)
const int returnPin = 11;    // Pin for "return" action
const int testPin = 13;      // Built-in LED for connection testing

void setup() {
  // Initialize pins
  pinMode(walkAwayPin, OUTPUT);
  pinMode(returnPin, OUTPUT);
  pinMode(testPin, OUTPUT);
  
  // Initialize all outputs to LOW
  digitalWrite(walkAwayPin, LOW);
  digitalWrite(returnPin, LOW);
  digitalWrite(testPin, LOW);
  
  // Initialize serial for Bluetooth module (HC-05/HC-06 typically use 9600)
  Serial.begin(9600);
}

void loop() {
  // Check if data is available from Bluetooth
  if (Serial.available() > 0) {
    // Peek at first character to quickly check for Walk Away command
    if (Serial.peek() == 'W') {
      Serial.read(); // Consume the 'W'
      executeWalkAway();
      // Send acknowledgment back
      Serial.println("ACK:W");
    } else {
      // For other commands, process normally
      String command = Serial.readStringUntil('\n');
      command.trim();
      
      // Process commands
      if (command.length() > 0) {
        char firstChar = command.charAt(0);
        
        switch (firstChar) {
          case 'R':  // Return command
            executeReturn();
            break;
            
          case 'T':  // Test connection
            executeTest();
            break;

          case 'C':  // Custom command format: C:action:value
            handleCustomCommand(command.substring(1));
            break;
            
          case 'S':  // Status request
            sendStatusUpdate();
            break;
            
          default:
            // Unknown command - flash test LED briefly
            digitalWrite(testPin, HIGH);
            delay(50);
            digitalWrite(testPin, LOW);
            break;
        }
        
        // Send acknowledgment back
        Serial.print("ACK:");
        Serial.println(command);
      }
    }
  }
  
  // Priority check for Walk Away command (poll more frequently)
  if (Serial.available() > 0 && Serial.peek() == 'W') {
    Serial.read(); // Consume the 'W'
    executeWalkAway();
    // Send acknowledgment back
    Serial.println("ACK:W");
  }
}

// Execute walk away action
void executeWalkAway() {
  // Activate walk away indicator (e.g., LED or motor)
  digitalWrite(walkAwayPin, HIGH);
  digitalWrite(testPin, HIGH);  // Also light up built-in LED for visibility
  
  // Keep active for 5 seconds (matching web app timeout)
  delay(5000);
  
  // Turn off after timeout
  digitalWrite(walkAwayPin, LOW);
  digitalWrite(testPin, LOW);
}

// Execute return action
void executeReturn() {
  // Activate return indicator
  digitalWrite(returnPin, HIGH);
  delay(1000);
  digitalWrite(returnPin, LOW);
}

// Test Bluetooth connection with a brief LED flash
void executeTest() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(testPin, HIGH);
    delay(100);
    digitalWrite(testPin, LOW);
    delay(100);
  }
}

// Handle custom commands in format C:action:value
void handleCustomCommand(String commandData) {
  int separatorIndex = commandData.indexOf(':');
  if (separatorIndex != -1) {
    String action = commandData.substring(0, separatorIndex);
    String value = commandData.substring(separatorIndex + 1);
    
    // Process different custom actions
    if (action == "LED") {
      // Control an LED with value as intensity or state
      int ledValue = value.toInt();
      // Add implementation here
      
      digitalWrite(testPin, ledValue > 0 ? HIGH : LOW);
    }
    else if (action == "MOTOR") {
      // Control a motor with value as speed or direction
      int motorValue = value.toInt();
      // Add motor control implementation here
    }
    // Add more custom actions as needed
  }
}

// Send current status to connected device
void sendStatusUpdate() {
  Serial.println("STATUS:READY");
  // Add code to read sensors or other status information
  // Example: Serial.print("TEMP:"); Serial.println(readTemperature());
}
