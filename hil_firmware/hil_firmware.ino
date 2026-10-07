/*
 * HIL Circuit Analyser — Arduino Firmware
 *
 * Waits for a 'G' command over serial from the C++ host application.
 * On receipt: holds D2 LOW for DISCHARGE_MS to empty the capacitor, then
 * drives D2 HIGH for CHARGE_MS while streaming timestamped voltage
 * readings over serial every SAMPLE_INTERVAL_MS.
 *
 * Serial format: <timestamp_ms>,<voltage_V>
 * Baud rate: 9600
 * Measurement pin: A0
 * Trigger pin: D2
 */
const int TRIGGER_PIN = 2;
const int MEASURE_PIN = A0;
const int SAMPLE_INTERVAL_MS = 50;

const unsigned long DISCHARGE_MS = 60000;
const unsigned long CHARGE_MS    = 90000;

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
            delay(DISCHARGE_MS);

            digitalWrite(TRIGGER_PIN, HIGH);
            unsigned long startTime = millis();
            unsigned long endTime   = startTime + CHARGE_MS;

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