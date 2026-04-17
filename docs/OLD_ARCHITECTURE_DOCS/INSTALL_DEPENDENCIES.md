# Installing FastAPI Server Dependencies

## Quick Install

On your Raspberry Pi, run:

```bash
# Install Python dependencies
pip3 install -r requirements.txt

# OR if you prefer using a virtual environment (recommended):
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Manual Install (if requirements.txt doesn't work)

```bash
pip3 install fastapi uvicorn[standard] python-multipart pydantic pypdf pycups
```

## System Dependencies

You also need these system packages for PDF manipulation:

```bash
# Install pdftk (for page extraction)
sudo apt-get update
sudo apt-get install pdftk

# OR install qpdf (alternative to pdftk)
sudo apt-get install qpdf

# Install LibreOffice (for Office document conversion)
sudo apt-get install libreoffice

# Install ImageMagick (for image conversion)
sudo apt-get install imagemagick

# Install enscript and ps2pdf (for text file conversion)
sudo apt-get install enscript ghostscript
```

## Running the Server

After installing dependencies:

```bash
# If using virtual environment:
source venv/bin/activate

# Run the server
python3 main.py

# OR using uvicorn directly:
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Running as a Service (systemd)

If you want the server to run automatically on boot, create a systemd service file:

```bash
sudo nano /etc/systemd/system/fastapi-print.service
```

Add this content:

```ini
[Unit]
Description=FastAPI Print Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/Documents
Environment="PATH=/home/pi/Documents/venv/bin"
ExecStart=/home/pi/Documents/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable fastapi-print.service
sudo systemctl start fastapi-print.service
sudo systemctl status fastapi-print.service
```

