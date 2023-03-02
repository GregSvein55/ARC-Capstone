import requests

# Define the URL of the API endpoint
url = "http://54.196.227.93:5000/predict"

# Read the front and back image files
front_image = open("gsf.JPG", "rb")
back_image = open("gsb.JPG", "rb")

# Define the multipart/form-data fields for the request
data = {'front_image': front_image, 'back_image': back_image}

# Send the images to the API for prediction
response = requests.post(url, files=data)

# Print the response from the API
print(response.text)
