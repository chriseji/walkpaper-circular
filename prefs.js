import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const WORKSPACE_COUNT_KEY = 'workspace-count';
const WALLPAPERS_KEY = 'workspace-wallpapers';

export default class WalkpaperPreferences extends ExtensionPreferences {
    
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: _('Wallpapers por Espacio de Trabajo'),
            description: _('Asigna un fondo de pantalla específico a cada uno de tus espacios de trabajo.')
        });
        page.add(group);

        const workspaceNum = settings.get_int(WORKSPACE_COUNT_KEY);
        const paths = settings.get_strv(WALLPAPERS_KEY);
        if (workspaceNum === 0) {
            const emptyRow = new Adw.ActionRow({
                title: _('No hay espacios de trabajo configurados')
            });
            group.add(emptyRow);
        } else {
            for (let i = 0; i < workspaceNum; i++) {
                const path = paths[i] || '';
                const row = this._createWorkspaceRow(i, path, settings, window);
                group.add(row);
            }
        }

        window.add(page);
    }

    _createWorkspaceRow(index, currentPath, settings, window) {
        const row = new Adw.ActionRow({
            title: _('Espacio de Trabajo') + ' ' + (index + 1),
            subtitle: currentPath || _('Fondo del sistema por defecto')
        });

        const button = new Gtk.Button({
            icon_name: 'document-open-symbolic',
            valign: Gtk.Align.CENTER,
            margin_top: 10,
            margin_bottom: 10
        });
        button.set_tooltip_text(_('Seleccionar imagen de fondo'));

        button.connect('clicked', () => {
            this._openFileDialog(index, row, settings, window);
        });

        row.add_suffix(button);

        const clearButton = new Gtk.Button({
            icon_name: 'edit-clear-symbolic',
            valign: Gtk.Align.CENTER,
            margin_top: 10,
            margin_bottom: 10
        });
        clearButton.add_css_class('flat');
        clearButton.set_tooltip_text(_('Volver al fondo por defecto'));

        clearButton.connect('clicked', () => {
            this._updateWallpaperSettings(index, '', settings, row);
        });

        row.add_suffix(clearButton);

        return row;
    }

    _openFileDialog(index, row, settings, window) {
        const dialog = new Gtk.FileDialog({
            title: _('Selecciona un fondo de pantalla')
        });

        const filter = new Gtk.FileFilter();
        filter.set_name(_("Imágenes"));
        filter.add_mime_type("image/png");
        filter.add_mime_type("image/jpeg");
        filter.add_mime_type("image/webp");
        filter.add_mime_type("image/svg+xml");
        filter.add_mime_type("image/bmp");
        filter.add_mime_type("image/tiff");
        dialog.set_default_filter(filter);

        dialog.open(window, null, (dialog, res) => {
            try {
                const file = dialog.open_finish(res);
                if (file) {
                    const newUri = file.get_uri(); 
                    this._updateWallpaperSettings(index, newUri, settings, row);
                }
            } catch (e) {
                console.log(`[Walkpaper] Dialog closed: ${e.message}`);
            }
        });
    }

    _updateWallpaperSettings(index, newUri, settings, row) {
        const paths = settings.get_strv(WALLPAPERS_KEY);
        
        while (paths.length <= index) {
            paths.push('');
        }
        
        paths[index] = newUri;
        settings.set_strv(WALLPAPERS_KEY, paths);
        
        row.set_subtitle(newUri || _('Fondo del sistema por defecto'));
    }
}