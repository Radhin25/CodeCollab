import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import LandingPage from "./LandingPage";
import SpaceBackground from "./components/SpaceBackground";
import GlassPanel from "./components/GlassPanel";
import NeonButton from "./components/NeonButton";

// Tailwind-based UI uses SpaceBackground canvas
const socket = io("https://realtime-code-editor-9i26.onrender.com");

const App = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");

  const handleNavigateToEditor = () => {
    setShowLanding(false);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// start code here");
    setLanguage("javascript");
    setUsers([]);
    setTyping("");
  };

  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (user) => {
      setTyping(`${user.slice(0, 8)}... is Typing`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// start code here");
    setLanguage("javascript");
    setUsers([]);
    setTyping("");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  if (showLanding) {
    return <LandingPage onNavigateToEditor={handleNavigateToEditor} />;
  }

  if (!joined) {
    return (
      <>
        <SpaceBackground />
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="relative w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-10 shadow-lg min-h-[600px] flex flex-col">
            
            {/* Back to Home Button - positioned in top-left corner */}
            <NeonButton 
              variant="accent" 
              outline 
              size="md" 
              onClick={handleBackToLanding} 
              className="!absolute top-4 left-4 z-10"
            >
              ← Back to Home
            </NeonButton>
            
            {/* Main Content - perfectly centered */}
            <div className="flex flex-col items-center justify-center flex-1">
              <h1 className="text-4xl font-bold text-center mb-3 bg-gradient-to-r from-space-blue to-space-green bg-clip-text text-transparent">
                CodeCollab
              </h1>
              <p className="text-center text-white/70 mb-8 text-base">
                Enter the collaborative coding platform
              </p>
              
              <div className="space-y-4 w-full">
                <input
                  type="text"
                  placeholder="Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-space-blue transition-colors"
                />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-space-blue transition-colors"
                />
                <NeonButton 
                  className="w-full mt-6" 
                  variant="primary" 
                  size="lg" 
                  onClick={joinRoom}
                >
                  Launch into Space
                </NeonButton>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SpaceBackground />
      <div className="h-screen flex">
        <aside className="w-80 min-w-72 p-6 bg-white/5 backdrop-blur-2xl border-r border-white/10 overflow-y-auto flex flex-col">
  
          {/* Room ID Section */}
          <GlassPanel className="p-4 mb-6">
            <h2 className="text-lg font-bold mb-4">Code Room: {roomId}</h2>
            <div className="flex justify-center">
              <NeonButton variant="accent" size="md" onClick={copyRoomId}>
                Copy Room ID
              </NeonButton>
            </div>
            {copySuccess && (
              <div className="mt-2 text-center">
                <span className="text-space-green text-xs">{copySuccess}</span>
              </div>
            )}
          </GlassPanel>
  
          {/* Language Selection */}
          <GlassPanel className="p-4 mb-6">
            <h3 className="text-base font-bold mb-2">Select Language</h3>
            <select
              className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:border-space-blue"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </GlassPanel>
  
          {/* Active Coders */}
          <GlassPanel className="p-4 mb-6 flex-1">
            <h3 className="text-base font-bold mb-2">Active Coders:</h3>
            <ul className="space-y-2 mb-4">
              {users.map((user, index) => (
                <li
                  key={index}
                  className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/80"
                >
                  {user.slice(0, 12)}...
                </li>
              ))}
            </ul>
            <p className="text-space-green text-sm mb-2 min-h-[20px]">{typing}</p>
          </GlassPanel>
  
          {/* Exit Button at Bottom */}
          <NeonButton
            className="w-full mt-auto bg-red-600 hover:bg-red-700 text-white border-red-500 hover:border-red-600"
            outline
            onClick={leaveRoom}
          >
            Exit Space
          </NeonButton>
        </aside>
  
        <main className="flex-1 relative">
          <div className="absolute inset-0">
            <Editor
              height={"100%"}
              defaultLanguage={language}
              language={language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderWhitespace: 'selection',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: true,
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
  
};

export default App;
