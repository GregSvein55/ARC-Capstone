# wsgi.py
# This file is used to run the application on a web server
# Run `python wsgi.py` to start the server on all interfaces on port 5000
# This includes your public IP address
from app import app

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True) # Change debug to False before deploying
