#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
import functools
import qrcode
import subprocess

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    try:
        out = subprocess.check_output("ifconfig | grep 'inet ' | grep -v '127.0.0.1'", shell=True).decode()
        for line in out.strip().split('\n'):
            parts = line.strip().split()
            if len(parts) >= 2 and parts[0] == 'inet':
                return parts[1]
    except Exception:
        pass
    return "127.0.0.1"

def main():
    os.chdir(DIRECTORY)
    local_ip = get_local_ip()
    app_url = f"http://{local_ip}:{PORT}/"

    print("\n" + "="*56)
    print(" 🚀  APLIKASI KEUANGAN 'DOMPETKU' SIAP DIGUNAKAN")
    print("="*56)
    print(f"\n📱 ALAMAT UNTUK DIBUKA DI BROWSER HP:")
    print(f"👉 \033[1;32m{app_url}\033[0m")
    print(f"\n💻 Alamat di Laptop/Komputer:")
    print(f"👉 http://localhost:{PORT}/")
    print("\n" + "-"*56)
    print("📷 SCAN QR CODE INI LANGSUNG DENGAN KAMERA HP:")
    print("-" * 56)

    try:
        qr = qrcode.QRCode(box_size=1, border=1)
        qr.add_data(app_url)
        qr.make(fit=True)
        qr.print_ascii(invert=True)

        img = qrcode.make(app_url)
        img.save(os.path.join(DIRECTORY, "qr_buka_di_hp.png"))
        print("\n(Gambar QR Code juga tersimpan di: dompet-pns/qr_buka_di_hp.png)")
    except Exception as e:
        print("QR Code tidak dapat ditampilkan:", e)

    print("\n" + "="*56)
    print("📌 CARA PASANG KE LAYAR UTAMA (HOMESCREEN) HP:")
    print("• Di iPhone (Safari): Tekan ikon 'Share' (kotak panah ke atas) -> pilih 'Add to Home Screen'")
    print("• Di Android (Chrome): Tekan titik 3 kanan atas -> pilih 'Install App' / 'Tambahkan ke Layar Utama'")
    print("="*56)
    print("\nMenjalankan server... Tekan Ctrl+C untuk berhenti.\n")

    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer dihentikan.")
        sys.exit(0)

if __name__ == "__main__":
    main()
