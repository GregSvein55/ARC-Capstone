from flask import Flask, jsonify, request
import tensorflow as tf
from PIL import Image
import numpy as np
import pandas as pd
import pytesseract
import cv2

app = Flask(__name__)

#pathToTesseract = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
pathToTesseract = "/usr/bin/tesseract"

# Read the CSV file into a DataFrame
df = pd.read_csv('modelProductList.csv')

# Get the unique values in the 'Product' column
class_labels = df['Product'].unique()




@app.route('/predict', methods=['POST'])
def predict():
    # Load TensorFlow Lite model
    interpreter_front = tf.lite.Interpreter(model_path="ARC_Model_Front_1.tflite")
    interpreter_front.allocate_tensors()
    input_details = interpreter_front.get_input_details()
    output_details = interpreter_front.get_output_details()
    
   # Get front input data from the request
    front_image = Image.open(request.files['front_image'])
    front_image.save("front_image.png") # save image as png
    front_image = Image.open("front_image.png")
    #rotate image 270 degrees
    front_image = front_image.rotate(270)

    # Get back input data from the request
    back_image = Image.open(request.files['back_image'])
    back_image.save("back_image.png") # save image as png
    back_image = Image.open("back_image.png")
    back_image = back_image.rotate(270)
    
    pytesseract.tesseract_cmd = pathToTesseract
    text = pytesseract.image_to_string(front_image)

    # Read the CSV file into a DataFrame
    df = pd.read_csv('ARCProductList.csv')

    # Split the text into a list of words
    words = text.split()

    checker = None
    product = None
    confidence = 0.0
    brand = None
    thc = None
    cbd = None
    strain = None
    
    # Iterate over the words with a sliding window
    for i in range(len(words)):
        for j in range(i+1, len(words)+1):
            checker = " ".join(words[i:j])
            if df[(df['Product'] == checker)].empty:
                continue
            else:
                # Get the rows where the 'Product' column is equal to the word
                row = df[(df['Product'] == checker)]
                confidence = 0.99
                product = row['Product'].values[0]
                brand = row['Brand'].values[0]
                thc = row['THC'].values[0]
                cbd = row['CBD'].values[0]
                strain = row['Type'].values[0]
    #END OF OCR CODE   
                 
    if product is None:
        
        front_image = cv2.imread("front_image.png")
        # Images sent to the CNN must be rotated 90 degrees counter-clockwise as
        # the data set it was trained on was rotated 90 degrees counter-clockwise
        front_image = cv2.rotate(front_image, cv2.ROTATE_90_COUNTERCLOCKWISE)
        
        #resizing image
        front_image = cv2.resize(front_image, (1008, 756))
        
        # Normalize the pixel values
        front_image = front_image / 255.0
        
        #perform inference
        input_data_front = np.array(front_image).reshape(1, 756, 1008, 3).astype(np.float32)
        interpreter_front.set_tensor(input_details[0]['index'], input_data_front)
        interpreter_front.invoke()
        front_predictions = interpreter_front.get_tensor(output_details[0]['index'])

        # Get the class with the highest probability
        class_index = np.argmax(front_predictions[0])

        # Get the class label
        class_label = class_labels[class_index]

        # Get the probability of the highest class
        confidence = front_predictions[0][class_index]
        
        # Get the rows where the 'Product' column is equal to the predicted class label
        row = df.loc[df['Product'] == class_label]

        product = row['Product'].values[0]
        brand = row['Brand'].values[0]
        thc = row['THC'].values[0]
        cbd = row['CBD'].values[0]
        strain = row['Type'].values[0]
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