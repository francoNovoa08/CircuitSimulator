import { Routes, Route } from "react-router-dom";
import Home from "./components/routes/Home";
import Lab from "./components/routes/Lab";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
    );
}