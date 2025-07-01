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
import io from "socket.io-client";
import Starfield from './Starfield';
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import axios from "axios";
// Add TypeScript declaration for chrome extension APIs
declare const chrome: typeof globalThis.chrome & {
  runtime?: { getURL?: (path: string) => string };
};

// Define the Agent interface to describe agent objects
interface Agent {
  subnet_name: string; // Name of the agent/subnet
  description: string; // Description of the agent
  subnet_url: string;  // Unique identifier or URL for the agent
}

// Define the structure for execution results
interface ExecutionResult {
  status: 'pending' | 'running' | 'completed' | 'error'; // Current status
  message: string; // Status message
  data?: any;      // Optional data returned from execution
}

const App = () => {
  // State variables for UI and logic
  const [isLoading, setIsLoading] = useState<string | null>(null); // Loading state for async actions
  const [searchText, setSearchText] = useState(""); // Search input for filtering agents
  const [results, setResults] = useState<Record<string, string>>({}); // Stores results for each agent
  const [agents, setAgents] = useState<Agent[]>([]); // List of available agents
  const [isLoggedIn, setIsLoggedIn] = useState(false); // User login state
  const [web3auth, setWeb3auth] = useState<InstanceType<typeof Web3Auth> | null>(null); // Web3Auth instance
  const [userPrompt, setUserPrompt] = useState(""); // User's input prompt for agent execution
  const [socket, setSocket] = useState<any>(null); // WebSocket connection instance
  const [executionResults, setExecutionResults] = useState<Record<string, ExecutionResult>>({}); // Stores execution results for agents
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null); // Currently selected agent for execution
  const [view, setView] = useState<'list' | 'execution'>('list'); // UI view state: list of agents or execution view
  const [executingAgent, setExecutingAgent] = useState<Agent | null>(null); // Agent currently being executed
  const [selectedNft, setSelectedNft] = useState<any>(null); // Selected NFT for execution (if required)

  // Initialize Web3Auth for user authentication (runs once on mount)
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

  // Initialize WebSocket connection to user agent backend (runs once on mount)
  useEffect(() => {
    // Create a socket.io-client instance to connect to the backend WebSocket server
    const socketInstance = io("https://skynetuseragent-c0n1.stackos.io", {
      transports: ["websocket"], // Force use of WebSocket protocol only
      timeout: 600000,           // Set connection timeout to 10 minutes
    });

    // Event: Successfully connected to the WebSocket server
    socketInstance.on("connect", () => {
      console.log("Connected to user agent service");
    });

    // Event: Disconnected from the WebSocket server
    socketInstance.on("disconnect", (reason: any) => {
      console.log("Disconnected from user agent service. Reason:", reason);
    });

    // Event: Received execution result from the server
    socketInstance.on("execution-result", (data: any) => {
      console.log("Received execution result:", data);
      setExecutionResults(prev => ({
        ...prev,
        [data.agentName]: {
          status: 'completed',
          message: 'Execution completed successfully',
          data: data.result
        }
      }));
    });

    // Event: Received execution error from the server
    socketInstance.on("execution-error", (data: any) => {
      console.error("Execution error:", data);
      setExecutionResults(prev => ({
        ...prev,
        [data.agentName]: {
          status: 'error',
          message: data.error || 'Execution failed'
        }
      }));
    });

    // Event: Received a generic message from the server
    socketInstance.on("message", (data: any) => {
      console.log("WebSocket message received:", data);
    });

    // Event: WebSocket error
    socketInstance.on("error", (error: any) => {
      console.error("WebSocket error:", error);
    });

    // Event: WebSocket connection error
    socketInstance.on("connect_error", (error: any) => {
      console.error("WebSocket connection error:", error);
    });

    // Store the socket instance in state for use elsewhere
    setSocket(socketInstance);

    // Cleanup: disconnect socket when component unmounts
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const logoSrc =
    typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL("/logo.png")
      : "/logo.png";
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

  const agentIcons: Record<string, JSX.Element> = {
    'TL;DR': <FontAwesomeIcon icon={faBolt} style={{ color: '#fff', background: '#f43f5e', borderRadius: '8px', padding: '6px' }} />, // Example
    'Deep Research': <FontAwesomeIcon icon={faSearch} style={{ color: '#fff', background: '#6366f1', borderRadius: '8px', padding: '6px' }} />, // Example
    'Research People': <FontAwesomeIcon icon={faFileAlt} style={{ color: '#fff', background: '#0ea5e9', borderRadius: '8px', padding: '6px' }} />, // Example
    'Generate a Podcast': <FontAwesomeIcon icon={faFeather} style={{ color: '#fff', background: '#a21caf', borderRadius: '8px', padding: '6px' }} />, // Example
    'LinkedIn': <FontAwesomeIcon icon={faFileAlt} style={{ color: '#fff', background: '#2563eb', borderRadius: '8px', padding: '6px' }} />, // Placeholder for LinkedIn
  };

  const handleRunAgent = async (agentName: string, agentId: string) => {
    if (!isLoggedIn) {
      alert("Please login to use the agents");
      return;
    }
    const agent = agents.find(a => a.subnet_name === agentName);
    if (agent) {
      setExecutingAgent(agent);
      setView('execution');
    }
  };

  const handleBackToList = () => {
    setView('list');
    setExecutingAgent(null);
    setSelectedAgent(null);
    setUserPrompt("");
  };

  // Execute the agent workflow with user prompt
  const handleExecuteWorkflow = async () => {
    if (!selectedAgent || !userPrompt.trim() || !web3auth) {
      alert("Please provide a prompt and ensure you're logged in");
      return;
    }

    setIsLoading(selectedAgent.subnet_name);
    setExecutionResults(prev => ({
      ...prev,
      [selectedAgent.subnet_name]: {
        status: 'pending',
        message: 'Fetching agent workflow...'
      }
    }));

    try {
      // Step 1: Get the agent workflow (subnet_list)
      const response = await fetch(
        `https://skynetagent-c0n525.stackos.io/api/agents/${selectedAgent.subnet_url}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Full API response:", data);
      console.log("Response keys:", Object.keys(data));
      
      // The subnet_list is nested inside data.data.subnet_list
      const subnet_list = data.data?.subnet_list;
      console.log("subnet_list value:", subnet_list);

      if (!subnet_list) {
        console.error("No subnet_list found in response. Available fields:", Object.keys(data));
        throw new Error("No workflow found for this agent");
      }

      // Print the workflow object to console
      console.log("Workflow object:", subnet_list);

      // Transform workflow to server-expected format
      const transformedWorkflow = subnet_list.map((step: any, index: number) => ({
        stepId: step.id,
        stepNumber: index + 1,
        serviceName: step.subnetName,
        serviceUrl: step.subnetURL,
        prompt: step.prompt,
        inputItemID: step.inputItemID || [],
        output: step.output,
        systemPrompt: step.systemPrompt,
        description: step.description
      }));

      console.log("Transformed workflow:", transformedWorkflow);

      setExecutionResults(prev => ({
        ...prev,
        [selectedAgent.subnet_name]: {
          status: 'running',
          message: 'Preparing execution...'
        }
      }));

      // Step 2: Get user signature for authentication
      const provider = await web3auth.connect();
      if (!provider) {
        throw new Error("Failed to connect to Web3Auth provider");
      }
      // Get the user's account address
      const accounts = await provider.request({ method: "eth_accounts" }) as string[];
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.");
      }
      const userAddress = accounts[0];
      // Generate signature with proper message format
      const messageToSign = `Execute workflow: ${userPrompt}`;
      const signature = await provider.request({
        method: "personal_sign",
        params: [messageToSign, userAddress]
      });
      console.log("Signature from personal_sign:", signature, typeof signature);
      const payload = {
        prompt: userPrompt,
        userAuthPayload: signature,
        accountNFT: {
          collectionID: "0",
          nftID: selectedNft?.toString() || "0",
        },
        workflow: subnet_list,
      };
      
      console.log("Emitting process-request with payload:", payload);
      if (socket && socket.connected) {
        socket.emit("process-request", payload, (response: any) => {
          console.log("Socket server response to process-request:", response);
          setExecutionResults(prev => ({
            ...prev,
            [selectedAgent.subnet_name]: {
              status: response?.error ? 'error' : 'completed',
              message: response?.error ? response.error : 'Execution completed successfully',
              data: response?.result || response,
            }
          }));
        });
      } else {
        console.error("Socket is not connected");
      }

    } catch (error) {
      console.error("Error executing workflow:", error);
      setExecutionResults(prev => ({
        ...prev,
        [selectedAgent.subnet_name]: {
          status: 'error',
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }));
      setResults(prev => ({
        ...prev,
        [selectedAgent.subnet_name]: `Error executing workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    } finally {
      setIsLoading(null);
    }
  };

  const handleCancelExecution = () => {
    setSelectedAgent(null);
    setUserPrompt("");
  };

  const handleBack = () => {
    window.close();
  };

  // Add testAgent function for agent testing with pre-checks
  const testAgent = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to your wallet first");
      return;
    }
    if (!executingAgent) {
      toast.error('Please select an agent first');
      return;
    }
    if (!selectedNft) {
      toast.error('Please select an NFT first');
      return;
    }
    if (!userPrompt.trim()) {
      toast.error('Please enter a prompt for the test');
      return;
    }
    
    // Set the selected agent and execute the workflow
    setSelectedAgent(executingAgent);
    await handleExecuteWorkflow();
  };

  const filteredAgents = agents.filter((agent) =>
    agent.subnet_name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#18181b",
        color: "white",
        fontFamily: "sans-serif",
        overflowY: "auto",
        borderRadius: '16px',
        boxShadow: '0 2px 16px #000a',
      }}
    >
      <Toaster />
      {view === 'list' && (
        <>
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
                  {/* Execution Results */}
                  {executionResults[agent.subnet_name] && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        backgroundColor: "#1a1a1a",
                        borderRadius: "4px",
                        fontSize: "12px",
                        border: `1px solid ${
                          executionResults[agent.subnet_name].status === 'error' ? "#dc2626" : 
                          executionResults[agent.subnet_name].status === 'completed' ? "#16a34a" : "#3b82f6"
                        }`,
                      }}
                    >
                      <div style={{ 
                        fontWeight: 600, 
                        marginBottom: "8px",
                        color: executionResults[agent.subnet_name].status === 'error' ? "#dc2626" : 
                               executionResults[agent.subnet_name].status === 'completed' ? "#16a34a" : "#3b82f6"
                      }}>
                        Status: {executionResults[agent.subnet_name].status.toUpperCase()}
                      </div>
                      <div style={{ marginBottom: "8px" }}>
                        {executionResults[agent.subnet_name].message}
                      </div>
                      {executionResults[agent.subnet_name].data && (
                        <div style={{ 
                          backgroundColor: "#27272a", 
                          padding: "8px", 
                          borderRadius: "4px",
                          whiteSpace: "pre-wrap"
                        }}>
                          {JSON.stringify(executionResults[agent.subnet_name].data, null, 2)}
                        </div>
                      )}
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
        </>
      )}
      {view === 'execution' && executingAgent && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Top Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #27272a', background: '#18181b',
          }}>
            <button onClick={handleBackToList} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, marginRight: 12, cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {agentIcons[executingAgent.subnet_name] || <FontAwesomeIcon icon={faFileAlt} style={{ color: '#fff', background: '#27272a', borderRadius: '8px', padding: '6px' }} />}
              <span style={{ fontWeight: 700, fontSize: 18 }}>{executingAgent.subnet_name.length > 20 ? executingAgent.subnet_name.slice(0, 20) + '…' : executingAgent.subnet_name}</span>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <FontAwesomeIcon icon={faXmark} style={{ color: '#a1a1aa', fontSize: 20, cursor: 'pointer' }} />
            </div>
          </div>
          {/* NFT Selection Dropdown */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <select
              value={selectedNft || ''}
              onChange={e => setSelectedNft(e.target.value || null)}
              style={{
                width: '100%',
                maxWidth: 400,
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #3f3f46',
                backgroundColor: '#27272a',
                color: 'white',
                fontSize: '14px',
                marginBottom: '16px',
              }}
            >
              <option value="">Select NFT</option>
              <option value="nft1">NFT #1</option>
              <option value="nft2">NFT #2</option>
              <option value="nft3">NFT #3</option>
            </select>
            <input
              type="text"
              placeholder="Enter your prompt..."
              value={userPrompt}
              onChange={e => setUserPrompt(e.target.value)}
              style={{
                width: '100%',
                maxWidth: 400,
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #3f3f46',
                backgroundColor: '#27272a',
                color: 'white',
                fontSize: '14px',
                marginBottom: '16px',
              }}
            />
            <button
              onClick={testAgent}
              style={{
                background: '#3b82f6',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                borderRadius: '4px',
                padding: '8px 20px',
                cursor: 'pointer',
                marginBottom: '24px',
              }}
            >
              Test Agent
            </button>
          </div>
          {/* Animated Starfield */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>
            <Starfield width={220} height={220} numStars={350} />
            {/* Background Message Section */}
            <div style={{ width: '90%', maxWidth: 400, background: 'none', color: '#fff', fontSize: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                <FontAwesomeIcon icon={faCirclePlay} spin style={{ marginRight: 8, color: '#a1a1aa' }} />
                Background Message
              </div>
              <div style={{ height: 6, background: '#27272a', borderRadius: 4, marginBottom: 8, width: '100%' }}>
                <div style={{ width: '40%', height: '100%', background: '#52525b', borderRadius: 4, transition: 'width 0.5s' }} />
              </div>
              <div style={{ color: '#a1a1aa', fontSize: 14, marginTop: 4 }}>
                Resolving variables<br />
                Sending resolved message: "You are an expert at…"<br />
                Waiting for model response...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
