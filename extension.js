import Gio from 'gi://Gio';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const WORKSPACE_COUNT_KEY = 'workspace-count';
const WORKSPACE_INDEX = 'workspace-index';
const WALLPAPERS_KEY = 'workspace-wallpapers';
const BACKGROUND_SCHEMA = 'org.gnome.desktop.background';

// Claves para el tema claro y oscuro
const PICTURE_URI_KEY = 'picture-uri';
const PICTURE_URI_DARK_KEY = 'picture-uri-dark';

export default class WalkpaperExtension extends Extension {
    debugLog(s) {
        // console.debug(`[Walkpaper] ${s}`);
    }

    _restoreCurrentWallpaper() {
        let paths = this._settings.get_strv(WALLPAPERS_KEY);
        let index = global.workspace_manager.get_active_workspace_index();
        let wallpaper = paths[index];

        if (!wallpaper && paths.length > 0) {
            wallpaper = paths[0]; 
        }

        if (wallpaper) {
            //Sicroniza los fondos ya sea para tema claro u oscuro (no permite tener fondos diferentes para cada tema, pero es lo que hay)
            this._backgroundSettings.set_string(PICTURE_URI_KEY, wallpaper);
            this._backgroundSettings.set_string(PICTURE_URI_DARK_KEY, wallpaper);
        }
    }

    _changeWallpaper() {
        this.debugLog("changeWallpaper");
        
        let paths = this._settings.get_strv(WALLPAPERS_KEY);
        let index = this._settings.get_int(WORKSPACE_INDEX);

        this.debugLog("Walkpaper change from WS " + index);
        let wallpaper = this._backgroundSettings.get_string(PICTURE_URI_KEY);

        while (paths.length <= index) {
            paths.push(wallpaper);
        }
        paths[index] = wallpaper;

        // Se bloquea la señal temporalmente para evitar que el listener en tiempo real cause un bucle
        this._settings.block_signal_handler(this._settingsChangedId);
        this._settings.set_strv(WALLPAPERS_KEY, paths);
        this._settings.unblock_signal_handler(this._settingsChangedId);

        index = global.workspace_manager.get_active_workspace_index();
        this.debugLog("Walkpaper change to WS " + index);

        wallpaper = paths[index];
        if (!wallpaper) {
            wallpaper = paths[0];
        }

        this.debugLog("Walkpaper set wallpaper to " + wallpaper);
        this._backgroundSettings.set_string(PICTURE_URI_KEY, wallpaper);
        this._backgroundSettings.set_string(PICTURE_URI_DARK_KEY, wallpaper);

        this._changeIndex();
    }

    _changeIndex() {
        let index = global.workspace_manager.get_active_workspace_index();
        this._settings.set_int(WORKSPACE_INDEX, index);
    }

    _workspaceNumChanged() {
        let newCount = global.workspace_manager.get_n_workspaces();
        let oldCount = this._settings.get_int(WORKSPACE_COUNT_KEY);
        this._settings.set_int(WORKSPACE_COUNT_KEY, newCount);

        if (newCount < oldCount) {
            let paths = this._settings.get_strv(WALLPAPERS_KEY);
            if (paths.length > newCount) {
                paths = paths.slice(0, newCount);
                
                this._settings.block_signal_handler(this._settingsChangedId);
                this._settings.set_strv(WALLPAPERS_KEY, paths);
                this._settings.unblock_signal_handler(this._settingsChangedId);
            }
        }
    }

    enable() {
        console.log("Walkpaper enable");

        this._settings = this.getSettings();
        this._backgroundSettings = new Gio.Settings({ schema_id: BACKGROUND_SCHEMA });

        this._changeIndex();
        this._workspaceNumChanged();

        // Escucha cambios desde prefs.js en tiempo real
        this._settingsChangedId = this._settings.connect(
            'changed::' + WALLPAPERS_KEY, 
            this._restoreCurrentWallpaper.bind(this)
        );

        this._restoreCurrentWallpaper();

        this._wSwitchedSignalId = global.workspace_manager.connect(
            'workspace-switched', this._changeWallpaper.bind(this)
        );
        this._wAddedSignalId = global.workspace_manager.connect(
            'workspace-added', this._workspaceNumChanged.bind(this)
        );
        this._wRemovedSignalId = global.workspace_manager.connect(
            'workspace-removed', this._workspaceNumChanged.bind(this)
        );
    }

    disable() {
        console.log("Walkpaper disable");

        if (this._wSwitchedSignalId) {
            global.workspace_manager.disconnect(this._wSwitchedSignalId);
            this._wSwitchedSignalId = null;
        }
        if (this._wAddedSignalId) {
            global.workspace_manager.disconnect(this._wAddedSignalId);
            this._wAddedSignalId = null;
        }
        if (this._wRemovedSignalId) {
            global.workspace_manager.disconnect(this._wRemovedSignalId);
            this._wRemovedSignalId = null;
        }
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        this._settings = null;
        this._backgroundSettings = null;
    }
}