#include <iostream>
#include <vector>
#include <string>
#include "parser.h"

int main()
{
    Parser parser;
    std::string filename = "circuit.net";

    try {
        std::vector<Component> components = parser.parse(filename);

        std::cout << "Successfully parsed " << components.size() << " components:\n";
        std::cout << "--------------------------------------------------\n";

        for (const auto& comp : components) {
            std::cout << "Name: " << comp.name
                << " | Type: " << parser.nameFromType(comp.type)
                << " | Node+: " << comp.node_pos
                << " | Node-: " << comp.node_neg
                << " | Value: " << comp.value << "\n";
        }
    }
    catch (const std::exception& e) {
        std::cerr << "Parser error: " << e.what() << "\n";
        return 1;
    }

    return 0;
}
