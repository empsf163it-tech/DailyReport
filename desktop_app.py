import os
import sys
import webview

def main():
    # Determine base directory whether running as raw script or PyInstaller bundle
    if getattr(sys, 'frozen', False):
        base_dir = sys._MEIPASS
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))

    html_file = os.path.join(base_dir, 'index.html')

    # Launch desktop webview window with persistent storage (localStorage enabled)
    window = webview.create_window(
        title='Daily Work Report & WhatsApp Generator',
        url=f'file://{html_file}',
        width=1300,
        height=880,
        resizable=True,
        min_size=(950, 650)
    )
    # private_mode=False ensures localStorage persists across sessions on disk
    webview.start(private_mode=False)

if __name__ == '__main__':
    main()
