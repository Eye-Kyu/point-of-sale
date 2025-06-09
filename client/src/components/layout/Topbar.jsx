// src/components/layout/Topbar.jsx
const Topbar = () => {
    return (
        <header className="bg-white border-b p-4 flex justify-between items-center">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <div>
                <span className="text-gray-700">Admin</span>
            </div>
        </header>
    );
};

export default Topbar;
