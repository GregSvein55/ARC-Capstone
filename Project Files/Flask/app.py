from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image, ImageFilter
import numpy as np
import pandas as pd
import pytesseract
import os
import datetime
import re


app = Flask(__name__)
CORS(app)

# To set Tesseract to English
config = '-l eng'

# Load the Keras model
# Model info:
# This model takes in an image rotated 90 degrees counter-clockwise
# Height: 1008 pixels, Width: 756 pixels
# If the image is not to these specifications, the model will be inaccurate
model = load_model('ARC_Model_Front_3.h5', compile=False)

# Read the CSV file into a DataFrame
dfModel = pd.read_csv('modelProductList.csv')
# Read the CSV file into a DataFrame
dfAll = pd.read_csv('ARCProductList.csv')

# Get the unique values in the 'Product' column
class_labels = dfModel['Product'].unique()

# The regular expression pattern to search for a number after 'THC Total' and 'CBD total'
patternTHC = r"(?i)THC\s+Total\s*:?\s*(\d+(?:\.\d+)?)"
patternCBD = r"(?i)CBD\s+Total\s*:?\s*(\d+(?:\.\d+)?)"




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
    
    
    # Differentiate between .jpg and .png files
    filename, extension = os.path.splitext(request.files['front_image'].filename)
    if extension.lower() in ['.JPG', '.jpg']:
        # Rotating to be able to read the text
        front_image = front_image.rotate(270)
        # plt.imshow(front_image) TEST ONLY
        # plt.show()
    elif extension.lower() == '.png':
        # No rotation necesary for .png files
        pass
        # plt.imshow(front_image) TEST ONLY
        # plt.show()
    else:
        print("Image type not supported")
        return jsonify('Image type not supported. Please use .JPG or .png')
    
    
    # Preprocess the front image
    front_image = front_image.filter(ImageFilter.SHARPEN)
    front_image = front_image.convert('L')  # convert to grayscale
    front_image = front_image.resize((front_image.width // 2, front_image.height // 2))  # resize the image
    
    
    # Scan image for text using Tesseract 
    # Runtime 2-3 seconds
    text = pytesseract.image_to_string(front_image, config=config)

    # Split the text into a list of words
    words = text.split()

    # Initialize variables
    product = None
    confidence = 0.0
    brand = None
    thc = None
    cbd = None
    strain = None
    temp = None
    
    # Create a dictionary that maps products to their rows in the DataFrame 
    # Runtime <0.1 seconds
    product_to_rows = {}
    for i, row in dfAll.iterrows():
        temp = row['Product']
        if temp not in product_to_rows:
            product_to_rows[temp] = []
        product_to_rows[temp].append(row)
    

    # GET PRODUCT NAME  
    # Runtime 0.1 seconds
    # Iterate over the words with a sliding window and look up the product in the dictionary
    for i in range(len(words)):
        for j in range(i+1, len(words)+1):
            temp = " ".join(words[i:j])
            if temp not in product_to_rows:
                continue
            rows = product_to_rows[temp]
            for row in rows:
                confidence = 99.99
                product = row['Product']
                brand = row['Brand']
                thc = row['THC']
                cbd = row['CBD']
                strain = row['Type']
        
    
    # GET THC AND CBD VALUES 
    # Run time <0.1 seconds
    # Find the number in the text using regular expressions
    matchTHC = re.search(patternTHC, text)
    matchCBD = re.search(patternCBD, text)


    # If a number is found, convert it to float, divide by 10, and round to 2 decimal points
    if matchTHC:
        
        thc_total = round(float(matchTHC.group(1)) / 10, 2)
        
        if thc_total > 50: # Check twice as the decimal point may be missing
            thc_total /= 10
        if thc_total > 50:
            thc_total /= 10
            
        thc = thc_total

        
    if matchCBD:
        cbd_total = round(float(matchCBD.group(1)) / 10, 2)
        
        if cbd_total > 50: # Check twice as the decimal point may be missing
            cbd_total /= 10
        if cbd_total > 50:
            cbd_total /= 10
            
        if cbd_total < 1:
            cbd_total = "<1"
            
        cbd = cbd_total
    
    
    #END OF OCR CODE   
                 
    if product is None or product == "\u2018nada":
        # Re grab the image from the request
        front_image = Image.open(request.files['front_image'])
        
        # Initialize an empty array to store the preprocessed images
        X_test = np.zeros((1, 1008, 756, 3), dtype=np.float32)
        
        #Differentiate between .jpg and .png files
        filename, extension = os.path.splitext(request.files['front_image'].filename)
        if extension.lower() in ['.JPG', '.jpg']:
            # Resize the image to 756x1008 pixels 
            front_image = front_image.resize((756,1008))
            
        elif extension.lower() == '.png':
            # Resize the image to 1008x756 pixels and rotate it 90 degrees
            front_image = front_image.resize((1008,756))
            front_image = front_image.rotate(90, expand=True)
           
        else:
            print("Image type not supported")
            return jsonify('Image type not supported. Please use .JPG or .png')
        
        directory = "/images"
        curr_datetime = datetime.datetime.now().strftime("%Y%m%d%H%M%S") # get current date and time
        front_image.save(directory + "front_image" + curr_datetime + ".png") # save image as png
        back_image.save(directory +"back_image" + curr_datetime + ".png") # save image as png
        
        
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
        if thc is None:
            thc = row['THC'].values[0]
        if cbd is None:
            cbd = row['CBD'].values[0]
        strain = row['Type'].values[0]
        
        if confidence >= 100:
            confidence = 99.99
        
        if confidence < 80:
            class_label = 'Potential New Product'
            product = 'Potential New Product'
            brand = 'Unknown'
            if thc is None:
                thc = 'Unknown'
            if cbd is None:
                cbd = 'Unknown'
            strain = 'Unknown'

        
    #END OF ML CODE

       
    # Return the product details as a JSON response
    return jsonify({"confidence": str(confidence) + '%',
                    "product": str(product),
                    "brand": str(brand),
                    "thc": str(thc) + '%',
                    "cbd": str(cbd) + '%',
                    "strain": str(strain)})

    
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)