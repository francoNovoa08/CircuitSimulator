#pragma once
#include <windows.h>
#include <string>
#include <stdexcept>

class SerialReader {
public:
	/**
	* @brief Opens the COM port at the given baud rate
	* @param port The string to the port of the Arduino
	* @param baudRate The Arduino baud rate (bits per second of transmission)
	* @throws std::runtime_error on invalid ports
	**/
	explicit SerialReader(const std::string& port, DWORD baudRate = 9600);
	~SerialReader();

	/**
	* @brief Reads one line from the serial port (blocking)
	* @return The read string; returns empty string on timeout or error
	**/
	std::string readLine();

	/**
	* @brief Sends a single character command to the Arduino
	* @param cmd The command to send
	**/
	void sendCommand(char cmd);

	/**
	* @brief Checks if the serial port is currently open and valid
	* @return true if the port is open and ready, false otherwise
	**/
	bool isOpen() const { return m_handle != INVALID_HANDLE_VALUE; }

	/**
	* @brief Parses "timestamp_ms,voltage" format from Arduino, e.g. "1250,3.2454" to timestamp=1250, voltage=3.2454
	* @return false if the line is malformed or not a data line
	**/
	static bool parseArduinoSample(const std::string& line,
		double& timestamp_ms,
		double& voltage);

private:
	HANDLE m_handle;
	std::string m_buffer;

	/**
	* @brief Reads raw bytes into internal buffer
	**/
	void fillBuffer();
};
