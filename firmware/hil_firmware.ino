/*
 * HIL Circuit Analyser — Arduino Firmware
 * 
 * Waits for a 'G' command over serial from the C++ host application.
 * On receipt: discharges the capacitor for 5 seconds, then charges
 * it via D2 for 15 seconds while streaming timestamped voltage readings
 * over serial at 50ms intervals.
 * 
 * Serial format: <timestamp_ms>,<voltage_V>
 * Baud rate: 9600
 * Measurement pin: A0
 * Trigger pin: D2
 */
const int TRIGGER_PIN = 2;
const int MEASURE_PIN = A0;
const int SAMPLE_INTERVAL_MS = 50;

void setup() {
    Serial.begin(9600);
    pinMode(TRIGGER_PIN, OUTPUT);
    digitalWrite(TRIGGER_PIN, LOW);
    delay(1000);
    Serial.println("READY");
}

void loop() {
    if (Serial.available() > 0) {
        char cmd = Serial.read();
        if (cmd == 'G') {
            digitalWrite(TRIGGER_PIN, LOW);
            delay(5000);

            digitalWrite(TRIGGER_PIN, HIGH);
            unsigned long startTime = millis();
            unsigned long endTime   = startTime + 15000;

            while (millis() < endTime) {
                unsigned long elapsed = millis() - startTime;
                int raw = analogRead(MEASURE_PIN);
                float voltage = raw * (5.0 / 1023.0);
                Serial.print(elapsed);
                Serial.print(",");
                Serial.println(voltage, 4);
                delay(SAMPLE_INTERVAL_MS);
            }

            digitalWrite(TRIGGER_PIN, LOW);
            Serial.println("DONE");
        }
    }
}