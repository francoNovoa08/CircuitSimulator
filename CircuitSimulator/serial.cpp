#include "serial.h"
#include <iostream>

SerialReader::SerialReader(const std::string& port, DWORD baudRate)
    : m_handle(INVALID_HANDLE_VALUE)
{
    std::string fullPort = "\\\\.\\" + port;

    m_handle = CreateFileA(
        fullPort.c_str(),
        GENERIC_READ | GENERIC_WRITE,
        0,              // no sharing
        nullptr,        // no security attributes
        OPEN_EXISTING,
        0,              // synchronous I/O
        nullptr
    );

    if (m_handle == INVALID_HANDLE_VALUE) {
        throw std::runtime_error("Failed to open serial port: " + port +
            " (error " + std::to_string(GetLastError()) + ")");
    }

    DCB dcb = {};
    dcb.DCBlength = sizeof(DCB);

    if (!GetCommState(m_handle, &dcb)) {
        CloseHandle(m_handle);
        throw std::runtime_error("Failed to get COM state");
    }

    dcb.BaudRate = baudRate;
    dcb.ByteSize = 8;
    dcb.StopBits = ONESTOPBIT;
    dcb.Parity = NOPARITY;

    if (!SetCommState(m_handle, &dcb)) {
        CloseHandle(m_handle);
        throw std::runtime_error("Failed to set COM state");
    }

    // 100ms between characters, 500ms total per read
    COMMTIMEOUTS timeouts = {};
    timeouts.ReadIntervalTimeout = 100;
    timeouts.ReadTotalTimeoutConstant = 500;
    timeouts.ReadTotalTimeoutMultiplier = 10;

    if (!SetCommTimeouts(m_handle, &timeouts)) {
        CloseHandle(m_handle);
        throw std::runtime_error("Failed to set COM timeouts");
    }

    PurgeComm(m_handle, PURGE_RXCLEAR | PURGE_TXCLEAR);

    std::cout << "[HIL] Serial port " << port
        << " opened at " << baudRate << " baud\n";
}

SerialReader::~SerialReader() {
    if (m_handle != INVALID_HANDLE_VALUE) {
        CloseHandle(m_handle);
    }
}

void SerialReader::fillBuffer() {
    char ch;
    DWORD bytesRead = 0;

    while (true) {
        if (!ReadFile(m_handle, &ch, 1, &bytesRead, nullptr) || bytesRead == 0) {
            break; 
        }
        m_buffer += ch;
        if (ch == '\n') break;
    }
}

std::string SerialReader::readLine() {
    while (m_buffer.find('\n') == std::string::npos) {
        fillBuffer();
        if (m_buffer.empty()) return ""; 
    }

    size_t pos = m_buffer.find('\n');
    std::string line = m_buffer.substr(0, pos);
    m_buffer = m_buffer.substr(pos + 1);

    if (!line.empty() && line.back() == '\r') {
        line.pop_back();
    }

    return line;
}

bool SerialReader::parseArduinoSample(const std::string& line, double& timestamp_ms, double& voltage) {
    if (line.empty() || line == "READY" || line == "DONE") return false;
    size_t comma = line.find(',');
    if (comma == std::string::npos) return false;
    try {
        timestamp_ms = std::stod(line.substr(0, comma));
        voltage = std::stod(line.substr(comma + 1));
        return true;
    }
    catch (...) {
        return false;
    }
}

void SerialReader::sendCommand(char cmd) {
    DWORD bytesWritten = 0;
    WriteFile(m_handle, &cmd, 1, &bytesWritten, nullptr);
}