# -----------------------------------------------------------------
# start_tracker.py
#
# Purpose: Runs the central Tracker server.
# This server *only* manages the list of active peers.
# -----------------------------------------------------------------

# File hỗ trợ cho tracker server
import argparse
import json
from daemon.weaprous import WeApRous # Required for the app framework

# --- GLOBAL VARIABLE ---
# Use a dictionary to store the peer list.
# Format: { 'username': { 'ip': 'xxx', 'port': 'yyy' } }
PEER_LIST = {}

# --- TRACKER SERVER CONFIGURATION ---
# Create a new WeApRous application
app = WeApRous()

# Default port for the Tracker
DEFAULT_TRACKER_PORT = 8001 

# --- TRACKER API ENDPOINTS ---

@app.route('/', methods=['GET'])
def tracker_home(headers, body):
    """
    Basic API to check if the Tracker is alive.
    """
    print("[Tracker] GET / request (Health Check)")
    response_body = "<html><body><h1>Tracker Server is running.</h1></body></html>"
    
    # Build a basic HTTP response
    response = "HTTP/1.1 200 OK\r\n"
    response += "Content-Type: text/html\r\n"
    response += f"Content-Length: {len(response_body)}\r\n"
    response += "\r\n"
    response += response_body
    return response

@app.route('/submit-info/', methods=['POST'])
def submit_info(headers, body):
    """
    API for a peer to register or update its info.
    Peer sends a JSON body: {'username': 'user1', 'ip': '127.0.0.1', 'port': 8000}
    """
    print(f"[Tracker] POST /submit-info/ request with body: {body}")
    try:
        # Parse the body (assuming JSON)
        peer_data = json.loads(body)
        username = peer_data.get('username')
        ip = peer_data.get('ip')
        port = peer_data.get('port')

        if not username or not ip or not port:
            raise ValueError("Missing username, ip, or port")

        # Update the PEER_LIST
        PEER_LIST[username] = {
            'ip': ip,
            'port': port
        }
        
        print(f"[Tracker] Updated peer: {username}. Total peers: {len(PEER_LIST)}")
        
        # Return success (JSON)
        response_body = json.dumps({"status": "success", "message": f"{username} has been registered."})
        response = "HTTP/1.1 200 OK\r\n"
        response += "Content-Type: application/json\r\n"
        response += f"Content-Length: {len(response_body)}\r\n"
        response += "\r\n"
        response += response_body
        
    except Exception as e:
        print(f"[Tracker] Error processing /submit-info/: {e}")
        response_body = json.dumps({"status": "error", "message": str(e)})
        response = "HTTP/1.1 400 Bad Request\r\n"
        response += "Content-Type: application/json\r\n"
        response += f"Content-Length: {len(response_body)}\r\n"
        response += "\r\n"
        response += response_body

    return response


@app.route('/get-list/', methods=['GET'])
def get_list(headers, body):
    """
    API for a peer to get the list of all active peers.
    """
    print(f"[Tracker] GET /get-list/ request. Returning {len(PEER_LIST)} peers.")
    
    # Return the entire PEER_LIST as JSON
    response_body = json.dumps(PEER_LIST)
    
    response = "HTTP/1.1 200 OK\r\n"
    response += "Content-Type: application/json\r\n"
    response += f"Content-Length: {len(response_body)}\r\n"
    response += "\r\n"
    response += response_body
    
    return response

@app.route('/add-list', methods=['POST'])
def add_list(headers, body):
    """
    Handle adding to a list via POST request.

    This route simulates adding an item to a list and prints the provided headers
    and body to the console.

    :param headers (str): The request headers or user identifier.
    :param body (str): The request body or payload.
    """
    print ("[SampleApp] ['POST'] Add list in {} to {}".format(headers, body))

@app.route('/connect-peer', methods=['POST'])
def connect_peer(headers, body):
    """
    Handle peer connection via POST request.

    This route simulates connecting to a peer and prints the provided headers
    and body to the console.

    :param headers (str): The request headers or user identifier.
    :param body (str): The request body or payload.
    """
    print ("[SampleApp] ['POST'] Connect peer in {} to {}".format(headers, body))

@app.route('broadcast-peer', methods=['POST'])
def broadcast_peer(headers, body):
    """
    Handle peer broadcasting via POST request.

    This route simulates broadcasting to peers and prints the provided headers
    and body to the console.

    :param headers (str): The request headers or user identifier.
    :param body (str): The request body or payload.
    """
    print ("[SampleApp] ['POST'] Broadcast peer in {} to {}".format(headers, body))

@app.route('/send-peer', methods=['POST'])
def send_peer(headers, body):
    """
    Handle sending data to a peer via POST request.

    This route simulates sending data to a peer and prints the provided headers
    and body to the console.

    :param headers (str): The request headers or user identifier.
    :param body (str): The request body or payload.
    """
    print ("[SampleApp] ['POST'] Send peer in {} to {}".format(headers, body))

# --- START THE SERVER ---
if __name__ == "__main__":
    # Set up argparse to get IP and Port from command line
    parser = argparse.ArgumentParser(prog='TrackerServer', description='Central Tracker Server for Chat Application.')
    parser.add_argument('--server-ip', default='0.0.0.0', help='IP for the tracker to listen on (default: 0.0.0.0)')
    parser.add_argument('--server-port', type=int, default=DEFAULT_TRACKER_PORT, help=f'Port for the tracker to listen on (default: {DEFAULT_TRACKER_PORT})')
    
    args = parser.parse_args()
    ip = args.server_ip
    port = args.server_port

    print("-----------------------------------")
    print(f"🚀 Starting Tracker Server...")
    print(f"   Listening IP:   {ip}")
    print(f"   Listening Port: {port}")
    print("-----------------------------------")

    # Prepare the address and run the WeApRous app
    app.prepare_address(ip, port)
    app.run()