const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    tittle: "LocalPDF Manager",
    icon: path.join(__dirname, 'LocalPDFManagerLogo.png'),
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Ini bakal ngebaca hasil build dari folder 'dist'
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});