import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const WALLPAPERS_KEY = 'workspace-wallpapers';

function getImagesFilter() {
    const filter = new Gtk.FileFilter();
    filter.set_name(_("Imágenes"));
    filter.add_mime_type("image/png");
    filter.add_mime_type("image/jpeg");
    filter.add_mime_type("image/webp");
    filter.add_mime_type("image/svg+xml");
    return filter;
}

export default class WalkpaperPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {

        const settings = this.getSettings();
        const page = new Adw.PreferencesPage();
        window.add(page);

        let currentGroup = null;

        const refreshUI = () => {
            if (currentGroup) {
                page.remove(currentGroup);
            }

            currentGroup = new Adw.PreferencesGroup({
                title: _('Fondos de los espacios de trabajo'),
                description: _('Configura los fondos que se asignarán a los espacios de trabajo.')
            });
            page.add(currentGroup);

            let paths = settings.get_strv(WALLPAPERS_KEY);

            for (let i = 0; i < paths.length; i++) {
                const row = new Adw.ActionRow({
                    title: _('Fondo') + ' ' + (i + 1),
                    subtitle: paths[i] || _('Sin fondo')
                });

                const openBtn = new Gtk.Button({ icon_name: 'document-open-symbolic', valign: Gtk.Align.CENTER });
                openBtn.connect('clicked', () => openFileDialog(i));
                row.add_suffix(openBtn);

                const deleteBtn = new Gtk.Button({ icon_name: 'user-trash-symbolic', valign: Gtk.Align.CENTER });
                deleteBtn.add_css_class('destructive-action');
                deleteBtn.connect('clicked', () => removeWallpaper(i));
                row.add_suffix(deleteBtn);

                currentGroup.add(row);
            }

            const addRow = new Adw.ActionRow({ title: _('Añadir fondo') });
            const addBtn = new Gtk.Button({ icon_name: 'list-add-symbolic', valign: Gtk.Align.CENTER });
            addBtn.connect('clicked', () => appendNewWallpaper());
            addRow.add_suffix(addBtn);
            currentGroup.add(addRow);
        };

        const appendNewWallpaper = () => {
            const dialog = new Gtk.FileDialog({ title: _('Selecciona un fondo') });
            dialog.set_default_filter(getImagesFilter());

            dialog.open(window, null, (dialog, res) => {
                try {
                    const file = dialog.open_finish(res);
                    if (file) {
                        let paths = settings.get_strv(WALLPAPERS_KEY);
                        paths.push(file.get_uri());
                        settings.set_strv(WALLPAPERS_KEY, paths);
                        refreshUI();
                    }
                } catch (e) {
                    console.log(`[Walkpaper] Cancelado: ${e.message}`);
                }
            });
        };

        const openFileDialog = (index) => {
            const dialog = new Gtk.FileDialog({ title: _('Selecciona un fondo') });
            dialog.set_default_filter(getImagesFilter());

            dialog.open(window, null, (dialog, res) => {
                try {
                    const file = dialog.open_finish(res);
                    if (file) {
                        let paths = settings.get_strv(WALLPAPERS_KEY);
                        paths[index] = file.get_uri();
                        settings.set_strv(WALLPAPERS_KEY, paths);
                        refreshUI();
                    }
                } catch (e) {
                    console.log(`[Walkpaper] Cancelado: ${e.message}`);
                }
            });
        };

        const removeWallpaper = (index) => {
            let paths = settings.get_strv(WALLPAPERS_KEY);
            paths.splice(index, 1);
            settings.set_strv(WALLPAPERS_KEY, paths);
            refreshUI();
        };

        refreshUI();
    }
}