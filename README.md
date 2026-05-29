# Walkpaper Circular

## About:
Have a different wallpaper on each GNOME workspace.

*Note: This project is a modernized fork of the original [Walkpaper](https://www.google.com/search?q=https://github.com/BlinkBP/walkpaper) extension by BlinkBP, completely rewritten to support GNOME 42+ (up to GNOME 50), Wayland, ESM modules, and GTK4/Libadwaita.*

## Installation:

Download the `walkpaper3@chriseji.github.com.shell-extension.zip` file from the [Releases](https://www.google.com/search?q=../../releases) page and install it via terminal:

```
    # gnome-extensions install walkpaper3@chriseji.github.com.shell-extension.zip

```

Important for Wayland users: Log out of your current session and log back in to allow GNOME to detect the new extension. Enable it using the GNOME "Extensions" app or via terminal (`gnome-extensions enable walkpaper3@chriseji.github.com`).

If you want to pack it yourself directly from the source code, clone the repository and run:

```
    # glib-compile-schemas schemas/
    # gnome-extensions pack --extra-source=schemas/

```

For setting wallpapers:

You need open the extension's preferences (gear icon in the Extensions app) and assign specific wallpapers to each workspace using the native GTK4 file chooser.

Remember that you can always manage your extensions from [https://extensions.gnome.org/local/](https://www.google.com/search?q=https://extensions.gnome.org/local/)

## Credits:

Original concept and logic by BlinkBP. Modernization, GTK4 port, and Wayland support by chriseji.

## License:

This project is licensed under the GNU License - see the [LICENSE]() file for details.
