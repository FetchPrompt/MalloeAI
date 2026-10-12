const {app, BrowserWindow, Menu} = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const PORT = 8080;
const ROOT_DIR = path.join(__dirname, "..");
const SERVER_PATH = path.join(ROOT_DIR, "bin", "llama-server.exe");
const MODEL_PATH = path.join(ROOT_DIR, "models", "qwen2.5-1.5b-instruct-q4_k_m.gguf");
let serverProcess = null;

function createWindow(){
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        icon: path.join(ROOT_DIR, "assets", "icon.ico"),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    })
    win.loadFile(path.join(__dirname, "index.html"));
}

app.on("window-all-closed", () => {
    if(process.platform !== "darwin"){
        app.quit();
    }
});

function startServer(){
    serverProcess = spawn(SERVER_PATH, ["-m", MODEL_PATH, "--host", "127.0.0.1", "--port", String(PORT), "-c", "2048"], { cwd: path.dirname(SERVER_PATH), windowsHide: true});
    serverProcess.stdout.on("data", (data) => console.log("[llama] " + data.toString()));
    serverProcess.stderr.on("data", (data) => console.log("[llama] " + data.toString()));
    serverProcess.on("error", (err) => console.error("Failed to start llama-server: ", err));
    serverProcess.on("exit", (code, signal) => {console.log(`llama-server exited (code: ${code}, signal: ${signal})`); 
    serverProcess = null;
    });
}

app.whenReady().then(() => {
    startServer();
    Menu.setApplicationMenu(null);
    createWindow();
});

app.on("before-quit", () => {
    if(serverProcess !== null){
        serverProcess.kill();
    }
});