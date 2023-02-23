from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
#import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np
import pandas as pd
##import pytesseract
#import cv2
#import matplotlib.pyplot as plt TEST ONLY
import os

app = Flask(__name__)
CORS(app)

#pathToTesseract = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe" WINDOWS
# pathToTesseract = "/usr/bin/tesseract" #LINUX
# pytesseract.tesseract_cmd = pathToTesseract

# Load the Keras model
# Model info:
# This model takes in an image rotated 90 degrees counter-clockwise
# Height: 1008 pixels, Width: 756 pixels
# If the image is not to these specifications, the model will be inaccurate
model = load_model('ARC_Model_Front_3.h5', compile=False)

# Read the CSV file into a DataFrame
dfModel = pd.read_csv('modelProductList.csv')
# Read the CSV file into a DataFrame
#dfAll = pd.read_csv('ARCProductList.csv')

# Get the unique values in the 'Product' column
class_labels = dfModel['Product'].unique()



@app.route('/predict', methods=['POST'])
@cross_origin()
def predict():  
    
   # Get front input data from the request
    front_image = Image.open(request.files['front_image'])
    front_image.save("front_image.png") # save image as png
    front_image = Image.open("front_image.png")

    # Get back input data from the request
    back_image = Image.open(request.files['back_image'])
    back_image.save("back_image.png") # save image as png
    back_image = Image.open("back_image.png")
    
    #Differentiate between .jpg and .png files
    # filename, extension = os.path.splitext(request.files['front_image'].filename)
    # if extension.lower() in ['.JPG', '.jpg']:
    #     # Rotating to be able to read the text
    #     front_image = front_image.rotate(270)
    #     # plt.imshow(front_image) TEST ONLY
    #     # plt.show()
    # elif extension.lower() == '.png':
    #     # No rotation necesary for .png files
    #     pass
    #     # plt.imshow(front_image) TEST ONLY
    #     # plt.show()
    # else:
    #     print("Image type not supported")
    #     return jsonify('Image type not supported. Please use .JPG or .png')
    
    #Scan image for text
    #text = pytesseract.image_to_string(front_image)

    # Split the text into a list of words
    #words = text.split()

    checker = None
    product = None
    confidence = 0.0
    brand = None
    thc = None
    cbd = None
    strain = None
    
    # Iterate over the words with a sliding window
    # for i in range(len(words)):
    #     for j in range(i+1, len(words)+1):
    #         checker = " ".join(words[i:j])
    #         if dfAll[(dfAll['Product'] == checker)].empty:
    #             continue
    #         else:
    #             # Get the rows where the 'Product' column is equal to the word
    #             row = dfAll[(dfAll['Product'] == checker)]
    #             confidence = 99
    #             product = row['Product'].values[0]
    #             brand = row['Brand'].values[0]
    #             thc = row['THC'].values[0]
    #             cbd = row['CBD'].values[0]
    #             strain = row['Type'].values[0]
    #END OF OCR CODE   
                 
    if product is None:
        # Re grab the image from the request
        front_image = Image.open(request.files['front_image'])
        
        # Initialize an empty array to store the preprocessed images
        X_test = np.zeros((1, 1008, 756, 3), dtype=np.float32)
        
        #Differentiate between .jpg and .png files
        filename, extension = os.path.splitext(request.files['front_image'].filename)
        if extension.lower() in ['.JPG', '.jpg']:
            # Resize the image to 756x1008 pixels 
            front_image = front_image.resize((756,1008))
            # plt.imshow(front_image) TEST ONLY
            # plt.show()
        elif extension.lower() == '.png':
            # Resize the image to 1008x756 pixels and rotate it 90 degrees
            front_image = front_image.resize((1008,756))
            front_image = front_image.rotate(90, expand=True)
            # plt.imshow(front_image) TEST ONLY
            # plt.show()
        else:
            print("Image type not supported")
            return jsonify('Image type not supported. Please use .JPG or .png')
        
        # Convert the image to a NumPy array
        # DO NOT SCALE THE PIXEL VALUES TO [0, 1], AS VALUES ARE ALREADY IN THIS RANGE
        img_array = img_to_array(front_image)

        # Add the preprocessed image to the array
        X_test[0] = img_array
        
        # Make predictions on the test images       
        y_pred = model.predict(X_test, batch_size=1)
        
        # Get the predicted class label and confidence
        class_index = np.argmax(y_pred[0])
        class_label = class_labels[class_index]
        confidence = y_pred[0][np.argmax(y_pred)]
        confidence = confidence * 100
        confidence = round(confidence, 2)

        # Get the rows where the 'Product' column is equal to the predicted class label
        row = dfModel.loc[dfModel['Product'] == class_label]

        product = row['Product'].values[0]
        brand = row['Brand'].values[0]
        thc = row['THC'].values[0]
        cbd = row['CBD'].values[0]
        strain = row['Type'].values[0]
        
        if confidence >= 100:
            confidence = 99.99
        
        if confidence < 80:
            class_label = 'Potential New Product'
            product = 'Unknown'
            brand = 'Unknown'
            thc = 'Unknown'
            cbd = 'Unknown'
            strain = 'Unknown'
    #END OF ML CODE


       
    # Return the product details as a JSON response
    return jsonify({"confidence": str(confidence),
                    "product": str(product),
                    "brand": str(brand),
                    "thc": str(thc),
                    "cbd": str(cbd),
                    "strain": str(strain)})
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)