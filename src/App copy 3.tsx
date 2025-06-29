import React, { useState, useEffect } from "react";
import {
  faBolt,
  faPlay,
  faChevronLeft,
  faFeather,
  faFileAlt,
  faSearch,
  faXmark,
  faCirclePlay,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Web3Auth } from "@web3auth/modal";
import ReactDOM from "react-dom";
// Add TypeScript declaration for chrome extension APIs
declare const chrome: typeof globalThis.chrome & {
  runtime?: { getURL?: (path: string) => string };
};

interface Agent {
  subnet_name: string;
  description: string;
  subnet_url: string;
}

const App = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [web3auth, setWeb3auth] = useState<InstanceType<typeof Web3Auth> | null>(null);

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        // Minimal config for Web3Auth
        const web3auth = new Web3Auth({
          clientId: "BCU6qYdYUad5TLmmJwLE3k4TGml3cVUgQRAuGcBmBpIKzQpw3pnr7DcxaKU5e5wGH_WXMFS5tj5wJBKuvuc2WkU",
          web3AuthNetwork:"sapphire_devnet"
        });
        await web3auth.init();
        console.log("Web3Auth.getUserInfo()",web3auth.getUserInfo());
        setWeb3auth(web3auth);
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      }
    };

   initWeb3Auth();
  }, []);
  const logoSrc =
    typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL("icons/logo.png")
      : "icons/logo.png";
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading("Fetching agents...");
      try {
        const response = await fetch(
          "https://skynetagent-c0n525.stackos.io/api/agents"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched agents response:", data); // Debug log
        // Correctly extract agents from data.data.agents
        const agentList = Array.isArray(data?.data?.agents)
          ? data.data.agents
          : [];
        setAgents(
          agentList.map((agent: any) => ({
            subnet_name: agent.name || agent.subnet_name || "",
            description: agent.description || "",
            subnet_url: agent.id || "", // store id for later use
          }))
        );
      } catch (error) {
        console.error("Error fetching agents:", error);
        setAgents([]);
      } finally {
        setIsLoading(null);
      }
    };

    fetchAgents();
  }, []);

  const handleLogin = async () => {
    if (!web3auth) {
      console.error("Web3Auth not initialized");
      return;
    }
    try {
      // Trigger Web3Auth login popup with social logins
      const provider = await web3auth.connect();
      console.log("Connected to provider:", provider);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleLogout = async () => {
    if (!web3auth) {
      console.error("Web3Auth not initialized");
      return;
    }
    try {
      await web3auth.logout();
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Fetch and display agent workflow (subnet_list) when Run is clicked
  const handleRunAgent = async (agentName: string, agentId: string) => {
    if (!isLoggedIn) {
      alert("Please login to use the agents");
      return;
    }
    setIsLoading(agentName);
    setResults((prev) => ({ ...prev, [agentName]: "Processing..." }));
    try {
      const response = await fetch(
        `https://skynetagent-c0n525.stackos.io/agents/${agentId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Display the subnet_list (workflow) as JSON for now
      setResults((prev) => ({
        ...prev,
        [agentName]: JSON.stringify(data.subnet_list, null, 2),
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [agentName]: "Error fetching workflow",
      }));
    } finally {
      setIsLoading(null);
    }
  };

  const handleBack = () => {
    window.close();
  };

  const filteredAgents = agents.filter((agent) =>
    agent.subnet_name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#1a1a1a",
        color: "white",
        fontFamily: "sans-serif",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          borderBottom: "1px solid #3f3f46",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src={logoSrc}
            alt="SkyStudio Logo"
            style={{ width: "24px", height: "24px", borderRadius: "4px" }}
          />
          <span style={{ fontSize: "14px", fontWeight: 600 }}>
            SkyAgents Hub
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "14px", color: "#a1a1aa" }}>
            Browse Agents
          </div>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                border: "none",
                color: "#ffffff",
                fontSize: "12px",
                borderRadius: "4px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              style={{
                background: "#22c55e",
                border: "none",
                color: "#ffffff",
                fontSize: "12px",
                borderRadius: "4px",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleBack}
        style={{
          margin: "16px",
          background: "transparent",
          border: "1px solid #3f3f46",
          color: "#ffffff",
          fontSize: "12px",
          borderRadius: "4px",
          padding: "4px 8px",
          cursor: "pointer",
        }}
      >
        <FontAwesomeIcon icon={faChevronLeft} size="xs" /> BACK
      </button>

      <div style={{ padding: "0 16px" }}>
        <input
          type="text"
          placeholder="Search agents..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #3f3f46",
            backgroundColor: "#27272a",
            color: "white",
            fontSize: "12px",
            marginBottom: "12px",
          }}
        />
      </div>

      {filteredAgents.length > 0 ? (
        <div style={{ padding: "0 16px" }}>
          {filteredAgents.map((agent, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#27272a",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      backgroundColor: "#ef4444",
                      borderRadius: "12px",
                      padding: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesomeIcon icon={faFeather} size="lg" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>
                      {agent.subnet_name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#a1a1aa" }}>
                      {agent.description}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleRunAgent(agent.subnet_name, agent.subnet_url)
                  }
                  disabled={!isLoggedIn}
                  style={{
                    background: isLoggedIn ? "#3f3f46" : "#27272a",
                    border: "1px solid #3f3f46",
                    color: isLoggedIn ? "#ffffff" : "#6b7280",
                    fontSize: "12px",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    cursor: isLoggedIn ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FontAwesomeIcon icon={faCirclePlay} />
                  {isLoggedIn ? "Run" : "Login Required"}
                </button>
              </div>
              {results[agent.subnet_name] && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "4px",
                    fontSize: "12px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {results[agent.subnet_name]}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            color: "#a1a1aa",
            fontSize: "14px",
          }}
        >
          No agents found
        </div>
      )}
    </div>
  );
};

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
