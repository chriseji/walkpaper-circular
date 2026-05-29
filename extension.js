import Gio from 'gi://Gio';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const WALLPAPERS_KEY = 'workspace-wallpapers';
const BACKGROUND_SCHEMA = 'org.gnome.desktop.background';
const PICTURE_URI_KEY = 'picture-uri';
const PICTURE_URI_DARK_KEY = 'picture-uri-dark';

export default class WalkpaperExtension extends Extension {
    _applyWallpaperForWorkspace(index) {
        let paths = this._settings.get_strv(WALLPAPERS_KEY);
        if (paths.length === 0) return;
        
        let wallpaper = paths[index % paths.length];
        if (wallpaper && wallpaper !== '') {
            this._backgroundSettings.set_string(PICTURE_URI_KEY, wallpaper);
            this._backgroundSettings.set_string(PICTURE_URI_DARK_KEY, wallpaper);
        }
    }

    _onWorkspaceSwitched(manager, from, to, direction) {
        this._applyWallpaperForWorkspace(to);
    }

    enable() {
        console.log("Walkpaper enable");
        this._settings = this.getSettings();
        this._backgroundSettings = new Gio.Settings({ schema_id: BACKGROUND_SCHEMA });

        let currentIndex = global.workspace_manager.get_active_workspace_index();
        this._applyWallpaperForWorkspace(currentIndex);

        this._wSwitchedSignalId = global.workspace_manager.connect(
            'workspace-switched', this._onWorkspaceSwitched.bind(this)
        );

        this._settingsChangedId = this._settings.connect(
            'changed::' + WALLPAPERS_KEY,
            () => {
                let idx = global.workspace_manager.get_active_workspace_index();
                this._applyWallpaperForWorkspace(idx);
            }
        );
    }

    disable() {
        console.log("Walkpaper disable");
        if (this._wSwitchedSignalId) {
            global.workspace_manager.disconnect(this._wSwitchedSignalId);
            this._wSwitchedSignalId = null;
        }
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }
        this._settings = null;
        this._backgroundSettings = null;
    }
}