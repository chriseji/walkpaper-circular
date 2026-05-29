import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const WALLPAPERS_KEY = 'workspace-wallpapers';

export default class WalkpaperPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {

        this.settings = this.getSettings(); 
        this._buildUI(window);

        window.connectObject(
            'close-request',
            () => {
                this._cleanup(window);
                return false;
            },
            this
        );
    }

    _cleanup(window) {
        window.disconnectObject(this);

        if (this.page) {
            window.remove(this.page);
            this.page = null;
        }
        this.group = null;
        this.settings = null;
    }

    _buildUI(window) {
        if (this.page) {
            window.remove(this.page);
        }

        this.page = new Adw.PreferencesPage();
        window.add(this.page);

        this.group = new Adw.PreferencesGroup({
            title: _('Lista circular de fondos'),
            description: _('Define los fondos que se asignarán a los espacios de trabajo en orden circular.')
        });
        this.page.add(this.group);

        let paths = this.settings.get_strv(WALLPAPERS_KEY);

        for (let i = 0; i < paths.length; i++) {
            this._addRow(i, paths[i], window);
        }

        const addRow = new Adw.ActionRow({ title: _('Añadir fondo') });
        const addBtn = new Gtk.Button({ icon_name: 'list-add-symbolic', valign: Gtk.Align.CENTER });
        addBtn.connect('clicked', () => this._appendNewWallpaper(window));
        addRow.add_suffix(addBtn);
        this.group.add(addRow);
    }

    _addRow(index, currentPath, window) {
        const row = new Adw.ActionRow({
            title: _('Fondo') + ' ' + (index + 1),
            subtitle: currentPath || _('Sin fondo')
        });

        const openBtn = new Gtk.Button({ icon_name: 'document-open-symbolic', valign: Gtk.Align.CENTER });
        openBtn.connect('clicked', () => this._openFileDialog(index, window));
        row.add_suffix(openBtn);

        const deleteBtn = new Gtk.Button({ icon_name: 'user-trash-symbolic', valign: Gtk.Align.CENTER });
        deleteBtn.add_css_class('destructive-action');
        deleteBtn.connect('clicked', () => this._removeWallpaper(index, window));
        row.add_suffix(deleteBtn);

        this.group.add(row);
    }

    _appendNewWallpaper(window) {
        const dialog = new Gtk.FileDialog({ title: _('Selecciona un fondo') });
        const filter = new Gtk.FileFilter();
        filter.set_name(_("Imágenes"));
        filter.add_mime_type("image/png");
        filter.add_mime_type("image/jpeg");
        filter.add_mime_type("image/webp");
        filter.add_mime_type("image/svg+xml");
        dialog.set_default_filter(filter);

        dialog.open(window, null, (dialog, res) => {
            try {
                const file = dialog.open_finish(res);
                if (file) {
                    let paths = this.settings.get_strv(WALLPAPERS_KEY);
                    paths.push(file.get_uri());
                    this.settings.set_strv(WALLPAPERS_KEY, paths);
                    this._buildUI(window);
                }
            } catch (e) {
                console.log(`[Walkpaper] Cancelado: ${e.message}`);
            }
        });
    }

    _openFileDialog(index, window) {
        const dialog = new Gtk.FileDialog({ title: _('Selecciona un fondo') });
        const filter = new Gtk.FileFilter();
        filter.set_name(_("Imágenes"));
        filter.add_mime_type("image/png");
        filter.add_mime_type("image/jpeg");
        filter.add_mime_type("image/webp");
        filter.add_mime_type("image/svg+xml");
        dialog.set_default_filter(filter);

        dialog.open(window, null, (dialog, res) => {
            try {
                const file = dialog.open_finish(res);
                if (file) {
                    let paths = this.settings.get_strv(WALLPAPERS_KEY);
                    paths[index] = file.get_uri();
                    this.settings.set_strv(WALLPAPERS_KEY, paths);
                    this._buildUI(window);
                }
            } catch (e) {
                console.log(`[Walkpaper] Cancelado: ${e.message}`);
            }
        });
    }

    _removeWallpaper(index, window) {
        let paths = this.settings.get_strv(WALLPAPERS_KEY);
        paths.splice(index, 1);
        this.settings.set_strv(WALLPAPERS_KEY, paths);
        this._buildUI(window);
    }
}