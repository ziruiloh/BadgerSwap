import { useEffect, useState } from "react";

export default function Navbar() {
    const [path, setPath] = useState(
        typeof window !== "undefined" ? window.location.pathname : "/"
    );

    useEffect(() => {
        const onPop = () => setPath(window.location.pathname);
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, []);

    const navStyle = {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        background: "#fff",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
        zIndex: 1000,
        padding: "0 8px",
    };

    const linkBase = {
        flex: 1,
        maxWidth: 120,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        color: "#333",
        fontSize: 12,
        gap: 4,
        cursor: "pointer",
    };

    const activeStyle = {
        color: "#0b84ff",
    };

    const iconStyle = {
        width: 22,
        height: 22,
        display: "block",
    };

    return (
        <nav style={navStyle} aria-label="Primary navigation">
            <a
                href="/products"
                aria-label="Products"
                style={{ ...linkBase, ...(path === "/products" ? activeStyle : {}) }}
            >
                <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="8" height="8" rx="1" ry="1" strokeWidth="1.5"/>
                    <rect x="13" y="3" width="8" height="8" rx="1" ry="1" strokeWidth="1.5"/>
                    <rect x="3" y="13" width="8" height="8" rx="1" ry="1" strokeWidth="1.5"/>
                    <rect x="13" y="13" width="8" height="8" rx="1" ry="1" strokeWidth="1.5"/>
                </svg>
                <span>Products</span>
            </a>

            <a
                href="/chat"
                aria-label="Chat"
                style={{ ...linkBase, ...(path === "/chat" ? activeStyle : {}) }}
            >
                <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5"/>
                </svg>
                <span>Chat</span>
            </a>

            <a
                href="/favorites"
                aria-label="Favorites"
                style={{ ...linkBase, ...(path === "/favorites" ? activeStyle : {}) }}
            >
                <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 21s-7.5-4.9-9.1-8.1C1.1 9.9 4 6 7.9 6 10 6 12 7.5 12 7.5S14 6 16.1 6C20 6 22.9 9.9 21.1 12.9 19.5 16.1 12 21 12 21z" strokeWidth="1.2"/>
                </svg>
                <span>Favorites</span>
            </a>

            <a
                href="/profile"
                aria-label="Profile"
                style={{ ...linkBase, ...(path === "/profile" ? activeStyle : {}) }}
            >
                <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="1.5"/>
                    <circle cx="12" cy="7" r="4" strokeWidth="1.5"/>
                </svg>
                <span>Profile</span>
            </a>
        </nav>
    );
}