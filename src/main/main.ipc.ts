import { BrowserWindow, ipcMain as ipc, remote, MenuItem } from 'electron'
import contextMenu from './contextMenu'

let coords: {x: number, y: number}

contextMenu.append(new MenuItem({
  label: 'Open Dev Tools',
  click: (...args) => {
    const window = BrowserWindow.getFocusedWindow()
    window && window.webContents.openDevTools()
  }
}))

contextMenu.append(new MenuItem({
  label: 'Inspect Element',
  click: (...args) => {
    const window = BrowserWindow.getFocusedWindow()
    window && window.webContents.openDevTools()
    window && window.webContents.inspectElement(coords.x, coords.y)
  }
}))

ipc.on('show-context-menu', (event: Electron.Event, point: {x: number, y: number}) => {
  coords = point
  
  const win = BrowserWindow.fromWebContents(event.sender)
  contextMenu.popup({window: win})
})
